"use client";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  setCourseData,
  addTopic,
  updateTopicName,
  removeTopic,
  addVideoToTopic,
  updateVideoName,
  updateVideoId,
  removeVideoFromTopic,
} from "../../lib/slices/courseSlice";
import { useAddCourseVideoMutation } from "@/services/api";


const AddCourseModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const courseData = useSelector((state) => state.course);
  const [createCourse, { isLoading }] = useAddCourseVideoMutation();

  // Handle input change for course details
  const handleChange = (e) => {
    dispatch(setCourseData({ ...courseData, [e.target.name]: e.target.value }));
  };

  // Submit form data
  const handleSubmit = async () => {
    if (!courseData.courseName || !courseData.category || !courseData.price) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      const response = await createCourse(courseData).unwrap();
      if (response.success) {
        toast.success("Course added successfully!");
        onClose();
      }
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Failed to add course. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-6">
        <DialogTitle className="text-2xl font-semibold">Add New Course</DialogTitle>

        {/* Course Details */}
        <Input
          type="text"
          name="courseName"
          placeholder="Course Name"
          className="mb-3"
          value={courseData.courseName}
          onChange={handleChange}
        />
        <Input
          type="text"
          name="category"
          placeholder="Category"
          className="mb-3"
          value={courseData.category}
          onChange={handleChange}
        />
        <Input
          type="text"
          name="price"
          placeholder="Price"
          className="mb-3"
          value={courseData.price}
          onChange={handleChange}
        />
        <Input
          type="text"
          name="feature"
          placeholder="Feature"
          className="mb-3"
          value={courseData.feature}
          onChange={handleChange}
        />

        {/* Topics & Videos */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Topics & Videos</h3>
          
          {(courseData?.topics ?? []).map((topic) => (
            <div key={topic._id} className="border p-3 mb-3">
              <Input
                type="text"
                placeholder="Topic Name"
                value={topic.topicName}
                onChange={(e) => dispatch(updateTopicName({ topicId: topic._id, value: e.target.value }))}
                className="mb-2"
              />
              
              {/* Videos inside the topic */}
              {(topic?.videos ?? []).map((video) => (
                <div key={video._id} className="mb-2 flex gap-2">
                  <Input
                    type="text"
                    placeholder="Video Name"
                    value={video.videoName}
                    onChange={(e) => dispatch(updateVideoName({ topicId: topic._id, videoId: video._id, value: e.target.value }))}
                  />
                  <Input
                    type="text"
                    placeholder="Video ID"
                    value={video.videoId}
                    onChange={(e) => dispatch(updateVideoId({ topicId: topic._id, videoId: video._id, value: e.target.value }))}
                  />
                  <Button
                    onClick={() => dispatch(removeVideoFromTopic({ topicId: topic._id, videoId: video._id }))}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    X
                  </Button>
                </div>
              ))}

              <Button onClick={() => dispatch(addVideoToTopic(topic._id))} className="mt-2 bg-blue-500 text-white hover:bg-blue-600">
                + Add Video
              </Button>
              <Button onClick={() => dispatch(removeTopic(topic._id))} className="mt-2 ml-2 bg-red-500 text-white hover:bg-red-600">
                Remove Topic
              </Button>
            </div>
          ))}

          <Button onClick={() => dispatch(addTopic())} className="mt-4 bg-green-500 text-white hover:bg-green-600">
            + Add Topic
          </Button>
        </div>

        {/* Submit & Cancel */}
        <div className="mt-5 flex justify-end gap-3">
          <Button onClick={onClose} className="bg-gray-500 text-white hover:bg-gray-600">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-green-500 text-white hover:bg-green-600" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Course"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseModal;
