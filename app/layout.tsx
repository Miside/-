import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我的第一个网站",
  description: "一个带有简单后端接口的中文网站起步模板。",
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
