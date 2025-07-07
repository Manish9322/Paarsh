"use client";

import Link from "next/link";
import SectionTitle from "../Common/SectionTitle";
import SingleBlog from "./SingleBlog";
import { useFetchBlogsQuery } from "@/services/api";

const Blog = () => {
  const { data: blogsData, isLoading: blogsLoading, error: blogsError } = useFetchBlogsQuery(undefined);
  const blogs = blogsData?.blogs || [];

  return (
    <section
      id="blog"
      className="bg-gray-light dark:bg-bg-color-dark py-16 md:py-20 lg:py-28"
    >
      <div className="container">
        <SectionTitle
          title="Our Latest Blogs"
          paragraph="Stay updated with our latest insights, trends, and stories. Explore a variety of topics curated just for you!"
          center
        />

        {blogsLoading && (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 md:gap-x-6 lg:gap-x-8 xl:grid-cols-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-full">
                  <div className="h-64 w-full bg-gray-200 animate-pulse rounded-sm"></div>
                </div>
              ))}
          </div>
        )}
        {blogsError && <p>Error loading blogs: {blogsError.message}</p>}
        {!blogsLoading && !blogsError && blogs.length === 0 && <p>No blogs found.</p>}
        {!blogsLoading && !blogsError && blogs.length > 0 && (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 md:gap-x-6 lg:gap-x-8 xl:grid-cols-3">
            {blogs.slice(0, 3).map((blog) => (
              <div key={blog._id} className="w-full">
                <SingleBlog blog={blog} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link
            href="/blog"
            className="inline-block rounded-sm bg-black px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-black/90 dark:bg-white/10 dark:text-white dark:hover:bg-white/5"
          >
            View More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blog;