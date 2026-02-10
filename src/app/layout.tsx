import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Centra - あなたのデータを、あなたの手に",
  description: "個人データを一元管理し、安全に外部サービスと連携できるプラットフォーム",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${notoSansJP.variable} antialiased min-h-screen`}
        style={{
          background: 'var(--bg-primary)',
          fontFamily: 'var(--font-family)',
        }}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
