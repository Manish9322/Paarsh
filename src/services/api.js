import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paarshEduApi = createApi({
  reducerPath: "paarshEduApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api",   credentials: "include", }),

  tagTypes: ["Course"],

  endpoints: (builder) => ({
    addCourse: builder.mutation({
      query: (formData) => ({
        url: "/course",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Course"],
    }),

    updateCourse: builder.mutation({
      query: (formData,id) => ({
        url: "/course",
        method: "PUT",
        body:{formData,id},
      }),
      invalidatesTags: ["Course"],
    }),

    deleteCourse: builder.mutation({
      query: (id) => ({
        url: "/course",
        method: "DELETE",
        body: id ,
      }),
      invalidatesTags: ["Course"],
    }),


    fetchCources: builder.query({
      query: () => "/course",
      providesTags: ["Course"],
    }),

    adminlogin: builder.mutation({
      query: (credentials) => ({
        url: "/admin/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Course"],
    }),
  }),
});

export const {
  useAddCourseMutation,
  useFetchCourcesQuery,
  useAdminloginMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} = paarshEduApi;
