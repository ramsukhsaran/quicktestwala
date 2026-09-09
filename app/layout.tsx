import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { StoreProvider } from "@/components/providers/store-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuickTestWala — India's Premier CBT Online Examination Portal",
  description:
    "Prepare smarter and perform better with developer-grade computer based mock tests for SSC CGL, Banking (IBPS/SBI PO), Railways (RRB NTPC), UPSC Prelims, and State PSCs.",
  keywords: [
    "government exam mock test",
    "SSC mock test",
    "banking mock test",
    "UPSC mock test",
    "railway mock test",
    "online test series",
    "government exam practice test",
    "CBT portal",
  ],
  authors: [{ name: "QuickTestWala Engineering" }],
  openGraph: {
    title: "QuickTestWala — India's Premier CBT Online Examination Portal",
    description:
      "Practice with realistic TCS-style CBT interface, negative marking, sectional analysis, and detailed step-by-step solutions.",
    type: "website",
    locale: "en_IN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <StoreProvider>
          <ThemeProvider defaultTheme="system" storageKey="quicktestwala-theme">
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
