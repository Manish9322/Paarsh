export type Course = {
  _id: string;
  id: string;
  title: string;
  courseName:string;
  tagline:string;
  image: string;
  paragraph: string;
  level: string;
  tags: string[];
  duration: string;
  lang: string;
  certificate: string;
  student: string;
  availability: string; // New field
  category: string; // New field
  courseFees: number; // New field
  courseType: string; // New field
  instructor: string; // New field
  keywords: string[]; // New field
  languages: string[]; // New field
  longDescription: string; // New field
  shortDescription: string; // New field
  thumbnailImage: string; // New field
};