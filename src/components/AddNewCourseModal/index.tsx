"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/dialog"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner";
import TextEditor from "../Editor";

const formSchema = z.object({
    courseName: z.string().min(1, "Course name is required"),
    price: z.string().min(1, "Price is required"),
    duration: z.string().min(1, "Duration is required"),
    level: z.string().min(1, "Level is required"),
    thumbnail: z.instanceof(File).refine(file => file.size > 0, {message: "Thumbnail is required",}),
    tagline_in_the_box: z.string().min(1, "Tagline is required"),
});

export function AddNewCourse() {
    const [open, setOpen] = React.useState(false);
    const [editorContent, setEditorContent] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = (data) => {
        console.log("New Course : ", { ...data, editorContent });
        setOpen(false);
    };

    const [items, setItems] = useState([[], [], [], []]);
    const [inputValues, setInputValues] = useState(['', '', '', '']);

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
                        <div className="w-1/2">
                            <Label htmlFor="duration">Languages</Label>
                            <Input id="duration" className="mt-2 w-full" type="text" {...register("duration")} />
                            {errors.duration && <p className="text-red-500">{errors.duration.message}</p>}
                        </div>
                        <div className="w-1/2">
                            <Label htmlFor="level">Course Price</Label>
                            <Input id="level" className="mt-2 w-full" type="text" {...register("level")} />
                            {errors.level && <p className="text-red-500">{errors.level.message}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-full">
                            <Label htmlFor="duration">Summary Text Line</Label>
                            <Input id="duration" className="mt-2 w-full" type="text" {...register("duration")} />
                            {errors.duration && <p className="text-red-500">{errors.duration.message}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <Label htmlFor="duration">Introduction Video Link</Label>
                            <Input id="duration" className="mt-2 w-full" type="text" {...register("duration")} />
                            {errors.duration && <p className="text-red-500">{errors.duration.message}</p>}
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

                    {/* <div className="flex gap-4">
                        <div className="w-1/2">
                            <Label htmlFor="duration">Paragraph 1</Label>
                            <Input id="duration" className="mt-2 w-full" type="text" {...register("duration")} />
                            {errors.duration && <p className="text-red-500">{errors.duration.message}</p>}
                        </div>
                        <div className="w-1/2">
                            <Label htmlFor="level">Paragraph 2</Label>
                            <Input id="level" className="mt-2 w-full" type="text" {...register("level")} />
                            {errors.level && <p className="text-red-500">{errors.level.message}</p>}
                        </div>
                    </div> */}

                    <div className="flex gap-4">

                        <div className="w-1/2">
                            <Label htmlFor="duration">Tagline for the Course Includes</Label>
                            <Input id="duration" className="mt-2 w-full" type="text" {...register("duration")} />
                            {errors.duration && <p className="text-red-500">{errors.duration.message}</p>}
                        </div>

                        <div className="w-1/2">
                            <Label htmlFor="level">Tagline for the Overview</Label>
                            <Input id="level" className="mt-2 w-full" type="text" {...register("level")} />
                            {errors.level && <p className="text-red-500">{errors.level.message}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <Label htmlFor="tagline_in_the_box">Tagline in the Box</Label>
                            <Input id="tagline_in_the_box" className="mt-2 w-full" type="text" {...register("tagline_in_the_box")} />
                            {errors.duration && <p className="text-red-500">{errors.duration.message}</p>}
                        </div>
                        <div className="w-1/2">
                            <Label htmlFor="level">Final Text</Label>
                            <Input id="level" className="mt-2 w-full" type="text" {...register("level")} />
                            {errors.level && <p className="text-red-500">{errors.level.message}</p>}
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
                    <Button className="bg-blue-600 w-full dark:text-white">Upload Syllabus</Button>
                </div>

                <DialogFooter>
                    <Button type="submit">Add Course</Button>
                </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        
    )
}