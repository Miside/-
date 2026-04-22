import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我的第一个网站",
  description: "一个适合新手继续扩展的中文网站起步模板。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
