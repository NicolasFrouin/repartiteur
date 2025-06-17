import { PrismaAdapter } from '@auth/prisma-adapter';
import { compareSync } from 'bcryptjs';
import NextAuth, { AuthError, CredentialsSignin, DefaultSession } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User } from './generated/client';
import prisma from './lib/prisma';
import { signInSchema } from './lib/utils/zod';

declare module 'next-auth' {
  interface Session {
    user: User & DefaultSession['user'];
  }
}

export const providers: Provider[] = [
  CredentialsProvider({
    id: 'credentials',
    name: 'Credentials',
    credentials: {
      email: { label: 'Adresse email', type: 'email', placeholder: 'john.doe@exemple.com' },
      password: { label: 'Mot de passe', type: 'password', placeholder: 'M0n5uP3rM0tD3p45s3' },
    },
    async authorize(credentials) {
      const signInParseResult = signInSchema.safeParse(credentials);
      if (!signInParseResult.success) {
        throw new CredentialsSignin(
          signInParseResult.error.errors.map((e) => e.message).join(', '),
        );
      }

      const { email, password } = signInParseResult.data;

      const user = await prisma.user.findUnique({
        where: { email, active: true },
        include: { accounts: true, sessions: true },
      });
      if (!user) {
        throw new CredentialsSignin('Identifiants incorrects');
      }
      if (!user.password || user.accounts.length > 0 || user.sessions.length > 0) {
        throw new AuthError('Connexion OAuth requise');
      }

      const isValid = compareSync(password, user.password);
      if (!isValid) {
        throw new CredentialsSignin('Identifiants incorrects');
      }

      return user;
    },
  }),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name || '';
        // @ts-expect-error ---
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email,
          name: token.name,
          role: token.role as User['role'],
        },
      };
    },
  },
});
