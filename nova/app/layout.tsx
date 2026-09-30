import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProviders from "@/lib/utils/queryProvider";
import GlobalModals from "@/components/ui/globalModals";
import Toast from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NovaShop — Shop the Latest. Live in Style.",
  description:
    "Discover trending products, top brands and exclusive deals all in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <QueryProviders>
            {children}
            <GlobalModals />
            <Toast />
        </QueryProviders>
      </body>
    </html>
  );
}
