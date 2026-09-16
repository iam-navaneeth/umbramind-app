import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UmbraMind | Intelligent AI Umbrella Prediction Model",
  description: "Predict whether you need an umbrella by combining real-time weather forecasts with your personal commute behavior history and machine learning.",
  keywords: ["Umbrella Prediction", "Machine Learning", "Weather AI", "Commute Weather", "Vercel Web App"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070a12] text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
