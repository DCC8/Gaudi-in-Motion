import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google"; // Import only JetBrains Mono
import "./globals.css";

// Configure JetBrains Mono
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "500", "800"], // Low, Medium, ExtraBold as requested
});

export const metadata: Metadata = {
  title: "GAUDÍ IN MOTION",
  description: "Immersive WebGL Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
