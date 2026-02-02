"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UtilsioProvider } from "@utilsio/react/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "utilsio Next.js Template",
  description: "Crypto subscription template powered by utilsio",
};

async function getAuthHeaders({
  deviceId,
  additionalData,
}: {
  deviceId: string;
  additionalData?: string;
}) {
  const response = await fetch("/api/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ deviceId, additionalData }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get auth headers: ${response.statusText}`);
  }

  return response.json();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UtilsioProvider
          utilsioBaseUrl={process.env.NEXT_PUBLIC_UTILSIO_APP_URL!}
          appId={process.env.NEXT_PUBLIC_UTILSIO_APP_ID!}
          getAuthHeadersAction={getAuthHeaders}
        >
          {children}
        </UtilsioProvider>
      </body>
    </html>
  );
}
