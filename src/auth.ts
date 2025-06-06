import { PrismaAdapter } from '@auth/prisma-adapter';
import { compareSync, hashSync } from 'bcrypt';
import NextAuth, { CredentialsSignin, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from './lib/prisma';
import { signInSchema } from './lib/utils/zod';
import { User } from './generated/client';

declare module 'next-auth' {
  interface Session {
    user: User & DefaultSession['user'];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/signin', signOut: '/admin/signout' },
  providers: [
    CredentialsProvider({
      id: 'credentials/signin',
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

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          throw new CredentialsSignin('Wrong credentials');
        }

        if (!user.password) {
          throw new CredentialsSignin('User should login with OAuth');
        }

        const isValid = compareSync(password, user.password);

        if (!isValid) {
          throw new CredentialsSignin('Wrong credentials');
        }

        return user;
      },
    }),
    CredentialsProvider({
      id: 'credentials/signup',
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

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          throw new CredentialsSignin('User already exists');
        }

        const hashedPassword = hashSync(password, 10);
        const newUser = await prisma.user.create({ data: { email, password: hashedPassword } });

        return newUser;
      },
    }),
  ],
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
