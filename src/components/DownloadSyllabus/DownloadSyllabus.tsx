"use client";

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useFetchCourcebyIdQuery } from "@/services/api"; // Adjust the import path as needed

interface DownloadSyllabusProps {
    courseName?: string;
}

// Define the interface for the course info
interface CourseInfo {
    level?: string;
    duration?: string;
    courseName?: string;
    [key: string]: any; // For any other properties
}

const DownloadSyllabus: React.FC<DownloadSyllabusProps> = ({ courseName }) => {
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        email: "",
        courseName: "",
        courseId: "",
        courseInfo: null as CourseInfo | null
    });
    const [errors, setErrors] = useState({
        name: "",
        contact: "",
        email: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Get course ID from URL for the API query
    const courseId = searchParams?.get("courseId") || "";
    const { data: courseData } = useFetchCourcebyIdQuery(courseId);

    console.log("Course Data:", courseData); // Debugging line to check course data
    
    useEffect(() => {
        // Try to get course name from props first
        if (courseName) {
            setFormData(prev => ({ 
                ...prev, 
                courseName,
                courseId: searchParams?.get("courseId") || ""
            }));
            return;
        }
        
        // Use course data from useFetchCourcebyIdQuery
        if (courseData?.data) {
            setIsSubmitting(true);
            setFormData(prev => ({ 
                ...prev, 
                courseName: courseData.data.courseName || `Course from ID ${courseId}`,
                courseId: courseId,
                courseInfo: courseData.data
            }));
            setIsSubmitting(false);
        }
    }, [courseName, searchParams, courseData]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value,
        });
        
        // Clear errors when user types
        if (errors[id]) {
            setErrors({
                ...errors,
                [id]: "",
            });
        }
    };

    // Validate the form data
    const validateForm = () => {
        let valid = true;
        const newErrors = { name: "", contact: "", email: "" };
        
        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
            valid = false;
        }
        
        // Contact validation
        if (!formData.contact.trim()) {
            newErrors.contact = "Contact number is required";
            valid = false;
        } else if (!/^[0-9]{10}$/.test(formData.contact.trim())) {
            newErrors.contact = "Please enter a valid 10-digit contact number";
            valid = false;
        }
        
        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = "Please enter a valid email address";
            valid = false;
        }
        
        setErrors(newErrors);
        return valid;
    };

    // Submit enquiry to backend
    const submitEnquiry = async () => {
        try {
            // Extract course details for the enquiry
            const courseDetails = formData.courseInfo ? {
                level: formData.courseInfo.level || '',
                duration: formData.courseInfo.duration || '',
                // Include other relevant course details here
            } : {};
            
            // Form the enquiry object with detailed course information
            const enquiry = {
                name: formData.name,
                email: formData.email,
                mobile: formData.contact,
                subject: `Syllabus Download Request - ${formData.courseName || "Course"}`,
                message: `User has requested to download the syllabus for ${formData.courseName || "a course"}.`,
                status: "pending",
                courseId: formData.courseId || searchParams?.get("courseId") || "",
                courseName: formData.courseName || "",
                courseDetails, // Add course details to the enquiry
                source: "syllabus_download",
                downloadedAt: new Date().toISOString()
            };
            
            console.log("Sending enquiry data:", enquiry);
            
            // Send to your API
            const response = await fetch("/api/enquiries/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(enquiry),
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || "Failed to submit enquiry");
            }
            
            return true;
        } catch (error) {
            console.error("Error submitting enquiry:", error);
            // Continue with the download anyway to provide good UX even if tracking fails
            return false;
        }
    };

    // Handle form submission and download
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Submit enquiry first
            const enquirySubmitted = await submitEnquiry();
            
            // Then download the PDF
            handleDownload();
            
            // Reset form and close modal with a delay to ensure download starts
            setTimeout(() => {
                setFormData({
                    name: "",
                    contact: "",
                    email: "",
                    courseName: formData.courseName, // Keep the course name
                    courseId: formData.courseId, // Keep the course ID
                    courseInfo: formData.courseInfo // Keep the course info
                });
                
                setOpen(false);
                
                if (enquirySubmitted) {
                    toast.success("Thank you for your interest! Your details have been saved and the syllabus is downloading.");
                } else {
                    toast.success("Your syllabus is downloading. You may need to check your browser download folder.");
                }
            }, 1000);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong. Please try again.");
            // Try direct download as fallback
            handleDownload();
        } finally {
            // Set submitting to false after a delay to prevent UI flicker
            setTimeout(() => {
                setIsSubmitting(false);
            }, 1500);
        }
    };

    // This Code is handling the PDF Downloading on the browser.
    const handleDownload = () => {
        // Use syllabus from courseData if available, otherwise fallback to default
        let pdfPath = courseData?.data?.syllabus || "pdf/Manish-Sonawane-FSD.pdf"; // Default syllabus
        
        // Start the download
        window.location.href = pdfPath;
    };

    return (
        <div className="fixed bottom-8 right-20 z-[20]">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button 
                        className="p-4 border-none text-base font-semibold sm:text-lg lg:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:text-white hover:from-blue-700 hover:to-blue-800 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg" 
                        variant="outline"
                    >
                        Download Syllabus
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Download Syllabus</DialogTitle>
                        <DialogDescription>
                            {formData.courseName ? 
                                `Fill in your details to download the syllabus for "${formData.courseName}".` : 
                                "Fill in your details to download the syllabus and start your learning journey."}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {/* Display course info if available */}
                    {formData.courseInfo && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                                Course Information:
                            </h4>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                {formData.courseInfo.level && (
                                    <span className="inline-block mr-2">Level: {formData.courseInfo.level}</span>
                                )}
                                {formData.courseInfo.duration && (
                                    <span className="inline-block mr-2">Duration: {formData.courseInfo.duration}</span>
                                )}
                            </p>
                        </div>
                    )}
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <div className="col-span-3">
                                <Input 
                                    id="name" 
                                    className={`rounded ${errors.name ? "border-red-500" : ""}`} 
                                    placeholder="Enter Your Name Here..." 
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contact" className="text-right">
                                Contact
                            </Label>
                            <div className="col-span-3">
                                <Input 
                                    id="contact" 
                                    className={`rounded ${errors.contact ? "border-red-500" : ""}`} 
                                    placeholder="Enter Your Contact Number Here..." 
                                    value={formData.contact}
                                    onChange={handleChange}
                                />
                                {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <div className="col-span-3">
                                <Input 
                                    id="email" 
                                    className={`rounded ${errors.email ? "border-red-500" : ""}`} 
                                    placeholder="Enter Your Email Here..." 
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            className="bg-blue-600 hover:bg-blue-700 rounded" 
                            type="submit" 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Processing..." : "Download"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default DownloadSyllabus;