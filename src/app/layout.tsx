import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import ChatBot from "@/components/ChatBot/ChatBot";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jhon Verille | Portfolio",
  description: "Frontend Architect & 3D Web Experience Designer",
  icons: {
    icon: [
      { url: "/logo.png" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jetbrainsMono.variable}>
        <AuthProvider>
          {children}
          <ChatBot />
        </AuthProvider>
      </body>
    </html>
  );
}
