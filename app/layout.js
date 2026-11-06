import { ThemeProvider } from './ThemeProvider';
import { Plus_Jakarta_Sans } from 'next/font/google';

// Added 'style: "normal"' to prevent the Next.js font loader parsing bug
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
  weight: ['400', '500', '600', '700', '800'],
  style: 'normal',
});

export const metadata = {
  metadataBase: new URL('https://jetpesa.briceka.com'),
  title: {
    default: 'JetPesa | Fly High & Cash Out Instantly',
    template: '%s | JetPesa',
  },
  description:
    'Experience real-time multiplier crash gaming with instant M-Pesa payouts. Join thousands of players in Kenya\'s premier Aviator-style betting platform.',
  keywords: [
    'JetPesa',
    'Aviator game Kenya',
    'crash game',
    'M-Pesa betting',
    'online betting Kenya',
    'multiplier game',
    'instant payout',
    'mobile betting',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://jetpesa.briceka.com',
    siteName: 'JetPesa',
    title: 'JetPesa | Fly High & Cash Out Instantly',
    description: 'Experience real-time multiplier crash gaming with instant M-Pesa payouts.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JetPesa | Fly High & Cash Out Instantly',
    description: 'Experience real-time multiplier crash gaming with instant M-Pesa payouts.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plusJakartaSans.variable} suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={plusJakartaSans.className}
        style={{
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
          minHeight: '100vh',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          backgroundColor: '#020617', // Ensures no white flash on dark mode load
          color: '#f8fafc',
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
