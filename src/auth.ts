import { PrismaAdapter } from '@auth/prisma-adapter';
import { compareSync } from 'bcrypt';
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
      console.log('CredentialsProvider authorize called with:', credentials);

      const signInParseResult = signInSchema.safeParse(credentials);

      if (!signInParseResult.success) {
        console.log('CredentialsSignin !signInParseResult.success');
        throw new CredentialsSignin(
          signInParseResult.error.errors.map((e) => e.message).join(', '),
        );
      }

      const { email, password } = signInParseResult.data;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.log('CredentialsSignin !user');
        throw new CredentialsSignin('Identifiants incorrects');
      }

      if (!user.password) {
        console.log('CredentialsSignin !user.password');
        throw new AuthError('Connexion OAuth requise');
      }

      const isValid = compareSync(password, user.password);

      if (!isValid) {
        console.log('CredentialsSignin !isValid');
        throw new CredentialsSignin('Identifiants incorrects');
      }

      console.log('User authenticated successfully:', user);

      return user;
    },
  }),
  // CredentialsProvider({
  //   id: 'credentials/signup',
  //   name: 'Credentials',
  //   credentials: {
  //     email: { label: 'Adresse email', type: 'email', placeholder: 'john.doe@exemple.com' },
  //     password: { label: 'Mot de passe', type: 'password', placeholder: 'M0n5uP3rM0tD3p45s3' },
  //   },
  //   async authorize(credentials) {
  //     const signInParseResult = signInSchema.safeParse(credentials);

  //     if (!signInParseResult.success) {
  //       throw new CredentialsSignin(
  //         signInParseResult.error.errors.map((e) => e.message).join(', '),
  //       );
  //     }

  //     const { email, password } = signInParseResult.data;

  //     const existingUser = await prisma.user.findUnique({ where: { email } });
  //     if (existingUser) {
  //       throw new CredentialsSignin('User already exists');
  //     }

  //     const hashedPassword = hashSync(password, 10);
  //     const newUser = await prisma.user.create({ data: { email, password: hashedPassword } });

  //     return newUser;
  //   },
  // }),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' /* , signOut: '/logout' */ },
  providers,
  callbacks: {
    async jwt({ token, user /* , account, profile, session, trigger */ }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name || '';
      }

      return token;
    },
    async session({ session, token, user /* , newSession, trigger */ }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          image: user?.image || null,
        },
      };
    },
  },
});
