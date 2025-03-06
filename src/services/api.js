import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paarshEduApi = createApi({
  reducerPath: "paarshEduApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "include" }),

  tagTypes: ["Course", "Agent"],

  endpoints: (builder) => ({
    // ----------------------------------------------------User Apis-------------------------------------------------------------

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

    // ----------------------------------------------------Course Apis-------------------------------------------------------------

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

    // ----------------------------------------------------Admin Apis-------------------------------------------------------------

    adminlogin: builder.mutation({
      query: (credentials) => ({
        url: "/admin/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Course"],
    }),

    // ------------------------------------------------------------Agent Apis-------------------------------------------------------------

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
        url: "/course/video",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["SubCategory"],
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

  useAddAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  useFetchAgentQuery,

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
} = paarshEduApi;
