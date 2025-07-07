export interface Blog {
  _id: string;
  title: string;
  paragraph: string;
  image: string;
  author: {
    name: string;
    designation: string;
    image: string;
    authorimage?: string;
  };
  tags: string[];
  publishDate: string;
  createdAt?: string;
  updatedAt?: string;
}