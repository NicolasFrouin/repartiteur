export { auth as middleware } from '@/auth';

export const config = {
  matcher: ['/[^api|.well-known|_next|favicon.ico|assets|static|public|robots.txt]'],
};
