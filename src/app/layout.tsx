"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthData } from "../lib/slices/userAuthSlice";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Inter } from "next/font/google";
import "node_modules/react-modal-video/css/modal-video.css";
import "../styles/index.css";
import AutoModal from "@/components/AutoModal/AutoModal";
import { store } from "../lib/store";
import { Providers } from "./providers";
import PurchaseModal from "@/components/PurchaseModal";
import { Provider } from "react-redux";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body className={`bg-[#FCFCFC] dark:bg-black ${inter.className}`}>
        <Provider store={store}>
          <Providers>
            <MainLayout>{children}</MainLayout>
          </Providers>
        </Provider>
      </body>
    </html>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const { isAuthenticated } = useSelector((state: any) => state.userAuth);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedAccessToken && !isAuthenticated) {
      dispatch(
        setAuthData({
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          user: null, // Fetch user details later if needed
        })
      );
    }
  }, [dispatch, isAuthenticated]);

  const isAuthPage = ["/signin", "/signup"].includes(pathname);
  const isAdminPage = pathname.startsWith("/admin");

  if (isAuthenticated && isAuthPage) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard"; // Redirect to dashboard
    }
    return null;
  }

  return (
    <>
      {!isAdminPage && !isAuthPage && <Header />}
      {children}
      {!isAdminPage && !isAuthPage && <Footer />}
      <ScrollToTop />
      <AutoModal />
      <Toaster richColors />
      <PurchaseModal />
    </>
  );
}
