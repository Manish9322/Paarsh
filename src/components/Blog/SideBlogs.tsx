import Image from "next/image";
import Link from "next/link";

const SideBlogs = ({
  image,
  slug,
  title,
  date,
  tags,
}: {
  image: string;
  slug: string;
  title: string;
  date: string;
  tags: string;
}) => {
  return (
    <div className="flex items-center lg:block xl:flex">
      <div className="mr-5 lg:mb-3 xl:mb-0">
        <div className="relative h-[60px] w-[70px] overflow-hidden rounded-md sm:h-[75px] sm:w-[85px]">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>
      </div>
      <div className="w-full">
        <h5>
          <Link
            href={slug}
            className="mb-[6px] block text-base font-medium leading-snug text-black hover:text-primary dark:text-white dark:hover:text-primary"
          >
            {title}
          </Link>
        </h5>
        <div className="flex mb-2">
          
        </div>
        <div className="flex flex-row justify-between gap-2 mb-2">
          <p className="text-xs font-medium text-body-color">
            {date}  
          </p>
          <div className="text-xs font-medium text-white bg-black dark:bg-blue-500 rounded-xl px-2 py-1">
            {tags}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SideBlogs;
