import Image from "next/image";
import type { Course } from "@/types/courseCard";

// ICONS
import { PiCertificateLight } from "react-icons/pi";
import { HiOutlineUsers } from "react-icons/hi2";
import { TbClockHour7 } from "react-icons/tb";
import { LiaSignalSolid } from "react-icons/lia";
import { IoLanguage } from "react-icons/io5";


const SingleCourse = ({ course, isGrid }: { course: Course; isGrid: boolean }) => {
  const { title, paragraph, level, image, courseDuration, lang, certificate, student, tags } = course;

  return (
    <section className={`part-1 ${isGrid ? 'grid-item' : 'list-item list-none'}`}>
      <div className={`container mx-auto ${isGrid ? 'grid' : 'flex flex-col'}`}>
        <div className={`flex ${isGrid ? 'flex-col lg:flex-row lg:space-x-12' : 'flex-col'}`}>
          <div className={` ${isGrid ? '' : ' border-b'}`}>
            <div className={`flex flex-col items-center space-y-8 ${isGrid ? '' : ' py-4'}`}>
              <div
                className={`w-full bg-white dark:bg-dark shadow-one dark:shadow-gray-dark rounded-lg transition duration-300 hover:shadow-two dark:hover:shadow-gray-dark ${isGrid ? 'flex flex-col' : ' flex flex-row'}`} // Add list-card class for list view
              >

                <div className={`w-full relative ${isGrid ? 'h-40 object-cover ' : 'h-30 mr-4'}`}>

                  <span className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 text-xs font-semibold capitalize text-white dark:text-black">
                    {tags[0]}
                  </span>

                  <Image
                    src={image}
                    alt={title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-tl rounded-tr"
                    priority
                  />
                </div>

                <div className={`px-6 py-4 w-full ${isGrid ? 'flex flex-col justify-center' : 'py-0 text-start flex flex-col justify-center w-1/2'}`}>
                  <h3 className={` ${isGrid ? ' text-xl font-bold text-black hover:text-primary dark:text-white dark:hover:text-primary sm:text-2xl' : 'text-start font-bold text-xl'}`}>
                    {title}
                  </h3>
                  <p className={`py-4 mb-4 border-b font-medium text-body-color dark:text-gray-400 ${isGrid ? ' font-medium text-body-color dark:text-gray-400' : 'w-fit'}`}>
                    {paragraph}
                  </p>

                  {/* <div className="mr-4 w-full flex justify-between items-center">
                    <h4 className="mb-2 text-sm font-medium text-dark dark:text-white">
                      Certificate
                    </h4>
                    <p className="text-xs text-blue-400 bg-blue-200 font-bold rounded px-2 py-0.5">{certificate}</p>
                  </div>

                  <div className="mr-4 w-full flex justify-between items-center">
                    <h4 className="mb-2 text-sm font-medium text-dark dark:text-white">
                      Languages
                    </h4>
                    <p className="text-xs text-blue-400 bg-blue-200 font-bold rounded px-2 py-0.5">{lang}</p>
                  </div>

                  <div className="mr-4 w-full flex justify-between items-center">
                    <h4 className="mb-2 text-sm font-medium text-dark dark:text-white">
                      Students
                    </h4>
                    <p className="text-xs text-blue-400 bg-blue-200 font-bold rounded px-2 py-0.5">{student}</p>
                  </div>

                  <div className="mr-4 w-full flex justify-between items-center">
                    <h4 className="mb-2 text-sm font-medium text-dark dark:text-white">
                      Level
                    </h4>
                    <p className="text-xs text-blue-400 bg-blue-200 font-bold rounded px-2 py-0.5">{level}</p>
                  </div>

                  <div className="mr-4 w-full flex justify-between items-center">
                    <h4 className="mb-2 text-sm font-medium text-dark dark:text-white">
                      Duration
                    </h4>
                    <p className="text-xs text-blue-400 bg-blue-200 font-bold rounded px-2 py-0.5">{courseDuration}</p>
                    </div> */}

                  <div className="flex flex-wrap">
                    <div className="mr-2 mb-2 w-fit items-center flex text-blue-400 bg-blue-200 rounded px-2 py-0.5 dark:bg-gray-600 dark:text-white">
                      <PiCertificateLight className="mr-1" />
                      <p className="text-xs py-1">{certificate}</p>
                    </div>
                    <div className="mr-2 mb-2 w-fit items-center flex text-blue-400 bg-blue-200 rounded px-2 py-0.5 dark:bg-gray-600 dark:text-white">
                      <HiOutlineUsers className="mr-1" />
                      <p className="text-xs py-1">{student}</p>
                    </div>
                    <div className="mr-2 mb-2 w-fit items-center flex text-blue-400 bg-blue-200 rounded px-2 py-0.5 dark:bg-gray-600 dark:text-white">
                      <TbClockHour7 className="mr-1" />
                      <p className="text-xs py-1">{courseDuration}</p>
                    </div>
                    <div className="mr-2 mb-2 w-fit items-center flex text-blue-400 bg-blue-200 rounded px-2 py-0.5 dark:bg-gray-600 dark:text-white">
                      <LiaSignalSolid className="mr-1" />
                      <p className="text-xs py-1">{level}</p>
                    </div>
                    <div className="mr-2 mb-2 w-fit items-center flex text-blue-400 bg-blue-200 rounded px-2 py-0.5 dark:bg-gray-600 dark:text-white">
                      <IoLanguage className="mr-1" />
                      <p className="text-xs py-1">{lang}</p>
                    </div>
                  </div>

                </div>


                {/* SOME DIFFERENT STYLE OF STATS DISPLAY */}

                {/* <div className="flex justify-between items-center p-4 border-body-color border-opacity-10 dark:border-white dark:border-opacity-10">
                    <div className="w-full flex items-center justify-between border-body-color border-opacity-10 dark:border-white dark:border-opacity-10 ">
                      <div className="w-full flex justify-between">
                        <div className="w-1/2 pr-4 border-r">
                          <h4 className="mb-2 text-sm font-medium text-dark dark:text-white">
                            Level
                          </h4>
                          <p className="text-xs text-body-color">{level}</p>
                        </div>
                        <div className="ml-4 w-1/2">
                          <h4 className="mb-2 text-sm font-medium text-dark dark:text-white">
                            Duration
                          </h4>
                          <p className="text-xs text-body-color">{courseDuration}</p>
                        </div>
                      </div>
                    </div>
                  </div> */}


              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SingleCourse;