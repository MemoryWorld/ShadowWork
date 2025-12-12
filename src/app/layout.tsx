import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShadowWork - Privacy-First Technical Assessment',
  description: 'Zero-Resume, Proof-of-Work, Zero-IP-Risk coding challenges',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

