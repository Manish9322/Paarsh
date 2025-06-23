import Image from "next/image";
import Link from 'next/link';
import type { Course } from "@/types/courseCard";

// ICONS
import { PiCertificateLight } from "react-icons/pi";
import { HiOutlineUsers } from "react-icons/hi2";
import { TbClockHour7 } from "react-icons/tb";
import { LiaSignalSolid } from "react-icons/lia";
import { IoLanguage } from "react-icons/io5";
import { useRouter } from "next/navigation";

const SingleCourse = ({ course, isGrid }: { course: Course; isGrid: boolean }) => {
  const {
    _id,
    id,
    title,
    courseName,
    tagline,
    paragraph,
    level,
    thumbnail,
    duration,
    lang,
    certificate,
    enrolledUsers,
    tags,
    availability, // New field
    category, // New field
    courseFees, // New field
    instructor, // New field
    keywords, // New field
    languages, // New field
    longDescription, // New field
    shortDescription // New field
  } = course;

  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/course?courseId=${_id}`);
  };

  return (
    <section className={`part-1 ${isGrid ? 'grid-item' : 'list-item list-none'}`}>
      <div className={`mx-auto ${isGrid ? 'grid' : 'flex flex-col'}`}>
        <div className={`flex ${isGrid ? 'flex-col lg:flex-row lg:space-x-12' : 'flex-col'}`}>
          <div className={` ${isGrid ? '' : ' border-b'}`}>
            <div className={`flex flex-col items-center space-y-8 ${isGrid ? '' : ' py-4'}`}>
              <div
                className={`w-full bg-white dark:bg-dark shadow-one dark:shadow-gray-dark rounded transition duration-300 hover:shadow-two dark:hover:shadow-gray-dark ${isGrid ? 'flex flex-col' : ' flex flex-col md:flex-row'}`} // Add list-card class for list view
                onClick={handleCardClick}
                style={{ cursor: "pointer" }}
              >

                <div className={`relative ${isGrid ? 'rounded-t-md w-full h-56' : 'w-1/2 h-64 mr-4'}`}>
                  <span className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 text-xs font-semibold capitalize text-white dark:text-white dark:bg-blue-600">
                    {category ? category : "No Tag"}
                  </span>

                  <Image
                    src={thumbnail || (Math.random() < 0.5 ? "/images/blog/blog-details-01.jpg" : "/images/blog/blog-details-02.jpg")}
                    alt={courseName}
                    fill
                    className={` ${isGrid ? 'rounded-t' : 'rounded-l w-1/2 h-64 mr-4'}`}
                    priority
                  />
                </div>


                <div className={`px-6 py-4 w-full ${isGrid ? 'flex flex-col justify-center' : 'py-0 text-start flex flex-col justify-center w-full md:w-1/2'}`}>
                  <h3 className={` ${isGrid ? ' text-xl font-bold text-black hover:text-primary dark:text-white dark:hover:text-primary sm:text-2xl' : 'text-start font-bold text-xl'}`}>
                    <Link href='/course'>
                      {courseName}
                    </Link>
                  </h3>
                  <p className={`py-4 mb-4 border-b font-medium text-body-color dark:text-gray-400 ${isGrid ? ' font-medium text-body-color dark:text-gray-400' : 'w-full'}`}>
                    {tagline}
                  </p>
                  <div className="flex flex-wrap">
                    <div className="mr-2 mb-2 w-fit items-center flex text-black bg-gray-200 rounded px-2 py-0.5 dark:bg-gray-600 dark:text-white">
                      <PiCertificateLight className="mr-1" />
                      <p className="text-xs py-1">{certificate ? "Certificate" : "No Certificate"}</p>
                    </div>

                    <div className="mr-2 mb-2 w-fit items-center flex text-black bg-gray-200 rounded px-2 py-0.5 dark:bg-gray-600 dark:text-white">
                      <TbClockHour7 className="mr-1" />
                      <p className="text-xs py-1">{duration}</p>
                    </div>
                    <div className="mr-2 mb-2 w-fit items-center flex text-black bg-gray-200 rounded px-2 py-0.5 dark:bg-gray-600 dark:text-white">
                      <LiaSignalSolid className="mr-1" />
                      <p className="text-xs py-1">{level}</p>
                    </div>
                    <div className="mr-2 mb-2 w-fit items-center flex text-black bg-gray-200 rounded px-2 py-0.5 dark:bg-gray-600 dark:text-white">
                      <HiOutlineUsers className="mr-1" />

                      <p className="text-xs py-1">
                        {Array.isArray(enrolledUsers)
                          ? `${enrolledUsers.length === 0 ? 1 : enrolledUsers.length} student${enrolledUsers.length === 1 ? '' : 's'}`
                          : typeof enrolledUsers === 'number'
                            ? `${enrolledUsers === 0 ? 1 : enrolledUsers} student${enrolledUsers === 1 ? '' : 's'}`
                            : "1 student"}
                      </p>

                    </div>
                    <div className="mr-2 mb-2 w-fit items-center flex text-black bg-gray-200 rounded px-2 py-0.5 dark:bg-gray-600 dark:text-white">
                      <IoLanguage className="mr-1" />
                      <p className="text-xs py-1">
                        {Array.isArray(languages)
                          ? languages.join(" | ") : typeof languages === "string" ? languages : "No Languages Available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SingleCourse;