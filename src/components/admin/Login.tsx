import { signIn } from '@/auth';

export default function Login() {
  return (
    <form
      action={async (data) => {
        'use server';

        await signIn('credentials/signin', { redirect: false, ...data });
      }}
    >
      <label htmlFor='email'>Email:</label>
      <input type='email' id='email' name='email' />
      <label htmlFor='password'>Password:</label>
      <input type='password' id='password' name='password' />
      <button type='submit'>Sign In</button>
    </form>
  );
}
