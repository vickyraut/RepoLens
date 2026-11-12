import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import QueryProvider from "@/components/providers/query-provider";

const poppinsHeading = Poppins({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

const robotoSans = Roboto({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "RepoLens — Understand Your Codebase. See the Bigger Picture.",
    template: "%s | RepoLens",
  },
  description:
    "RepoLens is a developer-focused platform that helps developers explore, understand, and analyze code repositories.",
  applicationName: "RepoLens",
  openGraph: {
    title: "RepoLens — Understand Your Codebase. See the Bigger Picture.",
    description:
      "RepoLens is a developer-focused platform that helps developers explore, understand, and analyze code repositories.",
    siteName: "RepoLens",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "RepoLens — Understand Your Codebase. See the Bigger Picture.",
    description:
      "RepoLens is a developer-focused platform that helps developers explore, understand, and analyze code repositories.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        robotoSans.variable,
        poppinsHeading.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
