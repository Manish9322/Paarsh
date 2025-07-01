import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Blog from "@/components/Blog";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import TopCources from "@/components/TopCources"
// import Courses from "@/components/PopularCourses/Course";
import Hero from "@/components/Hero";
// import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Video from "@/components/Video";
import { Metadata } from "next";
import CoursesPage from "@/components/Courses/Courses";
import SubscribeNewsletter from "@/components/SubscribeStripe/SubscribeStripe";

export const metadata: Metadata = {
  title: "Paarsh Edu : Solution for Better Learning.",
  description: "Join Paarsh Edu and kickstart your learning journey today!",
  openGraph: {
    title: "Paarsh Edu : Solution for Better Learning.",
    description: "Join Paarsh Edu and kickstart your learning journey today!",
    url: "https://paarshedu.com",
    siteName: "Paarsh Edu",
    type: "website",
    images: [
      {
        url: "https://paarshedu.com/PaarshEdu/uploads/1750829515742-thumbnail.png", // 🔁 Must be publicly accessible full URL
        width: 1200,
        height: 630,
        alt: "Paarsh Edu - Learn Smarter",
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      {/* <Features /> */}
      <TopCources />
      <CoursesPage />
      {/* <Courses/> */}
      <Video />
      <Brands />
      <AboutSectionOne />
      <AboutSectionTwo />
      <Testimonials />
      <Blog />
      <SubscribeNewsletter/>
    </>
  );
}
