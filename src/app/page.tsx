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
import Courses from "./newcourses/page";
import SubscribeNewsletter from "@/components/SubscribeStripe/SubscribeStripe";

export const metadata: Metadata = {
  title: "Paarsh Edu : Solution for Better Learning.",
  description: "This is a Home for New Learners.",
  // other metadata
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
