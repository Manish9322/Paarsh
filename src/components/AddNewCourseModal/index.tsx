"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HiOutlineTrash, HiOutlinePlus, HiOutlineCheck } from "react-icons/hi";
import { TbCoinRupeeFilled } from "react-icons/tb";
import { IoIosTime } from "react-icons/io";
import { LiaSignalSolid } from "react-icons/lia";
import { BiWorld } from "react-icons/bi";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import TextEditor from "../Editor";
import UploadSyllabusButton from "../UploadSyllabus";


const formSchema = z.object({
    courseName: z.string().min(1, "Course name is required"),
    price: z.string().min(1, "Price is required"),
    duration: z.string().min(1, "Duration is required"),
    level: z.string().min(1, "Level is required"),
    coursePrice: z.string().min(1, "Price is required"),
    videoLink: z.string().min(1, "Invalid YouTube video ID"),
    languages: z.string().min(1, "Language is required"),
    certificate: z.enum(['yes', 'no'], { errorMap: () => ({ message: "Certificate is required" }) }),
    thumbnail: z.instanceof(FileList).refine(fileList => fileList.length > 0, { message: "Thumbnail is required" }),
    summaryText: z.string().min(1, "Summary is required"),
    tagline_in_the_box: z.string().min(1, "Tagline is required"),
    taglineIncludes: z.string().min(1, "Tagline is required"),
    overviewTagline: z.string().min(1, "Tagline is required"),
    finalText: z.string().min(1, "Final Text is required"),

});

export function AddNewCourse() {
    const [open, setOpen] = React.useState(false);
    const [editorContent, setEditorContent] = useState('');
    const [items, setItems] = useState([[], [], [], []]);
    const [inputValues, setInputValues] = useState(['', '', '', '']);
    const [syllabusFile, setSyllabusFile] = useState<File | null>(null); // State to hold the syllabus file


    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = (data) => {
        const file = data.thumbnail[0];


        const formatVideoLink = (videoId) => {
            return `https://www.youtube.com/watch?v=${videoId}&ab_channel=PaarshInfotech`;
        };
        const formattedVideoLink = formatVideoLink(data.videoLink.trim());

        const combinedData = {
            ...data,
            thumbnail: file,
            editorContent,
            cardItems: items,
            videoLink: formattedVideoLink,
            syllabus: syllabusFile,
        };

        console.log("New Course : ", combinedData);
        setOpen(false);
    };

    const handleInputChange = (index, e) => {
        const newInputValues = [...inputValues];
        newInputValues[index] = e.target.value;
        setInputValues(newInputValues);
    };

    const handleSave = (index) => {
        if (inputValues[index].trim()) {
            const newItems = [...items];
            newItems[index] = [...newItems[index], inputValues[index]];
            setItems(newItems);

            const newInputValues = [...inputValues];
            newInputValues[index] = '';
            setInputValues(newInputValues);
        }
    };

    const handleDelete = (cardIndex, itemIndex) => {
        const newItems = [...items];
        newItems[cardIndex] = newItems[cardIndex].filter((_, i) => i !== itemIndex);
        setItems(newItems);
    };

    const cardTitles = ["This Course Includes", "Syllabus Overview", "Some Thoughts", "Popular Tags"];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="inline-flex items-center justify-center rounded bg-primary px-4 py-2 text-sm font-semibold text-white dark:bg-blue-600">Add</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[950px] max-h-[75vh] overflow-y-auto p-4">
                <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                    <DialogDescription>
                        Add New Course From Here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 border-t">
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <Label htmlFor="courseName">Course Name</Label>
                            <Input id="courseName" className="mt-2 w-full" {...register("courseName")} />
                            {errors.courseName && <p className="text-red-500">{errors.courseName.message}</p>}
                        </div>
                        <div className="w-1/2">
                            <Label htmlFor="price">Tagline</Label>
                            <Input id="price" className="mt-2 w-full" type="text" {...register("price")} />
                            {errors.price && <p className="text-red-500">{errors.price.message}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <Label htmlFor="duration">Difficulty Level</Label>
                            <Input id="duration" className="mt-2 w-full" type="text" {...register("duration")} />
                            {errors.duration && <p className="text-red-500">{errors.duration.message}</p>}
                        </div>
                        <div className="w-1/2">
                            <Label htmlFor="level">Course Duration</Label>
                            <Input id="level" className="mt-2 w-full" type="text" {...register("level")} />
                            {errors.level && <p className="text-red-500">{errors.level.message}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/3">
                            <Label htmlFor="languages">Languages</Label>
                            <Input id="languages" className="mt-2 w-full" type="text" {...register("languages")} />
                            {errors.languages && <p className="text-red-500">{errors.languages.message}</p>}
                        </div>

                        <div className="w-1/3">
                            <Label htmlFor="certificate">Certificate</Label>
                            <select id="certificate" className="pl-2 text-sm mt-2 w-full h-10 rounded-md border" {...register("certificate")}>
                                <option value="">Course Have Certificate Or Not ?</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                            {errors.certificate && <p className="text-red-500">{errors.certificate.message}</p>}
                        </div>

                        <div className="w-1/3">
                            <Label htmlFor="coursePrice">Course Price</Label>
                            <Input id="coursePrice" className="mt-2 w-full" type="text" {...register("coursePrice")} />
                            {errors.coursePrice && <p className="text-red-500">{errors.coursePrice.message}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-full">
                            <Label htmlFor="summaryText">Summary Text Line</Label>
                            <Input id="summaryText" className="mt-2 w-full" type="text" {...register("summaryText")} />
                            {errors.summaryText && <p className="text-red-500">{errors.summaryText.message}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <Label htmlFor="videoLink">Introduction Video Link</Label>
                            <Input id="videoLink" className="mt-2 w-full" type="text" {...register("videoLink")} />
                            {errors.videoLink && <p className="text-red-500">{errors.videoLink.message}</p>}
                        </div>
                        <div className="w-1/2">
                            <Label htmlFor="thumbnail">Thumbnail Image</Label>
                            <Input
                                id="thumbnail"
                                className="mt-2 w-full"
                                type="file"
                                accept="image/*"
                                {...register("thumbnail")}
                            />
                            {errors.thumbnail && <p className="text-red-500">{errors.thumbnail.message}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <Label htmlFor="taglineIncludes">Tagline for the Course Includes</Label>
                            <Input id="taglineIncludes" className="mt-2 w-full" type="text" {...register("taglineIncludes")} />
                            {errors.taglineIncludes && <p className="text-red-500">{errors.taglineIncludes.message}</p>}
                        </div>

                        <div className="w-1/2">
                            <Label htmlFor="overviewTagline">Tagline for the Overview</Label>
                            <Input id="overviewTagline" className="mt-2 w-full" type="text" {...register("overviewTagline")} />
                            {errors.overviewTagline && <p className="text-red-500">{errors.overviewTagline.message}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <Label htmlFor="taglineInTheBox">Tagline in the Box</Label>
                            <Input id="taglineInTheBox" className="mt-2 w-full" type="text" {...register("tagline_in_the_box")} />
                            {errors.tagline_in_the_box && <p className="text-red-500">{errors.tagline_in_the_box.message}</p>}
                        </div>
                        <div className="w-1/2">
                            <Label htmlFor="finalText">Final Text</Label>
                            <Input id="finalText" className="mt-2 w-full" type="text" {...register("finalText")} />
                            {errors.finalText && <p className="text-red-500">{errors.finalText.message}</p>}
                        </div>
                    </div>

                    <TextEditor onChange={setEditorContent} />

                    <div className="main-container">
                        <div className="container grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {cardTitles.map((title, cardIndex) => (
                                <Card key={cardIndex} className="w-full mr-4">
                                    <div className="boxCardHeader flex items-center justify-between">
                                        <div className="cardPart-1">
                                            <CardHeader>
                                                <h2 className="text-lg font-bold py-2">{title}</h2>
                                            </CardHeader>
                                        </div>
                                        <div className="cardPart-2 ml-4 pr-6">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline">
                                                        <HiOutlinePlus />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>Share link</DialogTitle>
                                                        <DialogDescription>
                                                            Anyone who has this link will be able to view this.
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="flex items-center space-x-2">
                                                        <div className="grid flex-1 gap-2">
                                                            <Label htmlFor={`link-${cardIndex}`} className="sr-only">
                                                                Link
                                                            </Label>
                                                            <Input
                                                                id={`link-${cardIndex}`}
                                                                value={inputValues[cardIndex]}
                                                                onChange={(e) => handleInputChange(cardIndex, e)}
                                                                placeholder="Enter Description Here"
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter className="sm:justify-start">
                                                        <Button type="button" onClick={() => handleSave(cardIndex)}>
                                                            Save
                                                        </Button>
                                                        <DialogClose asChild>
                                                            <Button type="button" variant="secondary">
                                                                Close
                                                            </Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                    <CardContent>
                                        <form>
                                            <div className="grid w-full items-center gap-4">
                                                <div className="flex flex-col space-y-1.5">
                                                    <ul className="mt-4">
                                                        {items[cardIndex].map((item, itemIndex) => (
                                                            <li key={itemIndex} className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center">
                                                                    <HiOutlineCheck className="mr-4 w-4 h-4 flex-shrink-0" />
                                                                    {item}
                                                                </div>
                                                                <Button onClick={() => handleDelete(cardIndex, itemIndex)} variant="outline" className="text-red-500">
                                                                    <HiOutlineTrash />
                                                                </Button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="w-fit container">
                        <UploadSyllabusButton onFileSelect={setSyllabusFile} />

                    </div>

                    <DialogFooter>
                    <Button type="submit" className="bg-blue-600" onClick={handleSubmit(onSubmit)}>Add Course</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}