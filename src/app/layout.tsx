import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | LearnHub',
    default: 'LearnHub – Modern Learning Management System',
  },
  description:
    'LearnHub is a powerful LMS platform with YouTube-powered courses, progress tracking, and a seamless learning experience.',
  keywords: ['LMS', 'learning', 'courses', 'YouTube', 'education', 'online learning'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
