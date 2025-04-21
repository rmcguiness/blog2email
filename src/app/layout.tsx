import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/NavBar/Navbar";

export const metadata: Metadata = {
  title: "Blog2Email - Get blog updates in your inbox",
  description: "Subscribe to your favorite blogs and receive email notifications when new posts are published.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased bg-(--gray-50) min-h-screen`}
      >
        <Navbar />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
