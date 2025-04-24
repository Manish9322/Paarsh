
import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";
import { Metadata } from "next";
import { FaPhone, FaEnvelope, FaClock, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaArrowRight } from 'react-icons/fa';
import { MdBusiness } from 'react-icons/md';

export const metadata: Metadata = {
  title: "Contact Paarsh Infotech | Technology Solutions",
  description: "Connect with Paarsh Infotech's team of experts for technology solutions, support, and partnership opportunities",
  keywords: "contact, Paarsh Infotech, technology solutions, IT services, support, partnership",
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Get in Touch"
        description="Let's build something amazing together! Our team of experts is ready to help with your technology needs. Reach out today to discuss how we can support your business growth and innovation."
      />

      {/* Contact Cards */}
      <div className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Reach Out Card */}
          <div className="group overflow-hidden rounded-xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl dark:bg-gray-dark">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <FaPhone size={32} />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Reach Out to Us</h2>
            
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                  <FaPhone size={18} />
                </div>
                <a href="tel:+919075201035" className="text-lg font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  +91 90752 01035
                </a>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                  <FaEnvelope size={18} />
                </div>
                <a href="mailto:paarshedu@gmail.com" className="text-lg font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  paarshedu@gmail.com
                </a>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                  <FaMapMarkerAlt size={18} />
                </div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Paarsh Infotech Pvt Ltd.<br />
                  Office no 1 Bhakti Apartment,<br />
                  Near Rasoi Hotel Suchita Nagar,<br />
                  Mumbai Naka, Nashik 422001.
                </p>
              </div>
            </div>
          </div>

          {/* Business Card */}
          <div className="group overflow-hidden rounded-xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl dark:bg-gray-dark">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30">
              <MdBusiness size={32} />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Business & Partnerships</h2>
            
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                  <FaPhone size={18} />
                </div>
                <a href="tel:+919860988343" className="text-lg font-medium text-gray-700 transition-colors hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
                  +91 98609 88343
                </a>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                  <FaEnvelope size={18} />
                </div>
                <a href="mailto:info@paarshinfotech.com" className="text-lg font-medium text-gray-700 transition-colors hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
                  info@paarshinfotech.com
                </a>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                  <FaMapMarkerAlt size={18} />
                </div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Corporate Headquarters<br />
                  Paarsh Infotech Pvt Ltd.<br />
                  Office no 1 Bhakti Apartment,<br />
                  Near Rasoi Hotel, Mumbai Naka, Nashik 422001.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div id="contact-form" className="scroll-mt-20">
        <Contact />
      </div>

      {/* Office Locations */}
      <div className="container mx-auto px-4 mb-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">Our Office Locations</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Nashik Office */}
          <div className="group overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-dark">
            <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-700 p-6">
              <h3 className="mb-1 text-2xl font-bold text-white">Nashik Office</h3>
              <div className="flex items-center text-white/80">
                <FaMapMarkerAlt size={16} className="mr-2" />
                <span className="font-medium">Main Headquarters</span>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <FaClock size={16} className="mr-2" />
                10:00 AM - 6:30 PM
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Office No. 1, Bhakti Apartment,<br />
                near Hotel Rasoi, Suchita Nagar,<br />
                Mumbai Naka, Nashik, Maharashtra,<br />
                India PIN - 422009
              </p>
              <a 
                href="https://maps.google.com/?q=Paarsh+Infotech+Pvt+Ltd+Nashik" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Get directions
                <FaArrowRight size={16} className="ml-1" />
              </a>
            </div>
          </div>

          {/* Jalgaon Office */}
          <div className="group overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-dark">
            <div className="h-40 bg-gradient-to-r from-indigo-500 to-indigo-700 p-6">
              <h3 className="mb-1 text-2xl font-bold text-white">Jalgaon Office</h3>
              <div className="flex items-center text-white/80">
                <FaMapMarkerAlt size={16} className="mr-2" />
                <span className="font-medium">Regional Office</span>
              </div>
            </div>
            <div className ="p-6">
              <div className="mb-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <FaClock size={16} className="mr-2" />
                10:00 AM - 6:30 PM
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                XHX3+9XQ, beside JDCC bank,<br />
                near MJ College Road,<br />
                Gurukul Colony, Ramdas Colony,<br />
                Jalgaon, Maharashtra 425001
              </p>
              <a 
                href="https://maps.google.com/?q=Paarsh+Infotech+Jalgaon" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Get directions
                <FaArrowRight size={16} className="ml-1" />
              </a>
            </div>
          </div>

          {/* Surat Office */}
          <div className="group overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-dark">
            <div className="h-40 bg-gradient-to-r from-purple-500 to-purple-700 p-6">
              <h3 className="mb-1 text-2xl font-bold text-white">Surat Office</h3>
              <div className="flex items-center text-white/80">
                <FaMapMarkerAlt size={16} className="mr-2" />
                <span className="font-medium">Regional Office</span>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <FaClock size={16} className="mr-2" />
                10:00 AM - 6:30 PM
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Office No. 1, Shelke Complex,<br />
                Near Harimandir Mankilla,<br />
                Dharwad- Karnakata,<br />
                India PIN - 580001
              </p>
              <a 
                href="https://maps.google.com/?q=Paarsh+Infotech+Surat" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
              >
                Get directions
                <FaArrowRight size={16} className="ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Google Map with enhanced styling */}
        <div className="h-96 w-full overflow-hidden">
          <iframe
            className="h-full w-full"
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