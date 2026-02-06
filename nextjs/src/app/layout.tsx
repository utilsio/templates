import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import React from "react";
import { UtilsioProvider } from "@utilsio/react/client";
import { getAuthHeadersAction } from "./actions";

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
          getAuthHeadersAction={getAuthHeadersAction}
        >
          {children}
        </UtilsioProvider>
      </body>
    </html>
  );
}
