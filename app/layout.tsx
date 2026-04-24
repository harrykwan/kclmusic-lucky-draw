import type { Metadata } from "next";
export const metadata: Metadata = { title: "Harry Kwan 抽獎", description: "Harry Kwan Lucky Draw" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-HK"><body>{children}</body></html>;
}
