import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import TimerWrapper from './components/TimerWrapper';

// Use Space Mono as a fallback since Martian Mono is not directly available through next/font/google
const martianMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Renew Home Presentation",
  description: "Slides for Renew Home presentation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${martianMono.variable} antialiased`}
      >
        {children}
        <TimerWrapper />
      </body>
    </html>
  );
}
