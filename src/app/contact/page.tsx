
import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";
import { Metadata } from "next";
import { FaPhone, FaEnvelope, FaClock, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaArrowRight } from 'react-icons/fa';
import { Phone, Mail, MapPin, Building, ExternalLink, Clock, Users } from 'lucide-react';

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
      <div className="container mx-auto px-4 pt-12 pb-0 md:pt-16">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-md overflow-hidden shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="absolute right-0 top-0 w-32 h-32 opacity-10">
              <div className="w-full h-full bg-white rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white p-3 rounded-full shadow-lg">
                  <Phone className="w-7 h-7 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-white">Reach Out to Us</h2>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-4 group">
                  <div className="bg-blue-100 bg-opacity-20 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <a href="tel:+919075201035" className="text-white group-hover:text-blue-100 transition-colors font-medium flex items-center gap-2">
                    +91 90752 01035
                    <ExternalLink className="w-4 h-4 opacity-70" />
                  </a>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="bg-blue-100 bg-opacity-20 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <a href="mailto:paarshedu@gmail.com" className="text-white group-hover:text-blue-100 transition-colors font-medium flex items-center gap-2">
                    paarshedu@gmail.com
                    <ExternalLink className="w-4 h-4 opacity-70" />
                  </a>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 bg-opacity-20 p-2 rounded-full mt-1">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Paarsh Infotech Pvt Ltd.<br />
                      Office no 1 Bhakti Apartment,<br />
                      Near Rasoi Hotel Suchita Nagar,<br />
                      Mumbai Naka, Nashik 422001.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="bg-blue-100 bg-opacity-20 p-2 rounded-full">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white font-medium">
                    Monday - Friday: 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-md overflow-hidden shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="absolute right-0 top-0 w-32 h-32 opacity-10">
              <div className="w-full h-full bg-white rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white p-3 rounded-full shadow-lg">
                  <Building className="w-7 h-7 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-white">Business & Partnerships</h2>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-4 group">
                  <div className="bg-blue-100 bg-opacity-20 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <a href="tel:+919860988343" className="text-white group-hover:text-blue-100 transition-colors font-medium flex items-center gap-2">
                    +91 98609 88343
                    <ExternalLink className="w-4 h-4 opacity-70" />
                  </a>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="bg-blue-100 bg-opacity-20 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <a href="mailto:info@paarshinfotech.com" className="text-white group-hover:text-blue-100 transition-colors font-medium flex items-center gap-2">
                    info@paarshinfotech.com
                    <ExternalLink className="w-4 h-4 opacity-70" />
                  </a>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 bg-opacity-20 p-2 rounded-full mt-1">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Corporate Headquarters</h3>
                    <p className="text-white font-medium mt-1">
                      Paarsh Infotech Pvt Ltd.<br />
                      Office no 1 Bhakti Apartment,<br />
                      Near Rasoi Hotel, Mumbai Naka, Nashik 422001.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="bg-blue-100 bg-opacity-20 p-2 rounded-full">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <a href="#" className="text-white group-hover:text-blue-100 transition-colors font-medium flex items-center gap-2">
                    Schedule a consultation
                    <ExternalLink className="w-4 h-4 opacity-70" />
                  </a>
                </div>
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
          <div className="group overflow-hidden rounded-md bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-dark">
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
          <div className="group overflow-hidden rounded-md bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-dark">
            <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-700 p-6">
              <h3 className="mb-1 text-2xl font-bold text-white">Jalgaon Office</h3>
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
                XHX3+9XQ, beside JDCC bank,<br />
                near MJ College Road,<br />
                Gurukul Colony, Ramdas Colony,<br />
                Jalgaon, Maharashtra 425001
              </p>
              <a
                href="https://maps.google.com/?q=Paarsh+Infotech+Jalgaon"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Get directions
                <FaArrowRight size={16} className="ml-1" />
              </a>
            </div>
          </div>

          {/* Surat Office */}
          <div className="group overflow-hidden rounded-md bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-dark">
            <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-700 p-6">
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
                className="mt-4 inline-flex items-center font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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