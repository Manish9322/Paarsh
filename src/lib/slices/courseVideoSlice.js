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
    setCourseField: (state, action) => ({
      ...state,
      [action.payload.field]: action.payload.value,
    }),
    addTopic: (state) => ({
      ...state,
      topics: [
        ...state.topics,
        {
          _id: new ObjectId().toString(),
          topicName: "",
          videos: [],
        },
      ],
    }),
    updateTopicName: (state, action) => {
      const { topicId, value } = action.payload;
      return {
        ...state,
        topics: state.topics.map((topic) =>
          topic._id === topicId ? { ...topic, topicName: value } : topic
        ),
      };
    },
    addVideoToTopic: (state, action) => {
      const { topicId } = action.payload;
      return {
        ...state,
        topics: state.topics.map((topic) =>
          topic._id === topicId
            ? {
                ...topic,
                videos: [
                  ...topic.videos,
                  {
                    _id: new ObjectId().toString(),
                    videoName: "",
                    videoId: "",
                    resourceId: "",
                    notesId: "",
                  },
                ],
              }
            : topic
        ),
      };
    },
    updateVideoName: (state, action) => {
      const { topicId, videoId, value } = action.payload;
      return {
        ...state,
        topics: state.topics.map((topic) =>
          topic._id === topicId
            ? {
                ...topic,
                videos: topic.videos.map((video) =>
                  video._id === videoId ? { ...video, videoName: value } : video
                ),
              }
            : topic
        ),
      };
    },
    updateVideoId: (state, action) => {
      const { topicId, videoId, value } = action.payload;
      return {
        ...state,
        topics: state.topics.map((topic) =>
          topic._id === topicId
            ? {
                ...topic,
                videos: topic.videos.map((video) =>
                  video._id === videoId ? { ...video, videoId: value } : video
                ),
              }
            : topic
        ),
      };
    },
    updateResourceId: (state, action) => {
      const { topicId, videoId, value } = action.payload;
      return {
        ...state,
        topics: state.topics.map((topic) =>
          topic._id === topicId
            ? {
                ...topic,
                videos: topic.videos.map((video) =>
                  video._id === videoId ? { ...video, resourceId: value } : video
                ),
              }
            : topic
        ),
      };
    },
    updateNotesId: (state, action) => {
      const { topicId, videoId, value } = action.payload;
      return {
        ...state,
        topics: state.topics.map((topic) =>
          topic._id === topicId
            ? {
                ...topic,
                videos: topic.videos.map((video) =>
                  video._id === videoId ? { ...video, notesId: value } : video
                ),
              }
            : topic
        ),
      };
    },
    removeVideoFromTopic: (state, action) => {
      const { topicId, videoId } = action.payload;
      return {
        ...state,
        topics: state.topics.map((topic) =>
          topic._id === topicId
            ? {
                ...topic,
                videos: topic.videos.filter((video) => video._id !== videoId),
              }
            : topic
        ),
      };
    },
    removeTopic: (state, action) => ({
      ...state,
      topics: state.topics.filter((topic) => topic._id !== action.payload),
    }),
    resetState: () => initialState,
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
  updateNotesId,
  removeVideoFromTopic,
  removeTopic,
  resetState,
} = courseVideoSlice.actions;

export default courseVideoSlice.reducer;