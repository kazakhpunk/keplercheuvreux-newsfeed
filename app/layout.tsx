import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'News Feed',
  description: 'Embeddable news feed',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
