"use client";

import { useState, useEffect } from "react";
import CourseCard from "./CourseCard";

const initialCourses = [
  { id: 1, title: "Introduction to React", instructor: "Jane Doe", duration: "8 weeks", level: "Beginner", imageUrl: "/images/brands/next.jpg" },
  { id: 2, title: "Advanced JavaScript", instructor: "John Smith", duration: "10 weeks", level: "Intermediate", imageUrl: "/images/brands/next.jpg" },
  { id: 3, title: "UI/UX Design Fundamentals", instructor: "Alice Johnson", duration: "6 weeks", level: "Beginner", imageUrl: "/images/brands/next.jpg" },
  { id: 4, title: "Node.js Backend Development", instructor: "Bob Wilson", duration: "12 weeks", level: "Advanced", imageUrl: "/images/brands/next.jpg" },
  { id: 5, title: "Python for Data Science", instructor: "Eva Brown", duration: "9 weeks", level: "Intermediate", imageUrl: "/images/brands/next.jpg" },
  { id: 6, title: "Mobile App Development with React Native", instructor: "Chris Lee", duration: "11 weeks", level: "Intermediate", imageUrl: "/images/brands/next.jpg" },
];

const TRANSITION_DURATION = 500; // Slide transition time in ms
const PAUSE_DURATION = 2000; // Pause before sliding

export default function IntervalCarousel() {
  const [coursesList, setCoursesList] = useState(initialCourses);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3); // Default: Desktop view

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1); // Mobile view: 1 card
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2); // Tablet view: 2 cards
      } else {
        setItemsPerView(3); // Desktop view: 3 cards
      }
    };
    
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  useEffect(() => {
    let timeoutId;
    const slide = () => {
      setCurrentIndex(1);
      timeoutId = setTimeout(() => {
        setCoursesList((prev) => {
          const [first, ...rest] = prev;
          return [...rest, first];
        });
        setCurrentIndex(0);
        timeoutId = setTimeout(slide, PAUSE_DURATION);
      }, TRANSITION_DURATION);
    };

    timeoutId = setTimeout(slide, PAUSE_DURATION);
    return () => clearTimeout(timeoutId);
  }, []);

  const cardWidth = 300;
  const cardGap = 16;
  const containerWidth = (cardWidth * itemsPerView) + (cardGap * (itemsPerView - 1));
  const innerWidth = (coursesList.length * cardWidth) + (coursesList.length * cardGap);
  const slideOffset = currentIndex * (cardWidth + cardGap);

  return (
    <div className="mx-auto px-4">
      <div className="flex justify-center flex-col items-center">
        <h2 className="text-4xl font-bold text-center my-6">Top Rated <span className="text-blue-600">Courses</span></h2>
        <p className="mb-12 text-base !leading-relaxed text-body-color md:text-lg">Unlock your potential with our top-rated courses—expert-led, career-boosting, and designed to help you succeed in every field!</p>
      </div>
      <div className="overflow-hidden mx-auto" style={{ width: `${containerWidth}px` }}>
        <div
          className="flex"
          style={{
            transform: `translateX(-${slideOffset}px)`,
            transition: currentIndex === 1 ? `transform ${TRANSITION_DURATION}ms ease-in-out` : "none",
            width: `${innerWidth}px`,
          }}
        >
          {coursesList.map((course) => (
            <a href="/blog-sidebar" key={course.id} style={{ textDecoration: "none" }}>
              <div
                className="flex-shrink-0"
                style={{ width: `${cardWidth}px`, marginRight: `${cardGap}px` }}
              >
                <CourseCard {...course} />
              </div>
            </a>
          ))}
          <div className="flex-shrink-0" style={{ width: `${cardGap}px` }} />
        </div>
      </div>
    </div>
  );
}
