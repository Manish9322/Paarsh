"use client";

import Blogsingle from "@/components/Blog/Blogsingle";
import RelatedPost from "@/components/Blog/RelatedPost";
import Breadcrumb from "@/components/Common/Breadcrumb";
// import type { Metadata } from "next";
import { useFetchBlogsQuery } from "@/services/api";
import { formatRelativeTime } from "../../../utils/formatRelativeTime";
import SideBlogs from "@/components/Blog/SideBlogs";

// export const metadata: Metadata = {
//   title: "Blog Page | PaarshEdu",
//   description: "This is Blog Page for PaarshEdu",
// };

const Blog = () => {
  const { data: blogsData, isLoading: blogsLoading, error: blogsError } = useFetchBlogsQuery(undefined);
  const blogs = blogsData?.blogs || [];

  return (
    <>
      <Breadcrumb
        pageName="Blogs"
        description="Welcome to our blog! Here, we share insightful articles, expert tips, and the latest trends on various topics, including web development, design, AI, and technology."
      />

      <section className="pb-20 pt-10">
        <div className="container mx-auto px-6 sm:px-12">
          <div className="flex flex-col lg:flex-row lg:space-x-12">
            {/* Left Side - Blog List */}
            <div className="w-full lg:w-2/3">
              {blogsLoading && (
                <div className="flex flex-col space-y-12">
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
                <div className="flex flex-col space-y-12">
                  {blogs.map((blog) => (
                    <div key={blog._id} className="w-full">
                      <Blogsingle blog={blog} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Related Posts */}
            <div className="mt-12 w-full lg:mt-0 lg:w-1/3">
              <aside className="sticky top-20">
                {/* POPULAR CATEGORIES */}
                <div className="mb-10 rounded-sm bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                  <h3 className="border-b border-body-color border-opacity-10 px-8 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                    Popular Category
                  </h3>
                  <ul className="px-8 py-6">
                    {["IT", "NON-IT", "ANIMATION", "GRAPHICS DESIGNING", "LANGUAGES"].map((category) => (
                      <li key={category}>
                        <a
                          href={`/blog?category=${category.toLowerCase()}`}
                          className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                        >
                          {category}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Must Read */}
                <div className="rounded-lg bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                  <h3 className="border-b border-body-color border-opacity-10 px-6 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                    Must Read
                  </h3>
                  <ul className="space-y-6 p-6">
                    {blogsLoading && <li>Loading related posts...</li>}
                    {blogsError && <li>Error loading related posts</li>}
                    {!blogsLoading && !blogsError && blogs.length === 0 && <li>No related posts found.</li>}
                    {!blogsLoading &&
                      !blogsError &&
                      blogs.slice(0, 4).map((blog) => (
                        <li
                          key={blog._id}
                          className="border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10 last:border-b-0"
                        >
                          <SideBlogs
                            title={blog.title}
                            image={blog.image || "/images/favicon.png"}
                            slug={`/blog-details?blogId=${blog._id}`}
                            date={formatRelativeTime(blog.publishDate)}
                          />
                        </li>
                      ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;