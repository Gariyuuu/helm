import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AccentProvider } from "@/components/theme/accent-provider";
import { BackgroundProvider } from "@/components/theme/background-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Helm — Personal Command Center",
  description: "The chief of staff for your entire life.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider dynamic>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <ThemeProvider>
            <AccentProvider>
              <BackgroundProvider>
                <TooltipProvider>{children}</TooltipProvider>
                <Toaster />
              </BackgroundProvider>
            </AccentProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
