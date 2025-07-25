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
import TrackVisitor from "../components/TrackVisitors/TrackVisitors";
import AuthInitializer from "../components/AuthIntializer";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {

 useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js") // ✅ This is what next-pwa builds from custom-sw.js
          .then((registration) => {
            console.log("✅ Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.error("❌ Service Worker registration failed:", error);
          });
      });
    }
  }, []);


  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <title>Paarsh Edu : Solution for Better Learning.</title>
        <meta name="description" content="Join Paarsh Edu and kickstart your learning journey today!" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Paarsh Edu : Solution for Better Learning." />
        <meta property="og:description" content="Join Paarsh Edu and kickstart your learning journey today!" />
        <meta property="og:url" content="https://paarshedu.com" />
        <meta property="og:site_name" content="Paarsh Edu" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://paarshedu.com/PaarshEdu/uploads/1750829515742-thumbnail.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Paarsh Edu - Learn Smarter" />

        <link rel="manifest" href="/manifest.json" />
        <meta
          name="google-site-verification"
          content="SJK3Jxq1TFmLKiRR9oEByekMdQJn4xaK8OAW0xfij1g"
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-NXH8DKK59X"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-NXH8DKK59X');
            `,
          }}
        />
      </head>
      <body className={`bg-[#FCFCFC] dark:bg-black ${inter.className}`}>

        <Suspense>
          <Provider store={store}>
            <Providers>
              <AuthInitializer>
                <MainLayout>{children}
                  <TrackVisitor />
                  <Toaster richColors />
                </MainLayout>
              </AuthInitializer>
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

  console.log("isAuthenticated:from MainLayout", isAuthenticated);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const sessionId = localStorage.getItem("sessionId");

    if (storedAccessToken && !isAuthenticated) {
      dispatch(
        setAuthData({
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          user: null, // Fetch user details later if needed
          sessionId,
        })
      );
    }
  }, [dispatch, isAuthenticated]);

  const isAgentPage = pathname?.startsWith("/agent");
  const isErrorPage = pathname === "/error";
  const isAuthPage = ["/signin", "/signup", "/forgot-password", "/reset-password"].includes(pathname ?? "");
  const isAdminPage = pathname?.startsWith("/admin") ?? false;
  const isDashboardPage = pathname?.includes("/(dashboard)") ||
    pathname?.startsWith("/userdashboard") ||
    pathname?.startsWith("/total-courses") ||
    pathname?.startsWith("/ongoing-courses") ||
    pathname?.startsWith("/certificates") ||
    pathname?.startsWith("/question-bank") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/refer-earn") ||
    pathname?.startsWith("/user-wallet") ||
    pathname?.startsWith("/view-links") ||
    pathname?.startsWith("/faq") ||
    pathname?.startsWith("/course-lecture") ||
    pathname?.startsWith("/delete-account") ||
    pathname?.startsWith("/aptitude-test");
  return (
    <>
   
      {!isAdminPage && !isAuthPage && !isDashboardPage && !isErrorPage && !isAgentPage && <Header />}
      {children}
      {!isAdminPage && !isAuthPage && !isDashboardPage && !isErrorPage && !isAgentPage && <Footer />}
      <ScrollToTop />
      {!isAdminPage && !isAuthPage && !isErrorPage && !isAgentPage && <AutoModal />}
      <Toaster richColors />
      <PurchaseModal />
    </>
  );
}
