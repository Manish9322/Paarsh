import { createSlice } from "@reduxjs/toolkit";
import { ObjectId } from "bson";

const initialState = {
  courseName: "",
  topics: [],
};

const courseVideoSlice = createSlice({
  name: "courseVideo",
  initialState,
  reducers: {
    setCourseField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    addTopic: (state) => {
      state.topics.push({
        _id: new ObjectId().toString(),
        topicName: "",
        videos: [
          { _id: new ObjectId().toString(), videoName: "", videoId: "" },
        ],
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
        topic.videos.push({
          _id: new ObjectId().toString(),
          videoName: "",
          videoId: "",
        });
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
    updateVideoId: (state, action) => {
      const { topicId, videoId, value } = action.payload;
      const topic = state.topics.find((t) => t._id === topicId);
      if (topic) {
        const video = topic.videos.find((v) => v._id === videoId);
        if (video) video.videoId = value;
      }
    },
    updateResourceId: (state, action) => {
      const { topicId, videoId, value } = action.payload;
      const topic = state.topics.find((t) => t._id === topicId);
      if (topic) {
        const video = topic.videos.find((v) => v._id === videoId);
        if (video) video.resourceId = value;
      }
    },
    removeVideoFromTopic: (state, action) => {
      const { topicId, videoId } = action.payload;
      const topic = state.topics.find((t) => t._id === topicId);
      if (topic) {
        topic.videos = topic.videos.filter((v) => v._id !== videoId);
      }
    },
    removeTopic: (state, action) => {
      const topicId = action.payload;
      state.topics = state.topics.filter((topic) => topic._id !== topicId);
    },
  },
});

export const {
  setCourseField,
  addTopic,
  updateTopicName,
  addVideoToTopic,
  updateVideoName,
  updateVideoId,
  updateResourceId,
  removeVideoFromTopic,
  removeTopic,
} = courseVideoSlice.actions;

export default courseVideoSlice.reducer;