import { FeedbackData } from "./FeedbackData";
import SingleFeedback from "./SingleFeedback";

const Feedbacks = () => {
    return (
        <section className="w-full sm:p-4 sm:m-4 lg:p-8 lg:m-8 lg:w-fit">
            <div className="">

                <h3 className="font-xl ml-4 mb-2 font-bold leading-tight text-black dark:text-white lg:text-xl lg:mx-4 lg:leading-tight xl:text-2xl xl:leading-tight">
                    Some Thoughts
                </h3>
                <p className="mb-10 ml-4 text-base font-medium text-body-color sm:text-lg lg:mx-4 lg:text-base xl:text-lg">Check Out What Others Say About This Course!</p>

                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:gap-y-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 mx-4">
                    {FeedbackData.map((feedback) => (
                        <SingleFeedback key={feedback.id} feedback={feedback} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Feedbacks;