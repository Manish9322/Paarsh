"use client";

import { Suspense, useEffect } from "react";
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


// Service Worker Registration
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registered with scope:", registration.scope);
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
      
      // Add global flag for WebView detection
      const userAgent = navigator.userAgent.toLowerCase();
      // @ts-ignore - Add a global flag for WebView detection
      window.isWebViewApp = 
        userAgent.includes('wv') || 
        userAgent.includes('android') ||
        (userAgent.includes('mobile') && !userAgent.includes('safari'));
      
      // Force render modal in WebView
      if (
        userAgent.includes('wv') || 
        userAgent.includes('android') ||
        (userAgent.includes('mobile') && !userAgent.includes('safari'))
      ) {
        // Create a global method to force open modals
        // @ts-ignore - Creating global method
        window.forceOpenModals = true;
        
        // Inject a small script to help with WebView rendering
        const script = document.createElement('script');
        script.innerHTML = `
          // Tell WebView we're fully loaded
          if (window.AndroidInterface && window.AndroidInterface.onPageLoaded) {
            window.AndroidInterface.onPageLoaded();
          }
          // Mark document as ready for WebView
          document.documentElement.setAttribute('data-webview-ready', 'true');
        `;
        document.head.appendChild(script);
        
        // Add WebView-specific CSS
        const style = document.createElement('style');
        style.innerHTML = `
          /* WebView Modal Fix */
          .webview-modal {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            z-index: 99999 !important;
          }
          
          [data-webview-ready="true"] .webview-modal-anchor {
            display: block !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);


  return (
    <html suppressHydrationWarning lang="en">
       <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      
      <body className={`bg-[#FCFCFC] dark:bg-black ${inter.className}`}>
        <Suspense>
        <Provider store={store}>
          <Providers>
            <MainLayout>{children}
              <Toaster richColors />
            </MainLayout>
          </Providers>
        </Provider>
        </Suspense>
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
  const isDashboardPage = pathname.includes("/(dashboard)") || 
                         pathname.startsWith("/userdashboard") ||
                         pathname.startsWith("/total-courses") ||
                         pathname.startsWith("/ongoing-courses") ||
                         pathname.startsWith("/certificates") ||
                         pathname.startsWith("/question-bank") ||
                         pathname.startsWith("/profile") ||
                         pathname.startsWith("/refer-earn") ||
                         pathname.startsWith("/view-links") ||
                         pathname.startsWith("/faq");

  return (
    <>
      {!isAdminPage && !isAuthPage && !isDashboardPage && <Header />}
      {children}
      {!isAdminPage && !isAuthPage && !isDashboardPage && <Footer />}
      <ScrollToTop />
      <AutoModal />
      <Toaster richColors />
      <PurchaseModal />
    </>
  );
}
