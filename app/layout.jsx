import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "PingFang SC",
    "Microsoft YaHei",
    "Heiti SC",
    "sans-serif",
  ],
});

export const metadata = {
  title: "影视无限",
  description: "影视播放平台",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.className} antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="bg-background-light text-gray-900 min-h-screen flex flex-col selection:bg-primary selection:text-white">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center w-full px-4 md:px-8 pb-12 pt-4">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
