import Image from "next/image";
import Link from "next/link";

const RelatedPost = ({
  image,
  slug,
  title,
  level,
  duration,
  certificate,
  date
}: {
  image: string;
  slug: string;
  title: string;
  level: string;
  duration: string;
  certificate: string;
  
  date: string
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
          <p className="text-xs font-medium text-body-color mr-4"> {level} </p>
          <p className="text-xs font-medium text-body-color"> {duration}</p>
        </div>
        <div className="flex mb-2">
          <p className="text-xs font-medium text-body-color">
            {certificate ? "Certificate" : "No Certificate"}
          </p>
        </div>

      </div>
    </div>
  );
};

export default RelatedPost;
