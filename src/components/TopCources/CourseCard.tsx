import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface CourseCardProps {
  title: string;
  instructor: string;
  duration: string;
  level: string;
  imageUrl: string;
}

export default function CourseCard({ title, instructor, duration, level, imageUrl }: CourseCardProps) {
  return (
    <Card className="h-full w-full sm:w-[90%] md:w-[80%] lg:w-[95%] dark:bg-gray-800 flex flex-col">
      <div className="relative w-full h-44 sm:h-52 md:h-56">
        <Image 
          src={imageUrl} 
          alt={title} 
          fill 
          className="object-cover rounded-t-md"
          priority
        />
      </div>
      <CardHeader className="pb-2 px-4">
        <CardTitle className="text-base sm:text-lg font-semibold line-clamp-2">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-gray-500">{instructor}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-2 px-4">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">📅 Duration: {duration}</p>
      </CardContent>
      <CardFooter className="pt-0 px-4">
        <Badge variant="secondary" className="text-xs sm:text-sm px-2 py-1">{level}</Badge>
      </CardFooter>
    </Card>
  );
}
