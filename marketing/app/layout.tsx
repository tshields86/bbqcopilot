import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Source_Sans_3, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PostHogProvider } from '@/components/PostHogProvider';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-sans',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1A1A1A',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://bbqcopilot.com'),
  title: {
    default: 'BBQCopilot - AI-Powered BBQ Recipe & Cook Planning',
    template: '%s | BBQCopilot',
  },
  description:
    'Get personalized BBQ recipes tailored to YOUR grill, skill level, and time constraints. Stop searching for generic recipes—BBQCopilot creates custom cook plans for Kamado Joe, Weber, pellet smokers, and more.',
  keywords: [
    'BBQ recipes',
    'smoking meat',
    'BBQ cook planning',
    'AI recipe generator',
    'Kamado Joe recipes',
    'Weber recipes',
    'pellet smoker recipes',
    'brisket recipe',
    'pulled pork recipe',
    'BBQ timeline',
    'cook planner',
    'grilling app',
  ],
  authors: [{ name: 'BBQCopilot' }],
  creator: 'BBQCopilot',
  publisher: 'BBQCopilot',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bbqcopilot.com',
    siteName: 'BBQCopilot',
    title: 'BBQCopilot - AI-Powered BBQ Recipe & Cook Planning',
    description:
      'Get personalized BBQ recipes tailored to YOUR grill, skill level, and time constraints. Your AI pitmaster, ready when you are.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BBQCopilot - Your AI Pitmaster',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BBQCopilot - AI-Powered BBQ Recipe & Cook Planning',
    description:
      'Get personalized BBQ recipes tailored to YOUR grill. Your AI pitmaster, ready when you are.',
    images: ['/images/og-image.png'],
    creator: '@bbqcopilot',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://bbqcopilot.com',
  },
  category: 'Food & Cooking',
};

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BBQCopilot',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web, iOS, Android',
  description:
    'AI-powered BBQ recipe and cook planning app that creates personalized recipes based on your specific grill and equipment.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '100',
  },
  featureList: [
    'Equipment-specific BBQ recipes',
    'AI-powered cook timelines',
    'Skill level adaptation',
    'Cook history tracking',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${sourceSans.variable} ${jetbrains.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-body min-h-screen flex flex-col">
        <PostHogProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </PostHogProvider>
      </body>
    </html>
  );
}
