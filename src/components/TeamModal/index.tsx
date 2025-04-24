import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';
import { FaLinkedinIn, FaFacebook, FaInstagram } from "react-icons/fa";

interface TeamMember {
    name: string;
    role: string;
    image: string;
    bio: string;
    socialLinks: {
        linkedin?: string;
        instagram?: string;
        facebook?: string;
    };
}

interface TeamModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const teamMembers: TeamMember[] = [
    {
        name: "Priti Sharma",
        role: "Sr. Software Engineer",
        image: "/images/team/priti-sharma.jpg",
        bio: "Over 15 years of experience in EdTech. Expert in scalable systems and previously led teams at leading educational platforms.",
        socialLinks: {
            linkedin: "https://linkedin.com/in/example-priti",
            instagram: "https://instagram.com/example-priti",
            facebook: "https://facebook.com/example-priti"
        }
    },
    {
        name: "Kunal Patil",
        role: "Sr. Backend Engineer",
        image: "/images/team/kunal-patil.jpg",
        bio: "Visionary tech leader with 15+ years in education technology. Architected high-performance learning systems at scale.",
        socialLinks: {
            linkedin: "https://linkedin.com/in/example-kunal",
            instagram: "https://instagram.com/example-kunal",
            facebook: "https://facebook.com/example-kunal"
        }
    },
    {
        name: "Anita Deshmukh",
        role: "Product Manager",
        image: "/images/team/anita-deshmukh.jpg",
        bio: "Seasoned product strategist who brings ideas to life. 10+ years in EdTech and SaaS product development.",
        socialLinks: {
            linkedin: "https://linkedin.com/in/example-anita",
            instagram: "https://instagram.com/example-anita",
            facebook: "https://facebook.com/example-anita"
        }
    },
    {
        name: "Ravi Iyer",
        role: "UI/UX Designer",
        image: "/images/team/ravi-iyer.jpg",
        bio: "Creative UI/UX designer with a user-first approach. Designed engaging experiences for top learning platforms.",
        socialLinks: {
            linkedin: "https://linkedin.com/in/example-ravi",
            instagram: "https://instagram.com/example-ravi",
            facebook: "https://facebook.com/example-ravi"
        }
    },
];



const scrollbarStyles = `
  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;



const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="min-h-screen px-4 text-center">
                        {/* Background overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
                            onClick={onClose}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative inline-block w-full max-w-7xl p-6 my-28 text-left bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded shadow-2xl transform transition-all max-h-[75vh] overflow-y-auto"
                            style={{ scrollbarWidth: 'none' }}
                        >
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 rounded-full 
                         bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 
                         dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>

                            {/* Header */}
                            <div className="text-center mb-12">
                                <motion.h2
                                    initial={{ y: -20 }}
                                    animate={{ y: 0 }}
                                    className="text-4xl font-bold bg-gradient-to-r from-blue-600 
                           to-purple-600 bg-clip-text text-transparent"
                                >
                                    Meet Our Team
                                </motion.h2>
                                <motion.p
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="mt-2 text-gray-600 dark:text-gray-300"
                                >
                                    Passionate innovators shaping the future of education
                                </motion.p>
                            </div>

                            {/* Team Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {teamMembers.map((member, index) => (
                                    <motion.div
                                        key={member.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group relative bg-white dark:bg-gray-800 rounded
                         shadow-sm hover:shadow-md transition-all duration-300 
                         border border-gray-100 dark:border-gray-700 overflow-hidden"
                                    >
                                        {/* Card Header with Image and Basic Info */}
                                        <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-700">
                                            <div className="relative h-16 w-16 flex-shrink-0">
                                                <Image
                                                    src={member.image}
                                                    alt={member.name}
                                                    width={64}
                                                    height={64}
                                                    className="rounded-full object-cover ring-2 ring-gray-100 
                               dark:ring-gray-700 group-hover:ring-blue-500 
                               dark:group-hover:ring-blue-400 transition-all duration-300"
                                                />
                                            </div>
                                            <div className="ml-4 flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white 
                                 truncate group-hover:text-blue-600 
                                 dark:group-hover:text-blue-400 transition-colors">
                                                    {member.name}
                                                </h3>
                                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                                    {member.role}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bio Section */}
                                        <div className="p-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-300 
                               line-clamp-2 group-hover:line-clamp-none 
                               transition-all duration-300">
                                                {member.bio}
                                            </p>
                                        </div>

                                        {/* Social Links Footer */}
                                        <div className="flex items-center justify-end gap-2 p-4 
                               bg-gray-50 dark:bg-gray-800/50 border-t 
                               border-gray-100 dark:border-gray-700">
                                            {member.socialLinks.linkedin && (
                                                <SocialLink
                                                    href={member.socialLinks.linkedin}
                                                    icon={<FaLinkedinIn className="w-4 h-4" />}
                                                />
                                            )}
                                            {member.socialLinks.instagram && (
                                                <SocialLink
                                                    href={member.socialLinks.instagram}
                                                    icon={<FaInstagram className="w-4 h-4" />}
                                                />
                                            )}
                                            {member.socialLinks.facebook && (
                                                <SocialLink
                                                    href={member.socialLinks.facebook}
                                                    icon={<FaFacebook className="w-4 h-4" />}
                                                />
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 
             hover:bg-blue-100 dark:hover:bg-blue-900/30 
             text-gray-600 dark:text-gray-400 hover:text-blue-600 
             dark:hover:text-blue-400 transition-all duration-200"
    >
        {icon}
    </a>
);

export default TeamModal;