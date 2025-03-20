import Image from "next/image";

const AboutSectionTwo = () => {
  return (
    <section className="py-16 md:py-20 lg:py-28">
      <div className="container">

        <h1 className=" text-center mb-4 text-5xl font-bold leading-tight text-black dark:text-white">
          <span className="text-blue-500">Strategies</span>  for Student
        </h1>
        <p className="w-3/4 mx-auto text-center text-base !leading-relaxed text-body-color md:text-lg lg:mb-10 ">
          Smart strategies to boost student success—time management, productivity hacks, and study techniques for better learning, focus, and academic excellence!</p>

        <div className="-mx-4 flex flex-wrap items-center">
          <div className="w-full px-4 lg:w-1/3">
            <div
              className="relative mx-auto mb-12 aspect-[25/24] max-w-[500px] text-center lg:m-0"
              data-wow-delay=".15s"
            >
              <Image
                src="/images/about/ABOUT2.jpg"
                alt="about image"
                fill
                className="drop-shadow-three rounded dark:hidden dark:drop-shadow-none"
              />
              <Image
                src="/images/about/ABOUT2-DARK.png"
                alt="about image"
                fill
                className="hidden drop-shadow-three rounded dark:block dark:drop-shadow-none"
              />
            </div>
          </div>
          <div className="w-full px-8 lg:w-1/3">
            <div className="max-w-[470px]">
              <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Remote Classrooms
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Run and Manage Interactive webinars to permit a personalized
                  learning experience.
                </p>
              </div>
              <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Course Manager
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Manage the courses your learners study from different sources
                  and follow them to their individual needs.
                </p>
              </div>
              <div className="mb-1">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Paarsh E-Learn
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Provide video, documents, or external links like Youtube-based
                  internal training to complete the pieces of training.
                </p>
              </div>
            </div>
          </div>

          {/* Third Section - Text Content 2 */}
          <div className="w-full px-8 lg:w-1/3">
            <div className="max-w-[470px]">
              <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Scalable Pricing
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Customize our flexible pricing strategies to suit our
                  learners needs and budget.
                </p>
              </div>
              <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  Certificates
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Automatically add achievement certificates to the learner’s
                  education tracker whether studied online, offline, or via
                  Google Meet.
                </p>
              </div>

              <div className="mb-9">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                  24/7 Support
                </h3>
                <p className="text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                  Create an in-person or a virtual classroom session and track
                  the attendance by Online Google Sheet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionTwo;
