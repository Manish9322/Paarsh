import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Page | Free Next.js Template for Startup and SaaS",
  description: "This is Contact Page for Startup Nextjs Template",
  // other metadata
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Contact us"
        description="We’d love to hear from you! Whether you have questions about our services, need assistance, or are interested in collaborating, feel free to reach out. Fill out the form below, and our team will get back to you as soon as possible." />

      {/* Reach Out & Branding Section */}
      <div className=" rounded-sm bg-white px-8 py-11 shadow-three dark:bg-gray-dark sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white bg-opacity-50 p-6 shadow dark:bg-[#2C303B]">
            <h1 className="mb-4 text-2xl font-semibold">Reach Out to Us</h1>
            <p className="flex items-center gap-2  font-medium text-body-color mb-4">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="gray"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6.6 10.8C8 13.7 10.3 16 13.2 17.4L15.4 15.2C15.7 14.9 16.1 14.8 16.5 14.9L20.8 15.9C21.4 16.1 21.8 16.6 21.8 17.2V21C21.8 21.6 21.3 22.1 20.7 22C15.4 21.4 10.7 18.7 7.3 15.3C3.9 11.9 1.2 7.2 0.6 2C0.5 1.4 1 0.9 1.6 0.9H5.4C6 0.9 6.5 1.3 6.6 1.9L7.6 6.2C7.7 6.6 7.6 7 7.3 7.3L5.1 9.5C5.4 9.9 6 10.4 6.6 10.8Z" />
              </svg>
              +91 90752 01035
            </p>
            <p className="flex items-center gap-2  font-medium text-body-color mb-4">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-500"
              >
                <path
                  d="M3 4h11C22.1 4 23 4.9 23 6V18C23 19.1 22.1 20 21 20H3C1.9 20 1 19.1 1 18V6C1 4.9 1.9 4 3 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 6L12 13L21 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
               paarshedu@gmail.com
            </p>
            <p className="flex items-center gap-2 font-medium text-body-color">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="gray"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C8.1 2 5 5.1 5 9C5 13.2 9.9 19.3 11.6 21.2C11.8 21.4 12.2 21.4 12.4 21.2C14.1 19.3 19 13.2 19 9C19 5.1 15.9 2 12 2ZM12 11C10.3 11 9 9.7 9 8C9 6.3 10.3 5 12 5C13.7 5 15 6.3 15 8C15 9.7 13.7 11 12 11Z" />
              </svg>
             Paarsh Infotech Pvt Ltd. Office no 1 Bhakti Apartment,
              Near Rasoi Hotel Suchita Nagar, Mumbai Naka, Nashik 422001.
            </p>
          </div>
          <div className="rounded-lg bg-white bg-opacity-50 p-6 shadow dark:bg-[#2C303B]">
            <h1 className="mb-4 text-2xl font-semibold">Branding & Collaboration & Services</h1>
            <p className="flex items-center gap-2 font-medium text-body-color mb-4">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="gray"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6.6 10.8C8 13.7 10.3 16 13.2 17.4L15.4 15.2C15.7 14.9 16.1 14.8 16.5 14.9L20.8 15.9C21.4 16.1 21.8 16.6 21.8 17.2V21C21.8 21.6 21.3 22.1 20.7 22C15.4 21.4 10.7 18.7 7.3 15.3C3.9 11.9 1.2 7.2 0.6 2C0.5 1.4 1 0.9 1.6 0.9H5.4C6 0.9 6.5 1.3 6.6 1.9L7.6 6.2C7.7 6.6 7.6 7 7.3 7.3L5.1 9.5C5.4 9.9 6 10.4 6.6 10.8Z" />
              </svg>
              +91 98609 88343
            </p>
            <p className="flex items-center gap-2 font-medium text-body-color mb-4">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-500"
              >
                <path
                  d="M3 4h11C22.1 4 23 4.9 23 6V18C23 19.1 22.1 20 21 20H3C1.9 20 1 19.1 1 18V6C1 4.9 1.9 4 3 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 6L12 13L21 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              info@paarshinfotech.com
            </p>
            <p className="flex items-center gap-2  font-medium text-body-color">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="gray"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C8.1 2 5 5.1 5 9C5 13.2 9.9 19.3 11.6 21.2C11.8 21.4 12.2 21.4 12.4 21.2C14.1 19.3 19 13.2 19 9C19 5.1 15.9 2 12 2ZM12 11C10.3 11 9 9.7 9 8C9 6.3 10.3 5 12 5C13.7 5 15 6.3 15 8C15 9.7 13.7 11 12 11Z" />
              </svg>
             Paarsh Infotech Pvt Ltd. Office no 1 Bhakti Apartment,
              Near Rasoi Hotel Suchita Nagar, Mumbai Naka, Nashik 422001.
            </p>
          </div>
        </div>
      </div>
      <Contact />

      <div className="rounded-sm bg-white px-8 py-11 shadow-three dark:bg-gray-dark sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white bg-opacity-50 p-6 shadow dark:bg-[#2C303B]">
            <h1 className="text-2xl font-semibold">Nashik Office</h1>
            <h3 className="text-sm mb-5 font-medium text-body-color">Main branch</h3>
            <p className="mb-3 text-body-color">Office No. 1, Bhakti Apartment, near Hotel Rasoi, Suchita Nagar, Mumbai Naka, Nashik, Maharashtra, India PIN - 422009</p>
            <p className="mb-3 text-body-color">Timing: 10:00 AM - 6:30 PM</p>
          </div>
          <div className="rounded-lg bg-white bg-opacity-50 p-6 shadow dark:bg-[#2C303B]">
            <h1 className="text-2xl font-semibold">Jalgaon Office</h1>
            <h3 className="text-sm mb-5 font-medium text-body-color">Sub branch</h3>
            <p className="mb-3 text-body-color">Office No. 1, Shelke Complex, Near Harimandir Mankilla, Dharwad- Karnakata, India PIN - 580001</p>
            <p className="mb-3 text-body-color">Timing: 10:00 AM - 6:30 PM</p>
          </div>
          <div className="rounded-lg bg-white bg-opacity-50 p-6 shadow dark:bg-[#2C303B]">
            <h1 className="text-2xl font-semibold">Surat Office</h1>
            <h3 className="text-sm mb-5 font-medium text-body-color">Sub branch</h3>
            <p className="mb-3 text-body-color">Office No. 1, Shelke Complex, Near Harimandir Mankilla, Dharwad- Karnakata, India PIN - 580001</p>
            <p className="mb-3 text-body-color">Timing: 10:00 AM - 6:30 PM</p>
          </div>
        </div>
      </div>

      {/* google map */}
      <div className="mt-10 h-96 w-full">
        <iframe
          className="h-full w-full rounded-lg shadow-lg"
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d239977.2208696996!2d73.7818331!3d19.9814652!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bddebee73f7beb3%3A0x180f540ccce09ace!2sPAARSH%20INFOTECH%20PVT%20LTD!5e0!3m2!1sen!2sin!4v1734090742917!5m2!1sen!2sin"
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </>
  );
};

export default ContactPage;
