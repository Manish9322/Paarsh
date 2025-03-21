import Image from "next/image";
import SectionTitle from "../Common/SectionTitle";

const checkIcon = (
  <svg width="16" height="13" viewBox="0 0 16 13" className="fill-current">
    <path d="M5.8535 12.6631C5.65824 12.8584 5.34166 12.8584 5.1464 12.6631L0.678505 8.1952C0.483242 7.99994 0.483242 7.68336 0.678505 7.4881L2.32921 5.83739C2.52467 5.64193 2.84166 5.64216 3.03684 5.83791L5.14622 7.95354C5.34147 8.14936 5.65859 8.14952 5.85403 7.95388L13.3797 0.420561C13.575 0.22513 13.8917 0.225051 14.087 0.420383L15.7381 2.07143C15.9333 2.26669 15.9333 2.58327 15.7381 2.77854L5.8535 12.6631Z" />
  </svg>
);

const AboutSectionThree = () => {
  return (
    <section id="about" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="border-b border-body-color/[.15] pb-16 dark:border-white/[.15] md:pb-20 lg:pb-28">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-1/2">
              <SectionTitle
                title={<span><span className='text-blue-600'>Transforming Education</span> with Web Experiences.</span>}
                paragraph="Seamless course management with flexible pricing, user-friendly interface, and lifetime access."
                mb="44px"
              />

              <div className="mb-12 max-w-[570px] lg:mb-0" data-wow-delay=".15s">
                <p className="mb-5 text-lg text-body-color">
                  <span className="text-blue-600 font-bold">Paarsh Edu. Learning</span> is a leading online learning platform based in Nashik, India, established in 2018.
                  We offer high-quality web development and IT training solutions designed to empower learners in the digital world.
                  Our mission is not just to provide knowledge but to create an engaging and transformative learning experience.
                  We believe in building lasting relationships with our learners and fostering a strong foundation for personal and professional growth.
                </p>

                <p className="mb-5 text-lg text-body-color">
                  At Paarsh Edu. Learning, we measure our success by the success of our learners. We provide expert-led courses, mentorship, and
                  hands-on training opportunities. Additionally, we offer internships for computer science students, allowing them to gain real-world experience
                  through live projects. This practical exposure helps them stand out in job interviews and prepares them for a successful career in the industry.
                </p>
              </div>

            </div>

            <div className="w-full px-4 lg:w-1/2">
              <div className="relative mx-auto aspect-[25/24] max-w-[500px] lg:mr-0">
                <Image
                  src="/images/about/ABOUT3.jpg"
                  alt="about-image"
                  fill
                  className="mx-auto max-w-full rounded drop-shadow-three dark:hidden dark:drop-shadow-none lg:mr-0"
                />
                <Image
                  src="/images/about/ABOUT3-DARK.png"
                  alt="about-image"
                  fill
                  className="mx-auto hidden max-w-full rounded drop-shadow-three dark:block dark:drop-shadow-none lg:mr-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionThree;