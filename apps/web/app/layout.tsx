import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoffeeAtlas — Discover the World of Coffee',
  description: 'CoffeeAtlas is your comprehensive coffee discovery platform. Explore thousands of specialty coffee beans, discover exceptional roasters, and build your perfect coffee journey.',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
