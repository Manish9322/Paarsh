"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";

const PageName = () => {
    return (
      <>
        <span className="text-blue-600">Return Policy</span>
      </>
    );
  };

const ReturnPolicy = () => {
    return (
        <>
            <Breadcrumb
                pageName={<PageName />}
                description="Our return policy allows refunds for eligible courses. Cancellations made within the specified period qualify for a full refund. Late cancellations may incur fees or restrictions."
            />
            <section className="mb-10">
                <div className="container">
                    <div className="flex flex-col gap-8">
                        <div className="rounded-lg bg-white p-8 dark:bg-gray-dark">
                            <h1 className="mb-6 text-3xl font-bold text-black dark:text-white sm:text-4xl">
                                RETURN POLICY
                            </h1>
                            <p className="mb-8 text-base text-body-color dark:text-body-color-dark">
                            LAST UPDATED January 01, 2025
                            </p>

                            <div className="space-y-6 text-base leading-relaxed text-body-color dark:text-body-color-dark">
                                <h3 className="text-xl font-semibold text-black dark:text-white">
                                    REFUND
                                </h3>
                                <p>
                                    All sales are final and no refund will be issued.
                                </p>

                                <h3 className="text-xl font-semibold text-black dark:text-white">
                                    QUESTIONS
                                </h3>
                                <p>
                                    If you have any questions concerning our return policy, please get in touch with us: at info@paarshedu.com
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ReturnPolicy; 