import Shell from '@/components/Shell';
import '@/lib/dayjs';
import { ColorSchemeScript, createTheme, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { DatesProvider } from '@mantine/dates';
import '@mantine/dates/styles.css';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Répartition des soignants',
  description: "App de répartition des soignants pour l'APHP",
};

const theme = createTheme({
  breakpoints: { xs: '30em', sm: '48em', md: '64em', lg: '74em', xl: '90em' },
  autoContrast: true,
  cursorType: 'pointer',
  fontFamily: geistSans.style.fontFamily,
  fontFamilyMonospace: `${geistMono.style.fontFamily}`,
  fontSizes: { xs: '12px', sm: '14px', md: '16px', lg: '18px', xl: '20px' },
  respectReducedMotion: true,
  primaryColor: 'blue',
});

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang='fr' suppressHydrationWarning>
      <head>
        <ColorSchemeScript forceColorScheme='light' />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <DatesProvider settings={{ locale: 'fr', firstDayOfWeek: 1, consistentWeeks: true }}>
              <Notifications />
              <Shell>{children}</Shell>
            </DatesProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
