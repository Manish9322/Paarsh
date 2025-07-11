"use client";

import { Blog } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import { formatRelativeTime } from "../../../utils/formatRelativeTime";

const SingleBlog = ({ blog }: { blog: Blog }) => {
  const stripHtmlTags = (html: string) => {
    return html
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const truncatedContent = stripHtmlTags(blog.paragraph).slice(0, 100) + "...";

  return (
    <div className="group relative overflow-hidden rounded-sm bg-white shadow-one duration-300 hover:shadow-two dark:bg-dark dark:hover:shadow-gray-dark">
      <Link
        href={`/blog-details?blogId=${blog._id}`}
        className="relative block aspect-[37/22] w-full"
      >
        <span className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-full bg-primary px-2 py-1 text-sm font-semibold capitalize text-white dark:bg-blue-500 dark:text-white">
          {blog.tags[0] || "No Tag"}
        </span>
        <Image
          src={blog.image || "/images/favicon.png"}
          alt={blog.title}
          fill
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/favicon.png";
          }}
        />
      </Link>
      <div className="p-6 sm:p-8 md:px-6 md:py-8 lg:p-8 xl:px-5 xl:py-8 2xl:p-8">
        <h3>
          <Link
            href={`/blog-details?blogId=${blog._id}`}
            className="mb-4 block text-xl font-bold text-black hover:text-primary dark:text-white dark:hover:text-primary sm:text-2xl"
          >
            {blog.title}
          </Link>
        </h3>
        <p className="mb-6 border-b border-body-color border-opacity-10 pb-6 text-base font-medium text-body-color dark:border-white dark:border-opacity-10">
          {truncatedContent}
        </p>
        <div className="flex items-center">
          <div className="mr-5 flex items-center border-r border-body-color border-opacity-10 pr-5 dark:border-white dark:border-opacity-10 xl:mr-3 xl:pr-3 2xl:mr-5 2xl:pr-5">
            <div className="mr-4">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image
                  src={blog.author.image || "/images/favicon.png"}
                  alt={blog.author.name}
                  fill
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
          <div className="inline-block">
            <h4 className="mb-1 text-sm font-medium text-dark dark:text-white">
              Date
            </h4>
            <p className="text-xs text-body-color">
              {new Date(blog.publishDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBlog;
