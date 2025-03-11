"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Inter } from "next/font/google";
import "node_modules/react-modal-video/css/modal-video.css";
import "../styles/index.css";
import AutoModal from "@/components/AutoModal/AutoModal";
import {makeStore} from "../lib/store";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdminPage = pathname.startsWith("/admin");
  const isSigninPage = pathname.startsWith("/signin");
  const isSignupPage = pathname.startsWith("/signup");
  const isDashboardPage = pathname.startsWith("/userdashboard");
  return (
    <html suppressHydrationWarning lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />

      <body className={`bg-[#FCFCFC] dark:bg-black ${inter.className}`}>
      <Provider store={makeStore}>
        <Providers>  
        {!(isAdminPage  || isSigninPage || isSignupPage || isDashboardPage)&& <Header />} {/* Hide header on admin pages */}
          {children}
          {!(isAdminPage  || isSigninPage || isSignupPage || isDashboardPage) && <Footer />} {/* Hide footer on admin pages */}
          <ScrollToTop />
          <AutoModal/>
          <Toaster richColors />
          <PurchaseModal />
        </Providers>
        </Provider>
      </body>
    </html>
  );
}

import { Providers } from "./providers";
import PurchaseModal from "@/components/PurchaseModal";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { Toaster } from "sonner";

