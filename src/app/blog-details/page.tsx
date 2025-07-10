"use client";

import SharePost from "@/components/Blog/SharePost";
import Image from "next/image";
import { SlCalender } from "react-icons/sl";
import TagButton from "@/components/Blog/TagButton";
import { Blog } from "@/types/blog";
import ModelOne from "@/components/View-Models/modelOne";
import RelatedPost from "@/components/Blog/RelatedPost";
import ModelTwo from "@/components/View-Models/modelTwo";
import Link from "next/link";
import { useFetchBlogByIdQuery, useFetchBlogsQuery } from "@/services/api";
import { useSearchParams } from "next/navigation";
import SideBlogs from "@/components/Blog/SideBlogs";
import DOMPurify from "dompurify";

const BlogDetailsPage = () => {
  const params = useSearchParams();
  const blogId = params?.get("blogId");

  console.log("blogId : ", blogId);

  const {
    data: allBlogsData,
    isLoading: allBlogsLoading,
    error: allBlogsError,
  } = useFetchBlogsQuery(undefined);

  console.log("allBlogsData : ", allBlogsData);

  // Extract blogs array from the query data
  const shuffledBlogs = [...(allBlogsData?.blogs || allBlogsData || [])]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const {
    data: blogsData,
    isLoading: blogsLoading,
    error: blogsError,
  } = useFetchBlogByIdQuery(blogId, { skip: !blogId });
  const blogs = blogsData?.blogs || [];
  console.log("blogs Data : ", blogsData);
  console.log("Author Name : ", blogsData?.blog?.author?.name);

  const date = new Date(blogsData?.blog?.createdAt);
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Sanitize HTML content
  const sanitizedContent = blogsData?.blog?.paragraph
    ? DOMPurify.sanitize(blogsData.blog.paragraph)
    : "";

  return (
    <>
      <style jsx>{`
        .sticky-sidebar {
          position: sticky;
          top: 5rem; /* Adjusted for better visibility */
          align-self: flex-start;
        }
        .container {
          min-height: 100vh;
        }
      `}</style>
      <section className="pb-[120px] pt-[150px]">
        <div className="container min-h-screen">
          <div className="-mx-4 flex flex-wrap justify-center">
            {/* Main Blog Section */}
            <div className="w-full lg:w-2/3">
              <div className="p-8">
                {blogsLoading ? (
                  <>
                    {/* Skeleton for Title */}
                    <div className="mb-8 h-10 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700 sm:h-12"></div>
                    {/* Skeleton for Author and Date */}
                    <div className="mb-10 flex flex-wrap items-center justify-between border-b border-body-color border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
                      <div className="flex flex-wrap items-center">
                        <div className="mb-5 mr-10 flex items-center">
                          <div className="mr-4 h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                          <div className="w-full">
                            <div className="mb-1 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                          </div>
                        </div>
                        <div className="mb-5 flex items-center">
                          <div className="mr-5 flex items-center">
                            <div className="mr-3 h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-5 h-8 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    {/* Skeleton for Featured Image */}
                    <div className="mb-10 w-full overflow-hidden rounded">
                      <div className="relative aspect-[97/60] w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700 sm:aspect-[97/44]"></div>
                    </div>
                    {/* Skeleton for Content */}
                    <div className="mb-8 space-y-4">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    {/* Skeleton for Tags and Share */}
                    <div className="items-center justify-between sm:flex">
                      <div className="mb-5">
                        <div className="mb-3 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="flex flex-wrap items-center gap-2">
                          {[...Array(3)].map((_, index) => (
                            <div
                              key={index}
                              className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
                            ></div>
                          ))}
                        </div>
                      </div>
                      <div className="mb-5">
                        <div className="mb-3 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700 sm:ml-auto"></div>
                        <div className="flex items-center space-x-2 sm:ml-auto">
                          {[...Array(3)].map((_, index) => (
                            <div
                              key={index}
                              className="h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="mb-8 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight">
                      {blogsData?.blog?.title}
                    </h1>
                    <div className="mb-10 flex flex-wrap items-center justify-between border-b border-body-color border-opacity-10 pb-4 dark:border-white dark:border-opacity-10">
                      <div className="flex flex-wrap items-center">
                        <div className="mb-5 mr-10 flex items-center">
                          <div className="mr-4">
                            <div className="relative h-10 w-10 overflow-hidden rounded-full">
                              <Image
                                src={
                                  blogsData?.blog?.author?.image ||
                                  "/images/blog/blog-details-01.jpg"
                                }
                                alt="author"
                                fill
                              />
                            </div>
                          </div>
                          <div className="w-full">
                            <span className="mb-1 text-base font-medium text-body-color">
                              By <span>{blogsData?.blog?.author?.name}</span>
                            </span>
                          </div>
                        </div>
                        <div className="mb-5 flex items-center">
                          <p className="mr-5 flex items-center text-base font-medium text-body-color">
                            <span className="mr-3">
                              <SlCalender size={16} />
                            </span>
                            {formattedDate}
                          </p>
                        </div>
                      </div>
                      <div className="mb-5">
                        <Link
                          href="/contact"
                          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Get In Touch
                        </Link>
                      </div>
                    </div>
                    <div className="mb-10 w-full overflow-hidden rounded">
                      <div className="relative aspect-[97/60] w-full sm:aspect-[97/44]">
                        <Image
                          src={
                            blogsData?.blog?.image ||
                            "/images/blog/blog-details-01.jpg"
                          }
                          alt="image"
                          fill
                          className="object-cover object-center"
                        />
                      </div>
                    </div>
                    <div
                      className="mb-8 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    />
                    <div className="items-center justify-between sm:flex">
                      <div className="mb-5">
                        <h4 className="mb-3 text-sm font-medium text-body-color">
                          Popular Tags :
                        </h4>
                        <div className="flex flex-wrap items-center gap-2">
                          {blogsData?.blog?.tags?.map((tag, index) => (
                            <TagButton key={index} text={tag} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Sidebar */}
            <div className="sticky-sidebar sticky top-20 mt-12 w-full self-start p-3 lg:mt-0 lg:w-1/3">
              {allBlogsLoading ? (
                <>
                  {/* Skeleton for Most Read Blog */}
                  <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                    <div className="border-b border-body-color border-opacity-10 px-8 py-4 dark:border-white dark:border-opacity-10">
                      <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <ul className="space-y-6 p-8">
                      {[...Array(3)].map((_, index) => (
                        <li
                          key={index}
                          className={`${
                            index < 2
                              ? "mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10"
                              : ""
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Skeleton for ModelOne */}
                  <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                    <div className="h-32 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  {/* Skeleton for ModelTwo */}
                  <div className="rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                    <div className="h-32 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                    <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                      Most Read Blog
                    </h3>
                    <ul className="p-8">
                      {shuffledBlogs?.slice(0, 3).map((blog, index) => (
                        <li
                          key={blog._id}
                          className={`${
                            index < 2
                              ? "mb-6 border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10"
                              : ""
                          }`}
                        >
                          <SideBlogs
                            title={blog.title}
                            image={
                              blog.image || "/images/blog/blog-details-01.jpg"
                            }
                            slug={`/blog-details?blogId=${blog._id}`}
                            tags={blog.tags[0]}
                            date={new Date(blog.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                  <ModelOne />
                  <ModelTwo />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetailsPage;
