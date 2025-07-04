"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "../../lib/slices/userAuthSlice";
import { useFetchUserQuery } from "@/services/api";

const Footer = () => {
  const { data: userData } = useFetchUserQuery(undefined);
  const dispatch = useDispatch();
  const router = useRouter();

  const user = userData?.data;

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  return (
    <>
      <footer className="relative z-10 bg-white pt-14 dark:bg-gray-dark md:pt-10 lg:pt-10">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-5/12">
              <div className="mb-12 max-w0-[360px] lg:mb-10 ">
                <Link href="/" className="mb-4 inline-block">
                  <Image
                    src="/images/logo/LOGO_DARK.png"
                    alt="logo"
                    className="w-full dark:hidden"
                    width={160}
                    height={30}
                  />
                  <Image
                    src="/images/logo/LOGO_LIGHT.png"
                    alt="logo"
                    className="hidden w-full dark:block"
                    width={160}
                    height={30}
                  />
                </Link>
                <p className="mb-9 text-base leading-relaxed text-body-color dark:text-body-color-dark">
                  Paarsh Edu delivers comprehensive software development training and professional career guidance.
                </p>
                <div className="flex items-center">
                  <a
                    href="https://www.facebook.com/PaarshEDU"
                    aria-label="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-6 text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.1 10.4939V7.42705C12.1 6.23984 13.085 5.27741 14.3 5.27741H16.5V2.05296L13.5135 1.84452C10.9664 1.66676 8.8 3.63781 8.8 6.13287V10.4939H5.5V13.7183H8.8V20.1667H12.1V13.7183H15.4L16.5 10.4939H12.1Z"
                        fill="currentColor"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/paarshinfotech"
                    aria-label="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-6 text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M13.9831 19.25L9.82094 13.3176L4.61058 19.25h1.40625L8.843 11.9233L2.40625 2.75H8.06572L11.9884 8.34127L16.9034 2.75H19.1077L12.9697 9.73737L19.6425 19.25H13.9831ZM16.4378 17.5775H14.9538L5.56249 4.42252H7.04674L10.808 9.6899L11.4584 10.6039L16.4378 17.5775Z"
                        fill="currentColor"
                      />
                    </svg>
                  </a>

                  <a
                    href="https://www.instagram.com/paarsh_edu/"
                    aria-label="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-6 text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7 2C4.2 2 2 4.2 2 7V17C2 19.8 4.2 22 7 22H17C19.8 22 22 19.8 22 17V7C22 4.2 19.8 2 17 2H7ZM4 7C4 5.3 5.3 4 7 4H17C18.7 4 20 5.3 20 7V17C20 18.7 18.7 20 17 20H7C5.3 20 4 18.7 4 17V7ZM12 7C9.2 7 7 9.2 7 12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12C17 9.2 14.8 7 12 7ZM9 12C9 10.3 10.3 9 12 9C13.7 9 15 10.3 15 12C15 13.7 13.7 15 12 15C10.3 15 9 13.7 9 12ZM17.5 6.5C17.5 6.8 17.3 7 17 7C16.7 7 16.5 6.8 16.5 6.5C16.5 6.2 16.7 6 17 6C17.3 6 17.5 6.2 17.5 6.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </a>

                  <a
                    href="https://www.youtube.com/@PaarshEDU"
                    aria-label="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-6 text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 18 14"
                      className="fill-current"
                    >
                      <path d="M17.5058 2.07119C17.3068 1.2488 16.7099 0.609173 15.9423 0.395963C14.5778 7.26191e-08 9.0627 0 9.0627 0C9.0627 0 3.54766 7.26191e-08 2.18311 0.395963C1.41555 0.609173 0.818561 1.2488 0.619565 2.07119C0.25 3.56366 0.25 6.60953 0.25 6.60953C0.25 6.60953 0.25 9.68585 0.619565 11.1479C0.818561 11.9703 1.41555 12.6099 2.18311 12.8231C3.54766 13.2191 9.0627 13.2191 9.0627 13.2191C9.0627 13.2191 14.5778 13.2191 15.9423 12.8231C16.7099 12.6099 17.3068 11.9703 17.5058 11.1479C17.8754 9.68585 17.8754 6.60953 17.8754 6.60953C17.8754 6.60953 17.8754 3.56366 17.5058 2.07119ZM7.30016 9.44218V3.77687L11.8771 6.60953L7.30016 9.44218Z" />
                    </svg>
                  </a>


                </div>
              </div>
            </div>

            <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
              <div className="mb-12 lg:mb-10">
                <h1 className="mb-5 text-xl font-bold text-black dark:text-white">
                  Useful Links
                </h1>
                <ul>
                  <li>
                    <Link
                      href="/"
                      className="mb-2 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="mb-2 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      About Us
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/contact"
                      className="mb-2 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Contact Us
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/blog"
                      className="mb-2 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Blogs
                    </Link>
                  </li>

                </ul>
              </div>
            </div>

            <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
              <div className="mb-12 lg:mb-10">
                <h1 className="mb-5 text-xl font-bold text-black dark:text-white">
                  Useful Links
                </h1>
                <ul>
                  <li>
                    <Link
                      href="/newcourses"
                      className="mb-2 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Courses
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/careers"
                      className="mb-2 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/founders"
                      className="mb-2 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Our Founders
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="mb-2 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >
                      Become Partners
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="mb-2 inline-block text-base text-body-color duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                    >

                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="w-full px-4 md:w-1/2 lg:w-4/12 xl:w-3/12">
              <div className="mb-12 lg:mb-10">
                <h1 className="mb-5 text-xl font-bold text-black dark:text-white">
                  Get In Touch
                </h1>
                <ul>
                  <li>
                    <div className="mb-2 flex items-center space-x-3">
                      {/* Mail Icon */}
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-500 mt-1"
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

                      {/* Email Address */}
                      <a
                        href="mailto:info@paarshedu.com"
                        className="text-body-color transition duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                      >
                        info@paarshedu.com
                      </a>
                    </div>
                  </li>
                  <li>
                    <div className="mb-2 flex items-center space-x-3">
                      {/*phone */}
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="gray"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mt-1"
                      >
                        <path d="M6.6 10.8C8 13.7 10.3 16 13.2 17.4L15.4 15.2C15.7 14.9 16.1 14.8 16.5 14.9L20.8 15.9C21.4 16.1 21.8 16.6 21.8 17.2V21C21.8 21.6 21.3 22.1 20.7 22C15.4 21.4 10.7 18.7 7.3 15.3C3.9 11.9 1.2 7.2 0.6 2C0.5 1.4 1 0.9 1.6 0.9H5.4C6 0.9 6.5 1.3 6.6 1.9L7.6 6.2C7.7 6.6 7.6 7 7.3 7.3L5.1 9.5C5.4 9.9 6 10.4 6.6 10.8Z" />
                      </svg>

                      {/* phone*/}
                      <a
                        href="tel:+919075201035"
                        className="text-body-color transition duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                      >
                        +91 90752 01035
                      </a>
                    </div>
                  </li>
                  <li>
                    <div className="mb-2 flex space-x-2">
                      {/* address */}
                      <svg
                        width="38"
                        height="38"
                        viewBox="0 0 24 24"
                        fill="gray"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mt-1"
                      >
                        <path d="M12 2C8.1 2 5 5.1 5 9C5 13.2 9.9 19.3 11.6 21.2C11.8 21.4 12.2 21.4 12.4 21.2C14.1 19.3 19 13.2 19 9C19 5.1 15.9 2 12 2ZM12 11C10.3 11 9 9.7 9 8C9 6.3 10.3 5 12 5C13.7 5 15 6.3 15 8C15 9.7 13.7 11 12 11Z" />
                      </svg>

                      {/* Address */}
                      <a
                        href="https://maps.google.com/?q=Paarsh+Infotech+Pvt+Ltd+Nashik"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body-color transition duration-300 hover:text-primary dark:text-body-color-dark dark:hover:text-primary"
                      >
                        Paarsh Infotech Pvt Ltd. Mumbai Naka, Nashik - 422001
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D2D8E183] to-transparent dark:via-[#959CB183]"></div>
          <div className="py-8 flex justify-between items-center">
            {/* Left Side - Copyright */}
            <p className="text-base text-body-color dark:text-white">
              &copy; 2024-25 Paarsh Edu. All rights reserved.
            </p>

            {/* Right Side - Terms & Privacy Policy */}
            <div className="flex space-x-4 mr-5">
              <a
                href="/returnpolicy"
                className="text-base text-body-color dark:text-white hover:text-primary"
              >
                Return Policy
              </a>
              <a
                href="/termscondition"
                className="text-base text-body-color dark:text-white hover:text-primary"
              >
                Terms & Conditions
              </a>
              <a
                href="/privacypolicy"
                className="text-base text-body-color dark:text-white hover:text-primary"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-14 z-[-1]">
          <svg
            width="55"
            height="99"
            viewBox="0 0 55 99"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle opacity="0.8" cx="49.5" cy="49.5" r="49.5" fill="#959CB1" />
            <mask
              id="mask0_94:899"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="99"
              height="99"
            >
              <circle
                opacity="0.8"
                cx="49.5"
                cy="49.5"
                r="49.5"
                fill="#4A6CF7"
              />
            </mask>
            <g mask="url(#mask0_94:899)">
              <circle
                opacity="0.8"
                cx="49.5"
                cy="49.5"
                r="49.5"
                fill="url(#paint0_radial_94:899)"
              />
              <g opacity="0.8" filter="url(#filter0_f_94:899)">
                <circle cx="53.8676" cy="26.2061" r="20.3824" fill="white" />
              </g>
            </g>
            <defs>
              <filter
                id="filter0_f_94:899"
                x="12.4852"
                y="-15.1763"
                width="82.7646"
                height="82.7646"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feGaussianBlur
                  stdDeviation="10.5"
                  result="effect1_foregroundBlur_94:899"
                />
              </filter>
              <radialGradient
                id="paint0_radial_94:899"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(49.5 49.5) rotate(90) scale(53.1397)"
              >
                <stop stopOpacity="0.47" />
                <stop offset="1" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
        <div className="absolute bottom-24 left-0 z-[-1]">
          <svg
            width="79"
            height="94"
            viewBox="0 0 79 94"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              opacity="0.3"
              x="-41"
              y="26.9426"
              width="66.6675"
              height="66.6675"
              transform="rotate(-22.9007 -41 26.9426)"
              fill="url(#paint0_linear_94:889)"
            />
            <rect
              x="-41"
              y="26.9426"
              width="66.6675"
              height="66.6675"
              transform="rotate(-22.9007 -41 26.9426)"
              stroke="url(#paint1_linear_94:889)"
              strokeWidth="0.7"
            />
            <path
              opacity="0.3"
              d="M50.5215 7.42229L20.325 1.14771L46.2077 62.3249L77.1885 68.2073L50.5215 7.42229Z"
              fill="url(#paint2_linear_94:889)"
            />
            <path
              d="M50.5215 7.42229L20.325 1.14771L46.2077 62.3249L76.7963 68.2073L50.5215 7.42229Z"
              stroke="url(#paint3_linear_94:889)"
              strokeWidth="0.7"
            />
            <path
              opacity="0.3"
              d="M17.9721 93.3057L-14.9695 88.2076L46.2077 62.325L77.1885 68.2074L17.9721 93.3057Z"
              fill="url(#paint4_linear_94:889)"
            />
            <path
              d="M17.972 93.3057L-14.1852 88.2076L46.2077 62.325L77.1884 68.2074L17.972 93.3057Z"
              stroke="url(#paint5_linear_94:889)"
              strokeWidth="0.7"
            />
            <defs>
              <linearGradient
                id="paint0_linear_94:889"
                x1="-41"
                y1="21.8445"
                x2="36.9671"
                y2="59.8878"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" stopOpacity="0.62" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_94:889"
                x1="25.6675"
                y1="95.9631"
                x2="-42.9608"
                y2="20.668"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" stopOpacity="0" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0.51" />
              </linearGradient>
              <linearGradient
                id="paint2_linear_94:889"
                x1="20.325"
                y1="-3.98039"
                x2="90.6248"
                y2="25.1062"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" stopOpacity="0.62" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint3_linear_94:889"
                x1="18.3642"
                y1="-1.59742"
                x2="113.9"
                y2="80.6826"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" stopOpacity="0" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0.51" />
              </linearGradient>
              <linearGradient
                id="paint4_linear_94:889"
                x1="61.1098"
                y1="62.3249"
                x2="-8.82468"
                y2="58.2156"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" stopOpacity="0.62" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint5_linear_94:889"
                x1="65.4236"
                y1="65.0701"
                x2="24.0178"
                y2="41.6598"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" stopOpacity="0" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0.51" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </footer>
    </>
  );
};

export default Footer;
