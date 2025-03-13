"use client";

import SingleCourse from "../../app/newcourses/SingleCourse";
import { ThemeAwareSkeleton } from "@/components/ui/theme-aware-skeleton";
import { SkeletonThemeProvider } from "@/components/ui/skeleton-theme-provider";
import "react-loading-skeleton/dist/skeleton.css";
import { useFetchCourcesQuery } from "@/services/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const IntervalCarousel = () => {
  const { data: coursesData, error } = useFetchCourcesQuery(undefined);
  const isLoading = !coursesData;

  const displayedCourses = coursesData?.data || [];

  return (
    <SkeletonThemeProvider>
      <div className="main-container px-4 my-14 sm:px-10">
        <div className="w-full mx-auto text-center pt-10 mb-6" style={{ maxWidth: "570px" }}>
          <h2 className="mb-4 text-3xl font-bold !leading-tight text-black dark:text-white sm:text-4xl md:text-[45px]">
            Top Courses
          </h2>
          <p className="text-base !leading-relaxed text-body-color md:text-lg">
            Discover top courses to elevate your skills and unlock new opportunities for personal growth.
          </p>
        </div>

        <div className="lg:flex">
          <section id="courses" className="part-1 mx-auto md:pt-8">
            <div className="container">
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                navigation
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={true}
                speed={1500}
                effect="slide"
                className="mySwiper"
              >
                {isLoading
                  ? Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <SwiperSlide key={index} className="w-full">
                        <div className="w-full rounded-lg p-4 shadow dark:bg-gray-800">
                          <ThemeAwareSkeleton height={200} width="100%" className="rounded-lg" />
                          <ThemeAwareSkeleton height={20} width="80%" className="mt-4" />
                          <ThemeAwareSkeleton height={10} width="60%" className="mt-4" />
                        </div>
                      </SwiperSlide>
                    ))
                  : displayedCourses.map((course) => (
                    <SwiperSlide key={course.id ?? course.courseName} className="w-full">
                      <SingleCourse course={course} isGrid={true} />
                    </SwiperSlide>
                  ))}
              </Swiper>
            </div>
          </section>
        </div>
      </div>
    </SkeletonThemeProvider>
  );
};

export default IntervalCarousel;