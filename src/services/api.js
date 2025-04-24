import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paarshEduApi = createApi({
  reducerPath: "paarshEduApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      // Include the access token in headers if available
      const accessToken =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      // Get admin access token
      const adminAccessToken =
        localStorage.getItem("admin_access_token") ||
        sessionStorage.getItem("admin_access_token");

      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      // Set Admin token in headers separately
      if (adminAccessToken) {
        headers.set("Admin-Authorization", `Bearer ${adminAccessToken}`);
      }

      return headers;
    },
    credentials: "include",
  }),

  tagTypes: [
    "User",
    "Course",
    "Agent",
    "Category",
    "SubCategory",
    "CourseVideo",
    "Payment",
    "Contact",
    "MeetingLink",
  ],

  endpoints: (builder) => ({
    // ----------------------------------------------------User Apis---------------------------------------------
    login: builder.mutation({
      query: (credentials) => ({
        url: "user/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    //-------------------------------For SignUp API-----------------------
    signup: builder.mutation({
      query: (userData) => ({
        url: "user/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    // ----------------------------------------------------Course Apis------------------------------------

    addCourse: builder.mutation({
      query: (formData) => ({
        url: "/course",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Course"],
    }),

    updateCourse: builder.mutation({
      query: (formData, id) => ({
        url: "/course",
        method: "PUT",
        body: { formData, id },
      }),
      invalidatesTags: ["Course"],
    }),

    deleteCourse: builder.mutation({
      query: (id) => ({
        url: "/course",
        method: "DELETE",
        body: id,
      }),
      invalidatesTags: ["Course"],
    }),

    fetchCources: builder.query({
      query: () => "/course",
      providesTags: ["Course"],
    }),

    fetchCourcebyId: builder.query({
      query: (courseId) => `/course/courseid?id=${courseId}`,
      providesTags: ["Course"],
    }),

    // ----------------------------------------------------Admin Apis--------------------------------------
    adminlogin: builder.mutation({
      query: (credentials) => ({
        url: "/admin/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Course"],
    }),

    // ------------------------------------------------------------Agent Apis---------------------
    addAgent: builder.mutation({
      query: (formData) => ({
        url: "/agent",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Agent"],
    }),

    updateAgent: builder.mutation({
      query: (formData) => ({
        url: "/agent",
        method: "PUT",
        body: { formData },
      }),
      invalidatesTags: ["Agent"],
    }),

    deleteAgent: builder.mutation({
      query: (id) => ({
        url: "/agent",
        method: "DELETE",
        body: id,
      }),
      invalidatesTags: ["Agent"],
    }),

    fetchAgent: builder.query({
      query: () => "/agent",
      providesTags: ["Agent"],
    }),

    // ------------------------------------------------------------Users Apis-------------------------------------------------------------

    fetchUsers: builder.query({
      query: () => "/users",
      providesTags: ["User"],
    }),

    fetchUser: builder.query({
      query: () => "/user",
      providesTags: ["User"],
    }),

    updateUser: builder.mutation({
      query: (formData) => ({
        url: "/user",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({ url: "/user", method: "DELETE", body: id }),
      invalidatesTags: ["User"],
    }), 

    //--------------------------------------------------------------Categories Apis------------------------------------------------

    addCategory: builder.mutation({
      query: (formData) => ({
        url: "/course/category",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategories: builder.mutation({
      query: (formData, id) => ({
        url: "/course/category",
        method: "PUT",
        body: { formData, id },
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategories: builder.mutation({
      query: (id) => ({
        url: "/course/category",
        method: "DELETE",
        body: id,
      }),
      invalidatesTags: ["Category"],
    }),

    fetchCategories: builder.query({
      query: () => "/course/category",
      providesTags: ["Category"],
    }),

    //--------------------------------------------------------------SubCategories Apis------------------------------------------------

    addSubCategory: builder.mutation({
      query: (formData) => ({
        url: "/course/subcategory",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["SubCategory"],
    }),

    updateSubCategories: builder.mutation({
      query: (formData, id) => ({
        url: "/course/subcategory",
        method: "PUT",
        body: { formData, id },
      }),
      invalidatesTags: ["SubCategory"],
    }),

    deleteSubCategories: builder.mutation({
      query: (id) => ({
        url: "/course/subcategory",
        method: "DELETE",
        body: id,
      }),
      invalidatesTags: ["SubCategory"],
    }),

    fetchSubCategories: builder.query({
      query: () => "/course/subcategory",
      providesTags: ["SubCategory"],
    }),

    // ---------------------------------------------------------------------------

    addCourseVideo: builder.mutation({
      query: (formData) => ({
        url: "/course/videos",
        method: "POST",
        body: formData,
      }),
    }),

    fetchCourseVideo: builder.query({
       query: () => "/course/videos",
       providesTags: ["CourseVideo"],             
    }),

    fetchCourseVideoById: builder.query({
      query: (params) => `/course/videos?courseId=${params.courseId}`,
      providesTags: ['CourseVideo'],
    }),

    deleteCourseVideo: builder.mutation({
      query: (id) => ({ url: "/course/videos", method: "DELETE", body: id }),
      invalidatesTags: ["CourseVideo"],
    }),

    //----------------------------------Payment ------------------------------------------------------------------------------
    createOrder: builder.mutation({
      query: ({ userId, courseId, amount }) => ({
        url: "/createorder",
        method: "POST",
        body: { userId, courseId, amount },
      }),
    }),
    verifyPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/paymentverification",
        method: "POST",
        body: paymentData,
      }),
    }),

    // --------------------------------------------------------------------------------------------------------------

    fetchUserCourse: builder.query({
      query: () => "/user/courses",
      providesTags: ["Course", "User"],
    }),

    // --------------------------------------------------------------------------------------------------------------

    addContact: builder.mutation({
      query: (formData) => ({
        url: "/contactus",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Contact"],
    }),
    
    fetchContacts: builder.query({
      query: () => "/contactus",
      providesTags: ["Contact"],
    }),

    updateContactStatus: builder.mutation({
      query: (formData) => ({
        url: "/contactus",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Contact"],
    }), 

    deleteContact: builder.mutation({
      query: (id) => ({
        url: "/contactus",
        method: "DELETE",
        body: {id},
      }),
      invalidatesTags: ["Contact"],
    }),

    // ------------------------------------------------------------Meeting Links Apis------------------------------------------------

    addMeetingLink: builder.mutation({
      query: (formData) => ({
        url: "/meeting-links",
        method: "POST", 
        body: formData,
      }),
      invalidatesTags: ["MeetingLink"],
    }),

    updateMeetingLink: builder.mutation({
      query: (formData) => ({
        url: `/meeting-links/${formData.id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["MeetingLink"],
    }),

    deleteMeetingLink: builder.mutation({
      query: (id) => ({
        url: `/meeting-links/${id}`,
        method: "DELETE",
        body: {id}, 
      }),
      invalidatesTags: ["MeetingLink"],
    }),

    fetchMeetingLinks: builder.query({
      query: (params) => ({
        url: "/meeting-links",
        params: params,
      }),
      providesTags: ["MeetingLink"],
    }),

    fetchMeetingLinkById: builder.query({
      query: (id) => `/meeting-links/${id}`,
      providesTags: ["MeetingLink"],
    }),

    // Endpoint for generating real-time meeting links
    generateMeetingLink: builder.mutation({
      query: (meetingData) => ({
        url: "/meeting-links/generate",
        method: "POST",
        body: meetingData,
      }),
    }),

    // Endpoint for updating meeting status
    updateMeetingStatus: builder.mutation({
      query: (data) => ({
        url: `/meeting-links/${data.id}`,
        method: "PATCH",
        body: { status: data.status },
      }),
      invalidatesTags: ["MeetingLink"],
    }),


    // Endpoint for Creating Job Application
    CreateJobApplication: builder.mutation({
      query: (data) => ({
        url: `/JobApplication`,
        method: "POST",
        body: data,
      }),
    }),

    // Endpoint for Fetching Job Application
    fetchJobApplications: builder.query({
      query: () => "/JobApplication",
      providesTags: ["JobApplication"],
    }),
    
    // Endpoint for deleting Job Application by ID
    deleteJobApplication: builder.mutation({
      query: (id) => ({
        url: "/JobApplication",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["JobApplication"],
    }),

    // Endpoint for uploading resources
    uploadResource: builder.mutation({
      query: (formData) => ({
        url: "/uploads/resource",
        method: "POST",
        body: formData,
      }),
    }),

  }),
});

export const {
  useLoginMutation,
  useSignupMutation,

  useAddCourseMutation,
  useFetchCourcesQuery,
  useAdminloginMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useFetchCourcebyIdQuery,

  useAddAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  useFetchAgentQuery,

  useFetchUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useFetchUsersQuery,

  useAddCategoryMutation,
  useFetchCategoriesQuery,
  useUpdateCategoriesMutation,
  useDeleteCategoriesMutation,

  useAddSubCategoryMutation,
  useFetchSubCategoriesQuery,
  useUpdateSubCategoriesMutation,
  useDeleteSubCategoriesMutation,

  useAddCourseVideoMutation,
  useFetchCourseVideoQuery,
  useFetchCourseVideoByIdQuery,
  useDeleteCourseVideoMutation,

  useFetchUserCourseQuery,

  useCreateOrderMutation,
  useVerifyPaymentMutation,

  useFetchContactsQuery,
  useUpdateContactStatusMutation,
  useDeleteContactMutation,
  useAddContactMutation,

  useAddMeetingLinkMutation,
  useUpdateMeetingLinkMutation,
  useDeleteMeetingLinkMutation,
  useFetchMeetingLinksQuery,
  useFetchMeetingLinkByIdQuery,
  useGenerateMeetingLinkMutation,
  useUpdateMeetingStatusMutation,

  useCreateJobApplicationMutation,
  useFetchJobApplicationsQuery,
  useDeleteJobApplicationMutation,
  useUploadResourceMutation,
} = paarshEduApi;
