import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./layout/sidebar";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ModeToggle } from "./layout/theme-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MicroFab Lab",
  description: "Sensor Dashboard for York University Mircofabrication labs",
  icons: "/YorkULogo_DIGITAL_Ver_RGB.svg"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'system';
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  document.documentElement.classList.add(theme === 'system' ? systemTheme : theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
              <header className="flex h-17 shrink-0 items-center gap-2 border-b px-4">
                <div><SidebarTrigger className="-m1-1"/></div>
                <div>York University Microfabrication Lab</div>
                <div className="ml-auto"><ModeToggle/></div>
              </header>
              <main>
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        <Toaster position="top-right" richColors />
        </ThemeProvider>
       
      </body>
    </html>
  );
}
