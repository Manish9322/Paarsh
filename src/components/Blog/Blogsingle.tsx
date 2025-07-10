"use client";

import Image from "next/image";
import Link from "next/link";
import type { Blog } from "@/types/blog";
import { formatRelativeTime } from "../../../utils/formatRelativeTime";

// Simple function to strip HTML tags for preview
const stripHtmlTags = (html: string) => {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const Blogsingle = ({ blog }: { blog: Blog }) => {
  // Truncate plain text for preview (100 characters)
  const truncatedContent = stripHtmlTags(blog.paragraph).slice(0, 100) + "...";

  return (
    <section>
      <Link
        href={`/blog-details?blogId=${blog._id}`}
        className="container mx-auto px-2"
      >
        {/* Blog Section */}
        <div className="flex flex-col lg:flex-row lg:space-x-12">
          {/* Blog List (Main Content) */}
          <div className="w-full">
            <div className="flex flex-col items-center space-y-8">
              <div className="flex w-full flex-col overflow-hidden rounded bg-white shadow-md transition duration-300 hover:shadow-lg dark:bg-dark md:flex-row">
                {/* Blog Image */}
                <div className="relative h-[250px] w-full md:h-auto md:w-1/2">
                  <span className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-2 py-1 text-sm font-semibold capitalize text-white dark:bg-blue-500 dark:text-white">
                    {blog.tags[0] || "No Tag"}
                  </span>

                  <Image
                    src={blog.image || "/images/favicon.png"}
                    alt={blog.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-l"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/favicon.png";
                    }}
                  />
                </div>

                {/* Blog Content */}
                <div className="flex w-full flex-col justify-center p-5 md:w-1/2">
                  <h3 className="mb-4 text-xl font-bold text-black hover:text-primary dark:text-white">
                    {blog.title}
                  </h3>
                  {/* Truncated Plain Text */}
                  <p className="mb-6 border-b border-opacity-10 pb-6 text-base font-medium text-body-color dark:border-opacity-10 dark:text-white">
                    {truncatedContent}
                  </p>

                  {/* Author & Publish Date */}
                  <div className="flex items-center border-b pb-6 dark:border-white dark:border-opacity-10">
                    {/* Author Info */}
                    <div className="mr-5 flex items-center border-r border-body-color border-opacity-10 pr-5">
                      <div className="mr-4">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full">
                          <Image
                            src={blog.author.image || "/images/favicon.png"}
                            alt={blog.author.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/favicon.png";
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-full">
                        <h4 className="mb-1 text-sm font-medium text-dark dark:text-white">
                          By {blog.author.name}
                        </h4>
                        <p className="text-xs text-body-color">
                          {blog.author.designation}
                        </p>
                      </div>
                    </div>

                    {/* Publish Date */}
                    <div className="inline-block">
                      <div className="w-full">
                        <h4 className="mb-1 text-sm font-medium text-dark dark:text-white">
                          Publish Date
                        </h4>
                        <p className="text-xs text-body-color">
                          {new Date(blog.publishDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Read More Button */}
                  <Link
                    href={`/blog-details?blogId=${blog._id}`}
                    className="hover:text-primary-dark flex items-center space-x-2 pt-4 text-primary transition duration-300 dark:text-white dark:hover:text-gray-300"
                  >
                    <span className="text-sm font-medium">Read More</span>
                    <svg
                      className="h-3 w-3 transform text-gray-800 transition duration-300 hover:translate-x-1 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 10 16"
                    >
                      <path d="M3.414 1A2 2 0 0 0 0 2.414v11.172A2 2 0 0 0 3.414 15L9 9.414a2 2 0 0 0 0-2.828L3.414 1Z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
};

export default Blogsingle;
