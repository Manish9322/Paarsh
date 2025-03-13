import Blogsingle from "@/components/Blog/Blogsingle";
import RelatedPost from "@/components/Blog/RelatedPost";
import blogData from "@/components/Blog/blogData";
import Breadcrumb from "@/components/Common/Breadcrumb";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Page | Free Next.js Template for Startup and SaaS",
  description: "This is Blog Page for Startup Next.js Template",
};

const Blog = () => {
  return (
    <>
      <Breadcrumb
        pageName="Blogs"
        description="Welcome to our blog! Here, we share insightful articles, expert tips, and the latest trends on various topics, including web development, design,AI and technology. "
      />

      <section className="pb-20 pt-10">
        <div className="container mx-auto px-6 sm:px-12">
          <div className="flex flex-col lg:flex-row lg:space-x-12">
            {/* Left Side - Blog List */}
            <div className="w-full lg:w-2/3">
              <div className="flex flex-col space-y-12">
                {blogData.map((blog) => (
                  <div key={blog.id} className="w-full">
                    <Blogsingle blog={blog} />
                  </div>
                ))}
              </div>
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

                  <li>
                    <a
                      href="#0"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                      IT
                    </a>
                  </li>
                  <li>
                    <a
                      href="#0"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                      NON-IT
                    </a>
                  </li>
                  <li>
                    <a
                      href="#0"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                      ANIMATION
                    </a>
                  </li>

                  <li>
                    <a
                      href="#0"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                      GRAPHICS DESIGNING
                    </a>
                  </li>

                  <li>
                    <a
                      href="#0"
                      className="mb-3 inline-block text-base font-medium text-body-color hover:text-primary"
                    >
                      LANGUAGES
                    </a>
                  </li>

                </ul>

              </div>


              {/* category */}
              {/* <div className="mb-8 rounded-md bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="border-b border-body-color border-opacity-10 px-6 py-3 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                  Popular Category
                </h3>
                <div className="space-y-3 px-6 py-5">
                  {[
                    "Web Development",
                    "Web Design",
                    "CSS",
                    "Javascript",
                    " UI / UX Design",
                  ].map((category, index) => (
                    <div
                      key={index}
                      className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-100 p-4 shadow-md transition duration-300 
                  hover:bg-primary hover:text-white dark:bg-gray-800 dark:hover:bg-white dark:hover:text-black"
                    >
                      <span className="text-base font-medium">{category}</span>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-md transition duration-300 
                        hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      >
                        ➜
                      </button>
                    </div>
                  ))}
                </div>
              </div> */}

              <div className="rounded-lg bg-white shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="border-b border-body-color border-opacity-10 px-6 py-4 text-lg font-semibold text-black dark:border-white dark:border-opacity-10 dark:text-white">
                  Must Read
                </h3>
                <ul className="space-y-6 p-6">
                  <li className="border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10">
                    <RelatedPost
                      title="PyBloggers—the best Python bloggers come together"
                      image="/images/blog/python.jpeg"
                      slug="#"
                      date="12 Feb 2025" level="Last Updated 4 Mins Ago" duration={""} 
                      certificate =""/>
                  </li>
                  <li className="border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10">
                    <RelatedPost
                      title="7 tips for building winning websites
"
                      image="/images/blog/post-01.jpg"
                      slug="#"
                      date="12 Feb 2025" level="Last Updated 4 Mins Ago" duration={""} 
                      certificate ={""}/>
                  </li>
                  <li className="border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10">
                    <RelatedPost
                      title="Java News Roundup: Stable Values, Spring Modulith, Open Liberty, Quarkus, JReleaser, Gradle"
                      image="/images/blog/post-02.jpg"
                      slug="#"
                      date="15 Feb, 2024" level="Last Updated 4 Mins Ago" duration={""}
                      certificate ={""} />
                  </li>
                  <li>
                    <RelatedPost
                      title="ByteDance Launches New AI Coding Tool Trae with DeepSeek R1 and Claude 3.7 Sonnet Free For All Users"
                      image="/images/blog/post-03.jpg"
                      slug="#"
                      date="05 Jun, 2024" level="Last Updated 4 Mins Ago" duration={""}
                      certificate ={""} />
                  </li>
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
