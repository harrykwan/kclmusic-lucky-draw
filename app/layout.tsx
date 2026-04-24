import type { Metadata } from "next";
export const metadata: Metadata = { title: "KCL Music 抽獎", description: "KCL Music Lucky Draw" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-HK"><body>{children}</body></html>;
}
