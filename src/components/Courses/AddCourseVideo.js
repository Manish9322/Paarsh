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
  updateResourceId,
} from "../../lib/slices/courseVideoSlice";
import {
  useAddCourseVideoMutation,
  useFetchCourseVideoByIdQuery,
  useUploadResourceMutation,
} from "@/services/api";
import { useState, useEffect } from "react";
import { useSelector as useReduxSelector } from "react-redux";
import { store } from "../../lib/store"; // Make sure this path is correct

const AddCourseModal = ({ isOpen, onClose, onAddCourse }) => {
  const dispatch = useDispatch();
  const selectedCourse = useSelector((state) => state.course);
  const courseData = useSelector((state) => state.courseVideo);
  const [createCourse, { isLoading }] = useAddCourseVideoMutation();
  const [uploadResource] = useUploadResourceMutation();

  console.log("courseData coming from slice ", courseData);

  const {
    data: fetchResponse,
    isLoading: isLoadingCourseVideos,
    refetch,
  } = useFetchCourseVideoByIdQuery(
    {
      courseId: selectedCourse._id,
    },
    {
      skip: !selectedCourse._id || !isOpen,
    },
  );

  // Extract course videos data from the fetched data - properly handle the nested structure
  const courseVideos = fetchResponse?.data;

  console.log("Fetched course videos data:", fetchResponse);

  const [videoUploads, setVideoUploads] = useState({});
  const [videoPreview, setVideoPreview] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);

  const [resourceUploads, setResourceUploads] = useState({});

  // Reset and initialize data when modal opens or course data changes
  useEffect(() => {
    if (!isOpen) {
      setVideoUploads({});
      setDataInitialized(false);
      return;
    }

    // Step 1: Reset state
    dispatch(setCourseField({ field: "topics", value: [] }));
    setDataInitialized(false);

    // Step 2: Load data if available
    const loadData = async () => {
      // If we have course videos data
      if (
        courseVideos &&
        courseVideos.topics &&
        Array.isArray(courseVideos.topics)
      ) {
        console.log("Found topics to load:", courseVideos.topics.length);

        // Store topic IDs for later reference
        const topicIds = [];

        // Step 3: Add all topics first
        for (let i = 0; i < courseVideos.topics.length; i++) {
          dispatch(addTopic());
          // After each dispatch, wait a bit and collect the topic ID
          await new Promise((resolve) => setTimeout(resolve, 50));
          const currentState = store.getState().courseVideo;
          if (currentState.topics[i]) {
            topicIds.push(currentState.topics[i]._id);
          }
        }

        console.log("Created topics with IDs:", topicIds);

        // Step 4: Wait for all topics to be added
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Step 5: Update each topic with data
        for (let i = 0; i < courseVideos.topics.length; i++) {
          const topic = courseVideos.topics[i];
          const currentState = store.getState().courseVideo;
          const topicIndex = i;

          if (topicIndex < currentState.topics.length) {
            const topicId = currentState.topics[topicIndex]._id;

            // Update topic name
            dispatch(
              updateTopicName({
                topicId: topicId,
                value: topic.topicName,
              }),
            );

            console.log(`Updated topic ${i} name to: ${topic.topicName}`);

            // Remove default empty video if exists
            if (
              currentState.topics[topicIndex].videos &&
              currentState.topics[topicIndex].videos.length > 0
            ) {
              dispatch(
                removeVideoFromTopic({
                  topicId: topicId,
                  videoId: currentState.topics[topicIndex].videos[0]._id,
                }),
              );

              // Wait for video removal
              await new Promise((resolve) => setTimeout(resolve, 50));
            }

            // Add videos for this topic
            if (topic.videos && Array.isArray(topic.videos)) {
              for (let j = 0; j < topic.videos.length; j++) {
                const video = topic.videos[j];

                // Add new video
                dispatch(addVideoToTopic({ topicId: topicId }));

                // Wait for video to be added
                await new Promise((resolve) => setTimeout(resolve, 50));

                // Get updated state after adding video
                const updatedState = store.getState().courseVideo;
                const updatedTopic = updatedState.topics.find(
                  (t) => t._id === topicId,
                );

                if (
                  updatedTopic &&
                  updatedTopic.videos &&
                  updatedTopic.videos.length > 0
                ) {
                  const videoId =
                    updatedTopic.videos[updatedTopic.videos.length - 1]._id;

                  // Update video properties
                  dispatch(
                    updateVideoName({
                      topicId: topicId,
                      videoId: videoId,
                      value: video.videoName,
                    }),
                  );

                  dispatch(
                    updateVideoId({
                      topicId: topicId,
                      videoId: videoId,
                      value: video.videoId,
                    }),
                  );

                  dispatch(
                    updateResourceId({
                      topicId: topicId,
                      videoId: videoId,
                      value: video.resourceId,
                    }),
                  );

                  console.log(
                    `Added video ${j} with name ${video.videoName} to topic ${i}`,
                  );
                }
              }
            }
          }
        }
      } else {
        // If no existing data, create one empty topic
        console.log("No course data found, adding default topic");
        dispatch(addTopic());
      }

      // Mark data as initialized
      setTimeout(() => {
        setDataInitialized(true);
        console.log("Data initialization complete");
      }, 300);
    };

    // Execute the data loading function
    loadData();
  }, [isOpen, courseVideos, dispatch]);

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
  // Replace base64 conversion with chunked uploads
  // Updated handleFileUpload function
  const handleFileUpload = async (e, topicId, videoId) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Check if file is a video
      if (!file.type.startsWith("video/")) {
        toast.error("Please upload a video file");
        return;
      }

      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File size should be less than 100MB");
        return;
      }

      // Show loading toast
      const toastId = toast.loading("Uploading video...");

      // Create a video preview for the UI
      const previewUrl = URL.createObjectURL(file);

      // Upload using fetch with blob/stream body
      const uploadResponse = await fetch("/api/uploads/video", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: file, // Send the file directly
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.message || "Failed to upload video");
      }

      // Store the file URL
      setVideoUploads((prev) => ({
        ...prev,
        [`${topicId}-${videoId}`]: {
          name: file.name,
          preview: previewUrl,
          url: uploadResult.fileUrl,
        },
      }));

      // Update Redux store with URL
      dispatch(
        updateVideoId({
          topicId,
          videoId,
          value: uploadResult.fileUrl,
        }),
      );

      toast.dismiss(toastId);
      toast.success("Video uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.dismiss();
      toast.error(
        "Failed to upload video: " + (error.message || "Unknown error"),
      );
    }
  };

  // Handle resource file uploads
  const handleResourceUpload = async (e, topicId, videoId) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      // Check file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Resource file size should be less than 50MB");
        return;
      }

      // Show loading toast
      const toastId = toast.loading("Uploading resource...");

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      // Upload using the existing API endpoint
      const result = await uploadResource(formData).unwrap();

      if (!result.success) {
        throw new Error(result.message || "Failed to upload resource");
      }

      // Store the resource info
      setResourceUploads((prev) => ({
        ...prev,
        [`${topicId}-${videoId}`]: {
          name: file.name,
          url: result.fileUrl,
        },
      }));

      // Update Redux store with resource URL
      dispatch(
        updateResourceId({
          topicId,
          videoId,
          value: result.fileUrl,
        }),
      );

      toast.dismiss(toastId);
      toast.success("Resource uploaded successfully");
    } catch (error) {
      console.error("Error uploading resource:", error);
      toast.error(
        "Failed to upload resource: " + (error.message || "Unknown error"),
      );
    }
  };

  const handleSubmit = async () => {
    if (!courseData || !courseData.topics) {
      toast.error("No course data to save");
      return;
    }

    // Format the data for the API - now we're sending URLs, not base64 data
    const formattedData = {
      courseId: selectedCourse._id,
      courseName: selectedCourse.courseName,
      topics: courseData.topics
        .map((topic) => ({
          topicName: topic.topicName || topic.name || "",
          videos: (topic.videos || [])
            .map((video) => ({
              videoName: video.videoName || video.name || "",
              videoId: video.videoId || video.id || "", // This is now a URL
              resourceId: video.resourceId || "", // Add this line
              _id: video._id, // Include if you need to maintain video IDs
            }))
            .filter((video) => video.videoName && video.videoId),
          _id: topic._id, // Include if you need to maintain topic IDs
        }))
        .filter(
          (topic) => topic.topicName && topic.videos && topic.videos.length > 0,
        ),
    };

    // Check if data is valid
    if (formattedData.topics.length === 0) {
      toast.error("Please add at least one topic with videos");
      return;
    }

    try {
      const response = await createCourse(formattedData).unwrap();
      if (response.success) {
        toast.success("Course videos saved successfully!");
        if (onAddCourse) onAddCourse(response.data);
        refetch(); // Refresh data
        onClose();
      } else {
        toast.error(response.message || "Failed to save course videos");
      }
    } catch (error) {
      console.error("Error adding course videos:", error);
      toast.error("Failed to add course videos. Please try again.");
    }
  };

  // Function to open the video preview modal
  const openVideoPreview = (videoData) => {
    // videoData will be either a local preview URL or a remote URL
    setVideoPreview(videoData);
    setPreviewOpen(true);
  };
  // Function to close the video preview modal
  const closeVideoPreview = () => {
    setPreviewOpen(false);
    setVideoPreview(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[80vh] overflow-y-auto p-6">
          <DialogTitle className="text-2xl font-semibold">
            {courseVideos && courseVideos.topics
              ? "Update Course Videos"
              : "Add Course Videos"}
          </DialogTitle>

          {isLoadingCourseVideos || !dataInitialized ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Course Name Display */}
              <div className="mb-4 rounded-md bg-gray-100 p-2 dark:bg-gray-800">
                <p className="font-semibold">
                  Course: {selectedCourse.courseName}
                </p>
              </div>

              {/* Topics & Videos */}
              <div className="">
                <h3 className="text-lg font-semibold">Topics & Videos</h3>

                {courseData.topics &&
                  courseData.topics.map((topic) => (
                    <div
                      key={topic._id}
                      className="mb-3 mt-2 rounded-md border p-3"
                    >
                      <Input
                        type="text"
                        placeholder="Topic Name"
                        value={topic.topicName || ""}
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
                      {topic.videos &&
                        topic.videos.map((video) => {
                          const videoKey = `${topic._id}-${video._id}`;
                          const videoData = videoUploads[videoKey];
                          const resourceData = resourceUploads[videoKey];
                          const hasExistingVideo =
                            video.videoId &&
                            !video.videoId.startsWith("data:video/") &&
                            !videoData;
                          const hasExistingResource =
                            video.resourceId && !resourceData;

                          return (
                            <div
                              key={video._id}
                              className="mb-2 flex flex-col gap-2 border-t pt-2"
                            >
                              <Input
                                type="text"
                                placeholder="Video Name"
                                value={video.videoName || ""}
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
                                  <h2 className="font-semibold">Video</h2>
                              {/* Video Upload Section */}
                              <div className="flex items-center gap-2">
                          
                                <div className="flex-1">
                                  <Input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) =>
                                      handleFileUpload(e, topic._id, video._id)
                                    }
                                    className="cursor-pointer"
                                  />
                                </div>

                                {(videoData || hasExistingVideo) && (
                                  <Button
                                    type="button"
                                    onClick={() =>
                                      openVideoPreview(
                                        videoData
                                          ? videoData.preview
                                          : video.videoId,
                                      )
                                    }
                                    className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:text-white"
                                  >
                                    Preview
                                  </Button>
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

                              {/* Resource Upload Section */}
                              <h2 className="font-semibold">Resource</h2>
                              <div className="mt-2 flex items-center gap-2">
                           
                                <div className="flex-1">
                                  <Input
                                    type="file"
                                    onChange={(e) =>
                                      handleResourceUpload(
                                        e,
                                        topic._id,
                                        video._id,
                                      )
                                    }
                                    className="cursor-pointer"
                                  />
                                </div>

                                {resourceData && (
                                  <div className="text-sm text-green-600">
                                    Resource: {resourceData.name}
                                  </div>
                                )}

                                {hasExistingResource && (
                                  <div className="text-sm text-blue-600">
                                    Existing resource file (upload new to
                                    replace)
                                  </div>
                                )}
                              </div>

                              {videoData && (
                                <div className="text-sm text-green-600">
                                  New file: {videoData.name}
                                </div>
                              )}

                              {hasExistingVideo && !videoData && (
                                <div className="text-sm text-blue-600">
                                  Existing video (upload a new one to replace)
                                </div>
                              )}
                            </div>
                          );
                        })}
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
                  {isLoading
                    ? "Saving..."
                    : courseVideos && courseVideos.topics
                    ? "Update Course"
                    : "Save Course"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={closeVideoPreview}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="mb-4 text-xl font-semibold">
            Video Preview
          </DialogTitle>

          <div className="w-full">
            {videoPreview && (
              <video
                src={videoPreview}
                controls
                className="w-full rounded-md"
                style={{ maxHeight: "60vh" }}
              />
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={closeVideoPreview}
              className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-black"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCourseModal;
