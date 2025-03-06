import { createSlice } from "@reduxjs/toolkit";
import { ObjectId } from "bson"; // Use this to generate MongoDB IDs on the frontend

const initialState = {
  courseName: "",
  category: "",
  price: "",
  feature: "",
  topics: [], // Each topic contains multiple videos
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setCourseField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    addTopic: (state) => {
      state.topics.push({
        _id: new ObjectId().toString(), // Use MongoDB ObjectId for topics
        topicName: "",
        videos: [{ _id: new ObjectId().toString(), videoName: "" }],
      });
    },
    updateTopicName: (state, action) => {
      const { topicId, value } = action.payload;
      const topic = state.topics.find((t) => t._id === topicId);
      if (topic) topic.topicName = value;
    },
    addVideoToTopic: (state, action) => {
      const { topicId } = action.payload;
      const topic = state.topics.find((t) => t._id === topicId);
      if (topic) {
        topic.videos.push({ _id: new ObjectId().toString(), videoName: "" });
      }
    },
    updateVideoName: (state, action) => {
      const { topicId, videoId, value } = action.payload;
      const topic = state.topics.find((t) => t._id === topicId);
      if (topic) {
        const video = topic.videos.find((v) => v._id === videoId);
        if (video) video.videoName = value;
      }
    },
    removeVideoFromTopic: (state, action) => {
      const { topicId, videoId } = action.payload;
      const topic = state.topics.find((t) => t._id === topicId);
      if (topic) {
        topic.videos = topic.videos.filter((v) => v._id !== videoId);
      }
    },
  },
});

export const {
  setCourseField,
  addTopic,
  updateTopicName,
  addVideoToTopic,
  updateVideoName,
  removeVideoFromTopic,
} = courseSlice.actions;

export default courseSlice.reducer;
