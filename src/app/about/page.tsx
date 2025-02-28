import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";

// Added by MANISH SONAWANE
import AboutSectionThree from "@/components/About/AboutSectionThree";
import AboutSection from "@/components/AboutCards";
// Till Here

import Breadcrumb from "@/components/Common/Breadcrumb";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Page | Free Next.js Template for Startup and SaaS",
  description: "This is About Page for Startup Nextjs Template",
};

const AboutPage = () => {
  return (
    <>
      <Breadcrumb
        pageName={<>About <span className="text-blue-600">Paarsh Edu. Learning</span></>}
        description="Your ultimate learning platform to unlock knowledge, enhance skills, grow professionally, and shape a brighter future with smart, interactive, and effective education solutions."
      />

      <AboutSectionThree/>
      <AboutSectionOne />
      <AboutSectionTwo />
      <AboutSection/>


    </>
  );
};

export default AboutPage;
