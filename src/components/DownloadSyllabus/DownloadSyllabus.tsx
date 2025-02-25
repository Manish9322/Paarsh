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
import React from "react";

const DownloadSyllabus: React.FC = () => {

    // This Code is handling the PDF Downloading on the browser.
    const handleDownload = () => {
        const pdfPath = "pdf/Manish-Sonawane-FSD.pdf";
        window.location.href = pdfPath;
    };

    return (
        <div className="fixed bottom-8 right-20 z-[50]">
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="p-4 border-none text-base font-light sm:text-lg lg:text-base bg-blue-600 text-white hover:text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700" variant="outline">Download Syllabus</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Download Syllabus</DialogTitle>
                        <DialogDescription>
                            Click the button below to download the syllabus and start your learning journey.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input id="name" value="Manish Sonawane" className="col-span-3 rounded" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                                Username
                            </Label>
                            <Input id="username" value="Manishsonawane3010" className="col-span-3 rounded outline-none" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="bg-blue-600 hover:bg-blue-700 rounded" type="submit" onClick={handleDownload}>Download</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default DownloadSyllabus;