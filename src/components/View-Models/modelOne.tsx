import React from 'react';

const ModelTwo: React.FC = () => {
    return (
        <div className="relative rounded-b-sm shadow-three dark:bg-gray-dark mb-10 bg-white dark:shadow-none">
            <div className="relative">
                <img className="w-full rounded object-cover h-97" src="/images/courses/image-1.jpg" alt="" />
                <div className="rounded-b-sm absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-5 text-white">
                    <a href="#">
                        <h5 className="mb-2 text-2xl font-bold tracking-tight">
                            Exciting New Courses And Programs Launched in 2025
                        </h5>
                    </a>
                    <p className="mb-3 font-normal">
                        Discover the latest courses added to our platform this year, designed to enhance your skills and knowledge in various fields.
                    </p>
                    <a
                        href="#"
                        className="dark:bg-blue-600 w-40 inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm duration-300  hover:bg-gradient-to-t from-white/10 to-transparent hover:text-white dark:hover:bg-blue-700"
                    >
                        Read more
                        <svg
                            className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 10"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M1 5h12m0 0L9 1m4 4L9 9"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ModelTwo;
