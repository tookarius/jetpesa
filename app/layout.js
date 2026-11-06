import { ThemeProvider } from './ThemeProvider';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Direct Google Fonts link completely bypasses the buggy next/font loader */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
          minHeight: '100vh',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          backgroundColor: '#020617', // Prevents white flash on dark mode load
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
