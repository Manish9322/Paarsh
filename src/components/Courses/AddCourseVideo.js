"use client";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  setCourseField,
  addTopic,
  updateTopicName,
  removeTopic,
  addVideoToTopic,
  updateVideoName,
  updateVideoId,
  removeVideoFromTopic,
} from "../../lib/slices/courseVideoSlice";
import { useAddCourseVideoMutation } from "@/services/api";
import { useState } from "react";

const AddCourseModal = ({ isOpen, onClose, onAddCourse, selectedCourse }) => {
  const dispatch = useDispatch();
  const courseData = useSelector((state) => state.coursevideo);
  const [createCourse, { isLoading }] = useAddCourseVideoMutation();
  const [videoUploads, setVideoUploads] = useState({});

  // Function to convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // Handle file upload and conversion to base64
  const handleFileUpload = async (e, topicId, videoId) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      
      // Check if file is a video
      if (!file.type.startsWith('video/')) {
        toast.error("Please upload a video file");
        return;
      }
      
      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File size should be less than 100MB");
        return;
      }

      // Show loading toast
      toast.loading("Converting video...");
      
      // Convert to base64
      const base64 = await convertToBase64(file);
      
      // Update state with file name for display
      setVideoUploads({
        ...videoUploads,
        [`${topicId}-${videoId}`]: file.name
      });
      
      // Update Redux store with base64 data
      dispatch(
        updateVideoId({
          topicId,
          videoId,
          value: base64,
        })
      );
      
      toast.dismiss();
      toast.success("Video uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.dismiss();
      toast.error("Failed to upload video");
    }
  };

  const handleSubmit = async () => {
    const formmatedData = {
      ...courseData,
      courseName: selectedCourse.courseName,
      courseId: selectedCourse._id,
    };

    try {
      const response = await createCourse(formmatedData).unwrap();
      if (response.success) {
        toast.success("Course added successfully!");
        onAddCourse(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Failed to add course. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto p-6">
        <DialogTitle className="text-2xl font-semibold">
          Add New Course
        </DialogTitle>
     
        {/* <Input
          type="text"
          name="category" // Keep this input if you want to retain category
          placeholder="Category"
          className="mb-3"
          value={courseData.category}
          onChange={handleChange}
        /> */}

        {/* Topics & Videos */}
        <div className="">
          <h3 className="text-lg font-semibold">Topics & Videos</h3>

          {(courseData?.topics ?? []).map((topic) => (
            <div key={topic._id} className="mb-3 mt-2 p-3">
              <Input
                type="text"
                placeholder="Topic Name"
                value={topic.topicName}
                onChange={(e) =>
                  dispatch(
                    updateTopicName({
                      topicId: topic._id,
                      value: e.target.value,
                    }),
                  )
                }
                className="mb-2"
              />

              {/* Videos inside the topic */}
              {(topic?.videos ?? []).map((video) => (
                <div key={video._id} className="mb-2 flex flex-col gap-2">
                  <Input
                    type="text"
                    placeholder="Video Name"
                    value={video.videoName}
                    onChange={(e) =>
                      dispatch(
                        updateVideoName({
                          topicId: topic._id,
                          videoId: video._id,
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, topic._id, video._id)}
                      className="cursor-pointer"
                    />
                    {videoUploads[`${topic._id}-${video._id}`] && (
                      <div className="text-sm text-green-600">
                        {videoUploads[`${topic._id}-${video._id}`]}
                      </div>
                    )}
                    <Button
                      onClick={() =>
                        dispatch(
                          removeVideoFromTopic({
                            topicId: topic._id,
                            videoId: video._id,
                          }),
                        )
                      }
                      className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-black"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                onClick={() =>
                  dispatch(addVideoToTopic({ topicId: topic._id }))
                }
                className="mt-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-black"
              >
                + Add Video
              </Button>

              <Button
                onClick={() => dispatch(removeTopic(topic._id))}
                className="ml-2 mt-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-black"
              >
                Remove Topic
              </Button>
            </div>
          ))}

          <Button
            onClick={() => dispatch(addTopic())}
            className="mt-4 bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-black"
          >
            + Add Topic
          </Button>
        </div>

        {/* Submit & Cancel */}
        <div className="mt-5 flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-black"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-black"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Course"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseModal;
