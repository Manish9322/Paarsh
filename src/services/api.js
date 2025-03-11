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
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    },
    credentials: "include",
  }),

  tagTypes: [
    "Course",
    "Agent",
    "Category",
    "SubCategory",
    "CourseVideo",
    "Payment",
  ],

  endpoints: (builder) => ({
    // ----------------------------------------------------User Apis---------------------------------------------
    login: builder.mutation({
      query: (credentials) => ({
        url: "user/login",
        method: "POST",
        body: credentials,
      }),
    }),

    //-------------------------------For SignUp API-----------------------
    signup: builder.mutation({
      query: (userData) => ({
        url: "user/register",
        method: "POST",
        body: userData,
      }),
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
    }),

    fetchUser: builder.query({
      query: () => "/user",
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
      query: () => "/user/course",
      providesTags: [""],
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

  useFetchUserCourseQuery,

  useCreateOrderMutation,
  useVerifyPaymentMutation,
} = paarshEduApi;
