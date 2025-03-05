import { Blog } from "@/types/blog";

const blogData: Blog[] = [
  {
    id: 1,
    title: "Demystifying MVC Framework in PHP",
    paragraph:
      "In the realm of web development, the Model-View-Controller (MVC) architectural pattern stands as one of the most influential paradigms.",
    image: "/images/blog/tutorial.png",
    author: {
      name: "Mr.Aditya Mahajan",
      image: "/images/blog/aaditya.jpg",
      designation: "Web Developer",
    },
    tags: ["creative"],
    publishDate: "2025",
  },
  {
    id: 2,
    title: "Hey, When Did Intrinsic Web Design Become the Norm? ",
    paragraph:
      "I’ll admit it: I rarely think about the mechanisms of “old school” Responsive Web Design (RWD) any more.",
    image: "/images/blog/web.jpg",
    author: {
      name: "Mr.Manish Sonawane",
      image: "/images/blog/manish.jpg",
      designation: "Web Developer ",
    },
    tags: ["computer"],
    publishDate: "2025",
  },
  {
    id: 3,
    title: "Why Machine Learning Is A Metaphor For Life",
    paragraph:
      "Blockchain secures transactions, improves transparency, and finds applications in finance, healthcare, and logistics.",
    image: "/images/blog/ml.jpg",
    author: {
      name: "Mr. Rutik Ahire",
      image: "/images/blog/rutik.jpg",
      designation: "Sr. Data Science Engineer",
    },
    tags: ["design"],
    publishDate: "2025",
  },
  {
    id: 4,
    title: "Blockchain Beyond Cryptocurrency",
    paragraph:
      "Blockchain secures transactions, improves transparency, and finds applications in finance, healthcare, and logistics.",
    image: "/images/blog/blog-03.jpg",
    author: {
      name: "Miss.Pranjal Mahajan",
      image: "/images/blog/pranjal.jpg",
      designation: "Cloud Developer",
    },
    tags: ["design"],
    publishDate: "2025",
  },
];
export default blogData;
