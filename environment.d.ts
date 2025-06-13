namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT: string;
    AUTH_SECRET: string;
    PRISMA_LOG?: string;
    NEXT_PUBLIC_ADMIN_CONTACT_EMAIL?: string;
  }
}
