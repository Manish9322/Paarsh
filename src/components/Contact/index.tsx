"use client";
import { useAddContactMutation } from "@/services/api";
import SubscribeNewsletter from "../SubscribeStripe/SubscribeStripe";
import NewsLatterBox from "./NewsLatterBox";
import { useState } from "react"; 
import { toast } from "sonner";


const Contact = () => {
  const [addContact, { isLoading: isAdding }] = useAddContactMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });

  // Handle input changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setErrors((prev) => ({ ...prev, name: "" }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: "" }));
  };  

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setErrors((prev) => ({ ...prev, message: "" }));
  };

  // Email validation function
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    let newErrors = { name: "", email: "", message: "" };

    if (!name.trim()) newErrors.name = "Name is required.";
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!message.trim()) newErrors.message = "Message is required.";

    // If there are errors, set them and stop submission
    if (newErrors.name || newErrors.email || newErrors.message) {
      setErrors(newErrors);
      return;
    }

    // Proceed with API call
    const response = await addContact({ name, email, message });

    if (response?.data?.success) {
      toast.success("Contact request sent successfully");
      setName("");
      setEmail("");
      setMessage("");
    } else {
      toast.error("Failed to send the contact request. Please try again.");
    }
  };

  return (
    <section id="contact" className="overflow-hidden py-5 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mb-12 rounded-sm bg-white px-8 py-11 shadow-three dark:bg-gray-dark sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]">
              <h1 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
                Need Help?
              </h1>
              <p className="mb-12 text-base font-medium text-body-color">
                Our support team will get back to you ASAP via email.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="-mx-4 flex flex-wrap">
                  {/* Name Field */}
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label htmlFor="name" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        name="name"
                        value={name}
                        onChange={handleNameChange}
                        className={`border-stroke w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary ${
                          errors.name ? "border-red-500" : ""
                        }`}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label htmlFor="email" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Your Email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        name="email"
                        value={email}
                        onChange={handleEmailChange}
                        className={`border-stroke w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary ${
                          errors.email ? "border-red-500" : ""
                        }`}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="w-full px-4">
                    <div className="mb-8">
                      <label htmlFor="message" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Your Message
                      </label>
                      <textarea
                        name="message"
                        rows={5}
                        placeholder="Enter your Message"
                        value={message}
                        onChange={handleMessageChange}
                        className={`border-stroke w-full resize-none rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary ${
                          errors.message ? "border-red-500" : ""
                        }`}
                      ></textarea>
                      {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="w-full px-4">
                    <button className="rounded-sm bg-blue-600 px-9 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-blue-500 dark:shadow-submit-dark">
                      {isAdding ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>  
    </section>
  );
};

export default Contact;
