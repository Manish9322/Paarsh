import { AboutCard } from "@/types/aboutCard";

const SingleAboutCard = ({ about }: { about: AboutCard }) => {
  const { tag, title, paragraph } = about;

  return (
    <div className="w-full">
      <div className="group rounded border border-gray-200 bg-white px-8 py-6 shadow-md transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-600 dark:hover:shadow-gray-800">
        <p className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-600 dark:bg-blue-900 dark:text-white">
          {tag}
        </p>
        <h3 className="mb-4 text-2xl font-extrabold text-gray-900 transition-colors  dark:text-white ">
          {title}
        </h3>
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          {paragraph}
        </p>
      </div>
    </div>
  );
};

export default SingleAboutCard;
