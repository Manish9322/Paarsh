"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { HiOutlineTrash, HiOutlinePlus, HiOutlineCheck } from "react-icons/hi";
import { TbCoinRupeeFilled } from "react-icons/tb";
import { TiStarFullOutline } from "react-icons/ti";
import { IoIosTime } from "react-icons/io";
import { LiaSignalSolid } from "react-icons/lia";
import { TbAlertSquareRoundedFilled } from "react-icons/tb";
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

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PreviewCourse() {

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
        <Button variant="outline" className="inline-flex items-center justify-center rounded bg-primary px-4 py-2 text-sm font-semibold text-white dark:bg-blue-600">Preview</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[950px] max-h-[75vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle>Preview Course</DialogTitle>
          <DialogDescription>
            Make changes to your course here. Click save when you are done.
          </DialogDescription>
        </DialogHeader>

        <div className="main-container">
          <div className="container border-t border-b p-4 flex flex-col sm:flex-row overflow-hidden">
            <div className="part-1 px-4 pl-0 mb-4 sm:mb-0">
              <img className="min-w-36 rounded object-cover h-24" src="/images/courses/image-1.jpg" alt="" />
            </div>
            <div className="part-2 flex-1">
              <div className="tags flex flex-wrap justify-between">
                <div className="firstTwoTags flex text-sm flex-wrap">
                  <p className="bg-blue-600 text-white px-2 p-1 mr-2 rounded">Framework</p>
                  <p className="bg-blue-600 text-white px-2 p-1 mr-2 rounded">Database</p>
                  <p className="bg-blue-600 text-white px-2 p-1 mr-2 rounded">Computer / IT</p>
                </div>
                <div className="lastTag text-sm">
                  <p className="bg-red-600 text-white px-2 p-1 mr-2 rounded">IT</p>
                </div>
              </div>
              <div className="Text">
                <h2 className="text-xl font-bold py-2">Mastering JavaScript</h2>
                <p>Unlock the power of JavaScript and build dynamic, interactive experiences with ease.</p>

                <ul className="stats list-inside font-bold flex flex-wrap py-2">
                  <li className="flex-nowrap mr-4 flex items-center">
                    <TbCoinRupeeFilled className="mr-1 text-blue-600" />20000.00</li>
                  <li className="flex-nowrap pr-2 mr-4 flex items-center"><LiaSignalSolid className="mr-1 text-blue-600" />Beginner</li>
                  <li className="flex-nowrap pr-2 mr-4 flex items-center"><IoIosTime className="mr-1 text-blue-600" />12 Weeks</li>
                  {/* <li className="flex-nowrap pr-2 mr-4 flex items-center"><TiStarFullOutline className="mr-1 text-blue-600" />4.5/5</li> */}
                  <li className="flex-nowrap pr-2 mr-4 flex items-center"><BiWorld className="mr-1 text-blue-600" />English, Hindi, Marathi</li>
                  {/* <li className="flex-nowrap pr-2 mr-4 flex items-center"><TbAlertSquareRoundedFilled className="mr-1 text-blue-600" />Last updated 23 hours ago</li> */}
                </ul>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="Text">
              <h2 className="text-lg font-bold py-2">Course Description</h2>
              <p className="pt-0 py-2">JavaScript plays a crucial role in front-end development by making web pages interactive and user-friendly. With JavaScript, developers can create dynamic UI elements and many more.</p>
              <ol className="list-decimal px-4">
                <li className="pb-4">JavaScript is one of the most essential programming languages for web development, enabling developers to create dynamic and interactive websites. This course will take you from the fundamentals of JavaScript, such as variables, data types, and functions, to advanced topics like asynchronous programming, APIs, and modern ES6+ features.</li>
                <li className="pb-4">You Will learn how to manipulate the DOM , handle events, and work with frameworks like React.js to build real-world applications. Through hands-on exercises and projects, you will gain the practical skills needed to write clean, efficient, and scalable JavaScript code.</li>
                <li className="pb-4">Learn JavaScript from scratch and advance to building dynamic web applications with hands-on projects, covering ES6+, DOM manipulation, APIs, and asynchronous programming to excel in modern web development.</li>
                <li className="pb-4">Popular front-end frameworks and libraries such as React.js, Vue.js, and Angular are built on JavaScript, enabling developers to create scalable and responsive web applications with ease.</li>
              </ol>
            </div>
          </div>

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
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}