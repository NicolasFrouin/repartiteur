import Shell from '@/components/Shell';
import { ColorSchemeScript, createTheme, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { PropsWithChildren } from 'react';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Répartition des soignants',
  description: "App de répartition des soignants pour l'APHP",
};

const theme = createTheme({
  breakpoints: { xs: '30em', sm: '48em', md: '64em', lg: '74em', xl: '90em' },
});

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Props extends PropsWithChildren {}

export default function RootLayout({ children }: Props) {
  return (
    <html lang='fr' suppressHydrationWarning>
      <head>
        <ColorSchemeScript forceColorScheme='light' />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <MantineProvider theme={theme}>
          <Shell>{children}</Shell>
        </MantineProvider>
      </body>
    </html>
  );
}
