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

const AddCourseModal = ({ isOpen, onClose, onAddCourse }) => {
  const dispatch = useDispatch();
  const courseData = useSelector((state) => state.coursevideo);
  const [createCourse, { isLoading }] = useAddCourseVideoMutation();

  const handleChange = (e) => {
    dispatch(setCourseField({ field: e.target.name, value: e.target.value }));
  };

  
  const handleSubmit = async () => {
    if (!courseData.courseName) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      const response = await createCourse(courseData).unwrap();
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

        {/* Course Details */}
        <Input
          type="text"
          name="courseName"
          placeholder="Course Name"
          className="mb-3"
          value={courseData.courseName}
          onChange={handleChange}
        />
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
                <div key={video._id} className="mb-2 flex gap-2">
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
                  <Input
                    type="text"
                    placeholder="Video ID"
                    value={video.videoId}
                    onChange={(e) =>
                      dispatch(
                        updateVideoId({
                          topicId: topic._id,
                          videoId: video._id,
                          value: e.target.value,
                        }),
                      )
                    }
                  />
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