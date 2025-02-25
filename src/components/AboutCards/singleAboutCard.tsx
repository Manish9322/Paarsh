import { AboutCard } from "@/types/aboutCard";

const SingleAboutCard = ({ about }: { about: AboutCard }) => {
  console.log("Received AboutCard:", about);

  const { tag, title, paragraph } = about;

  return (
    <div className="w-full">
      <div className="rounded-sm bg-white p-8 shadow-two duration-300 hover:shadow-one dark:bg-gray-800 dark:shadow-three dark:hover:shadow-gray-dark lg:px-5 xl:px-8">
        <h3 className="text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">{title}</h3>
          <p className="mb-5 text-base font-medium leading-relaxed text-body-color text-blue-500 dark:text-gray-300">{tag}</p>
        <p className="text-base font-medium leading-relaxed text-body-color dark:text-gray-300">{paragraph}</p>
      </div>
    </div>
  );
};


export default SingleAboutCard;