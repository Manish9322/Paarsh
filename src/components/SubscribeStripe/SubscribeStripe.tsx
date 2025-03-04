import React from 'react';

const SubscribeNewsletter: React.FC = () => {
    return (
        <aside className="p-8 my-14 h-96 flex justify-center flex-col bg-white text-center border-gray-200 shadow-md sm:p-6 xl:p-12 lg:p-8 dark:bg-gray-800 dark:border-gray-800" aria-label="Subscribe to the Flowbite newsletter">
            <h3 className="mb-2 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight">Get more updates...</h3>
            <p className="xl:px-48 border-body-color border-opacity-10 pb-7 text-base leading-relaxed text-body-color dark:border-white dark:border-opacity-10 dark:text-white">
            Do you want to get notified when new courses and resources are added to Edu Learning? Sign up for our newsletter and you will be among the first to find out about new features, courses, updates, and tools.
            </p>
            <form
                action="https://app.convertkit.com/forms/4692392/subscriptions"
                className="seva-form formkit-form min-w-400"
                method="post"
                data-sv-form="4692392"
                data-uid="344e3b5c48"
                data-format="inline"
                data-version="5"
                data-options='{"settings":{"after_subscribe":{"action":"message","success_message":"Success! 
                Now check your email to confirm your subscription.","redirect_url":""},"analytics":{"google":null,
                "fathom":null,"facebook":null,"segment":null,"pinterest":null,"sparkloop":null,"googletagmanager":null},
                "modal":{"trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all","show_once_every":15},
                "powered_by":{"show":true,"url":"https://convertkit.com/features/forms?utm_campaign=poweredby&utm_content=form&utm_medium=referral&utm_source=dynamic"},
                // "recaptcha":{"enabled":false},"return_visitor":{"action":"show","custom_content":""},"slide_in":{"display_in":"bottom_right",
                // "trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all","show_once_every":15},
                // "sticky_bar":{"display_in":"top","trigger":"timer","scroll_percentage":null,"timer":5,"devices":"all",
                // "show_once_every":15}},"version":"5"}'
                
            >
                <div data-style="clean" className="flex justify-center items-end mb-3">
                    <ul className="formkit-alert formkit-alert-error" data-element="errors" data-group="alert"></ul>
                    <div data-element="fields" data-stacked="false" className="flex items-center w-full max-w-md mb-3 seva-fields formkit-fields">
                        <div className="relative w-full mr-3 formkit-field">
                            <label htmlFor="member_email" className="hidden block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email address</label>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                                    <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z"></path>
                                    <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z"></path>
                                </svg>
                            </div>
                            <input
                                id="member_email"
                                className="formkit-input bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                name="email_address"
                                aria-label="Email Address"
                                placeholder="Your email address..."
                                required
                                type="email"
                            />
                        </div>
                        <button data-element="submit" className="formkit-submit">
                            <div className="formkit-spinner">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                            <span className="px-5 py-3 text-sm font-medium text-center text-white bg-blue-700 rounded cursor-pointer hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Subscribe</span>
                        </button>
                    </div>
                </div>
            </form>
            <div className="xl:px-48 border-body-color border-opacity-10 pb-8 text-base leading-relaxed text-body-color dark:border-white dark:border-opacity-10 dark:text-white">
                By subscribing, you agree with Paarsh Edu Learnings <a rel="nofollow" href="https://convertkit.com/terms" className="text-blue-600 hover:underline dark:text-blue-500">Terms of Service</a> and <a rel="nofollow" className="text-blue-600 hover:underline dark:text-blue-500" href="https://convertkit.com/privacy">Privacy Policy</a>.
            </div>
        </aside>
    );
};

export default SubscribeNewsletter;