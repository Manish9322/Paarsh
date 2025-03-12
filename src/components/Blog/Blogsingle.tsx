
import Image from "next/image";
import Link from "next/link";
import type { Blog } from "@/types/blog";


const Blog = ({ blog }: { blog: Blog }) => {
  const { id, title, image, paragraph, author, tags, publishDate } = blog;
  return (
    <>

      <section className="">
        <div className="container mx-auto">
          {/* Main Blog Section with Related Blogs */}
          <div className="flex flex-col lg:flex-row lg:space-x-12">

            {/* Blog List (Main Content) */}
            <div className="w-full">
              <div className="flex flex-col items-center space-y-8">

                <div
                  className="w-full bg-white dark:bg-dark shadow-one dark:shadow-gray-dark rounded overflow-hidden flex flex-col md:flex-row transition duration-300 hover:shadow-two dark:hover:shadow-gray-dark"
                >
                  <div className="w-full md:w-1/2 h-50 relative">
                    <Image
                      src={image}
                      alt={title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-l"
                      priority
                    />
                  </div>
                  <div className="p-5 w-full md:w-1/2 flex flex-col justify-center">
                    <h3 className="mb-4 block text-xl font-bold text-black hover:text-primary dark:text-white dark:hover:text-primary sm:text-2xl">
                      {title}
                    </h3>
                    <p className="mb-6 border-b border-body-color border-opacity-10 pb-6 text-base font-medium text-body-color dark:border-white dark:border-opacity-10">
                      {paragraph}
                    </p>
                    <div className="flex items-center border-b border-body-color border-opacity-10 pb-6 dark:border-white dark:border-opacity-10">
                      <div className="mr-5 flex items-center border-r border-body-color border-opacity-10 pr-5 dark:border-white dark:border-opacity-10 xl:mr-3 xl:pr-3 2xl:mr-5 2xl:pr-5">
                        <div className="mr-4">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full">
                            <Image src={author.image} alt="author" fill className="object-cover" />
                          </div>
                        </div>
                        <div className="w-full">
                          <h4 className="mb-1 text-sm font-medium text-dark dark:text-white">
                            By {author.name}
                          </h4>
                          <p className="text-xs text-body-color">{author.designation}</p>
                        </div>
                      </div>
                      <div className="inline-block">
                        <h4 className="mb-1 text-sm font-medium text-dark dark:text-white">
                          last updated 4 min ago
                        </h4>
                        <p className="text-xs text-body-color"></p>
                      </div>
                    </div>
                    <Link
                      href="/blog-details"
                      // href={`/blog-details?id=${blog.id}`}
                      className="pt-4 text-primary transition duration-300 flex items-center space-x-2 
                      hover:text-primary-dark dark:text-white dark:hover:text-gray-300"
                    >
                      <span>Read More</span>
                      <svg
                        className="w-3 h-3 text-gray-800 dark:text-white transition duration-300 transform hover:translate-x-1" // Added hover effect here
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
        </div>
      </section>

    </>
  );
};

export default Blog;
