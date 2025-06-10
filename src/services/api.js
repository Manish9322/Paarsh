import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  setTokenRefreshing,
  updateTokens,
  logout,
} from "../lib/slices/userAuthSlice";
import { updateAdminTokens, logoutAdmin } from "../lib/slices/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  prepareHeaders: (headers, { getState }) => {
    const accessToken = localStorage.getItem("accessToken");
    const adminAccessToken = localStorage.getItem("admin_access_token");

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    if (adminAccessToken) {
      headers.set("Admin-Authorization", `Bearer ${adminAccessToken}`);
    }

    return headers;
  },
  credentials: "include",
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  const { userAuth, auth } = api.getState();
  const { refreshToken, tokenRefreshing } = userAuth;
  const { adminRefreshToken, isAdminAuthenticated } = auth;

  if (result.error?.status === 401) {
    const isAdminRequest =
      (typeof args.url === "string" && args.url.startsWith("/admin")) ||
      result.error?.data?.error?.includes("admin");

    const refreshTokenToUse = isAdminRequest ? adminRefreshToken : refreshToken;
    const refreshEndpoint = isAdminRequest
      ? "/admin/refreshtoken"
      : "/user/refreshtoken";
    const updateTokensAction = isAdminRequest
      ? updateAdminTokens
      : updateTokens;
    const logoutAction = isAdminRequest ? logoutAdmin : logout;

    // if (!refreshTokenToUse) {
    //   api.dispatch(logoutAction());
    //   if (typeof window !== "undefined") {
    //     window.location.href = "/signin";
    //   }
    //   return result;
    // }

    if (tokenRefreshing) {
      return new Promise((resolve) => {
        const checkRefresh = setInterval(async () => {
          if (!api.getState().userAuth.tokenRefreshing) {
            clearInterval(checkRefresh);
            resolve(await baseQuery(args, api, extraOptions));
          }
        }, 100);
      });
    }

    api.dispatch(setTokenRefreshing(true));
    try {
      const refreshResult = await baseQuery(
        {
          url: refreshEndpoint,
          method: "POST",
          body: { refreshToken: refreshTokenToUse },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data?.success) {
        const { accessToken, refreshToken: newRefreshToken } =
          refreshResult.data.data;
        api.dispatch(
          updateTokensAction({ accessToken, refreshToken: newRefreshToken }),
        );
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logoutAction());
        // if (typeof window !== "undefined") {
        //   window.location.href = "/signin";
        // }
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      api.dispatch(logoutAction());
      // if (typeof window !== "undefined") {
      //   window.location.href = "/signin";
      // }
    } finally {
      api.dispatch(setTokenRefreshing(false));
    }
  }

  return result;
};

export const paarshEduApi = createApi({
  reducerPath: "paarshEduApi",
  baseQuery: baseQueryWithReauth,
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
    "Progress",
    "Offer",
    "Transaction",
    "PracticeTest",
    "Withdrawal",
    "Visitor",
    "Admin",
    "ReferralSettings",

    "UserPracticeAttempt",
  ],

  endpoints: (builder) => ({
    // Video Progress Endpoints
    updateVideoProgress: builder.mutation({
      query: ({ videoId, courseId, progress, completed }) => ({
        url: "/video-progress",
        method: "POST",
        body: { videoId, courseId, progress, completed },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Progress", id: courseId },
      ],
    }),

    getVideoProgress: builder.query({
      query: (courseId) => `/video-progress?courseId=${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: "Progress", id: courseId },
      ],
      transformResponse: (response) => {
        // Transform the response to match the expected format
        return {
          success: true,
          data: response.data || {},
        };
      },
    }),

    // ----------------------------------------------------User Apis------------------------------------------------------------

    validateToken: builder.query({
      query: () => "/auth/validate",
      providesTags: ["User"],
    }),

    getUserProfile: builder.query({
      query: () => "/user/profile",
      providesTags: ["User"],
    }),

    login: builder.mutation({
      query: ({ email, password, forceLogin }) => ({
        url: "/user/login",
        method: "POST",
        body: { email, password, forceLogin },
      }),
      invalidatesTags: ["User"],
    }),

    signup: builder.mutation({
      query: (userData) => ({
        url: "/user/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "user/forgot-password",
        method: "POST",
        body: email,
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ email, password, otp }) => ({
        url: "user/forgot-password",
        method: "PUT",
        body: { email, password, otp },
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/user/logout",
        method: "POST",
      }),
    }),

    fetchUserRefferals: builder.query({
      query: () => "/user/user-refferals",
      providesTags: ["User"],
    }),

    fetchUserOngoingCourses: builder.query({
      query: () => "/user/ongoing-courses",
      providesTags: ["User"],
    }),

    // ----------------------------------------------------Course Apis------------------------------------------------------------

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

    // ----------------------------------------------------Admin Apis-----------------------------------------------------------------------

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
        url: "/admin/agents",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Agent"],
    }),

    updateAgent: builder.mutation({
      query: (formData) => ({
        url: "/admin/agents",
        method: "PUT",
        body: { formData },
      }),
      invalidatesTags: ["Agent"],
    }),

    deleteAgent: builder.mutation({
      query: (id) => ({
        url: "/admin/agents",
        method: "DELETE",
        body: id,
      }),
      invalidatesTags: ["Agent"],
    }),

    resetAgentPassword: builder.mutation({
      query: (formData) => ({
        url: "/agent/reset-password",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Agent"],
    }),

    fetchAgents: builder.query({
      query: () => "/admin/agents",
      providesTags: ["Agent"],
    }),

    fetchAgent: builder.query({
      query: () => "/agent",
      providesTags: ["Agent"],
    }),

    // New API endpoint for updating agent targets
    updateAgentTarget: builder.mutation({
      query: ({ id, targetType, targetValue }) => ({
        url: "/admin/agents",
        method: "PATCH",
        body: { id, targetType, targetValue },
      }),
      invalidatesTags: ["Agent"],
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

    fetchUserById: builder.query({
      query: (id) => `/user/${id}`,
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
      query: ({ email, password }) => ({
        url: "/user",
        method: "DELETE",
        body: { email, password },
      }),
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

    //--------------------------------------------------------------CourseVideos Apis------------------------------------------------

    addCourseVideo: builder.mutation({
      query: (formData) => ({
        url: "/course/videos",
        method: "POST",
        body: formData,
      }),
    }),

    fetchCourseVideo: builder.query({
      query: (params) => `/course/videos?courseId=${params.courseId || ""}`,
      providesTags: ["CourseVideo"],
    }),

    fetchCourseVideoById: builder.query({
      query: (params) => `/user/courses/videos?courseId=${params.courseId}`,
      providesTags: ["CourseVideo"],
    }),

    deleteCourseVideo: builder.mutation({
      query: (id) => ({ url: "/course/videos", method: "DELETE", body: id }),
      invalidatesTags: ["CourseVideo"],
    }),

    uploadResource: builder.mutation({
      query: (formData) => ({
        url: "/uploads/resource",
        method: "POST",
        body: formData,
      }),
    }),

    fetchCourseProgress: builder.query({
      query: (params) => ({
        url: "/course/courseprogress",
        params: params,
      }),
      providesTags: ["Progress"],
    }),

    //----------------------------------Payment ------------------------------------------------------------------------------
    createOrder: builder.mutation({
      query: ({ userId, courseId, amount, agentRefCode }) => ({
        url: "/createorder",
        method: "POST",
        body: { userId, courseId, amount, agentRefCode },
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

    // ------------------------------------------------------------Contact Us Apis------------------------------------------------

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
        body: { id },
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
        body: { id },
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

    generateMeetingLink: builder.mutation({
      query: (meetingData) => ({
        url: "/meeting-links/generate",
        method: "POST",
        body: meetingData,
      }),
    }),

    updateMeetingStatus: builder.mutation({
      query: (data) => ({
        url: `/meeting-links/${data.id}`,
        method: "PATCH",
        body: { status: data.status },
      }),
      invalidatesTags: ["MeetingLink"],
    }),

    // ------------------------------------------------------------Job Application Apis------------------------------------------------

    CreateJobApplication: builder.mutation({
      query: (data) => ({
        url: `/JobApplication`,
        method: "POST",
        body: data,
      }),
    }),

    fetchJobApplications: builder.query({
      query: () => "/JobApplication",
      providesTags: ["JobApplication"],
    }),

    deleteJobApplication: builder.mutation({
      query: (id) => ({
        url: "/JobApplication",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["JobApplication"],
    }),

    // ----------------------------------------------------Withdrawal Request Apis---------------------------------------------

    fetchWithdrawalRequest: builder.query({
      query: () => "/admin/withdrawal",
      providesTags: ["User", "Withdrawal"],
    }),

    fetchUserWithdrawalRequest: builder.query({
      query: () => "/user/withdrawal",
      providesTags: ["User", "Withdrawal"],
    }),

    createWithdrawalRequest: builder.mutation({
      query: (formData) => ({
        url: "/user/withdrawal",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User", "Withdrawal"],
    }),

    updateWithdrawalRequest: builder.mutation({
      query: (formData) => ({
        url: "/admin/withdrawal",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["User", "Withdrawal"],
    }),

    deleteWithdrawalRequest: builder.mutation({
      query: (id) => ({
        url: "/admin/withdrawal",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["User", "Withdrawal"],
    }),

    deleteUserWithdrawalRequest: builder.mutation({
      query: (id) => ({
        url: "/user/withdrawal",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["User", "Withdrawal"],
    }),

    // ----------------------------------------------------Agent Apis--------------------------------------------------

    fetchAgentStats: builder.query({
      query: () => "/agent/stats",
      providesTags: ["Agent"],
    }),

    fetchAgentSales: builder.query({
      query: () => "/agent/saleslist",
      providesTags: ["Agent"],
    }),

    fetchagentCourseRefferalLink: builder.query({
      query: () => "/agent/courserefferal",
      providesTags: ["Agent"],
    }),

    createLead: builder.mutation({
      query: (formData) => ({
        url: "/agent/lead",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Agent"],
    }),

    fetchLeads: builder.query({
      query: () => "/agent/lead",
      providesTags: ["Agent"],
    }),

    deleteLead: builder.mutation({
      query: (id) => ({
        url: "/agent/lead",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Agent"],
    }),

    updateLead: builder.mutation({
      query: ({ id, ...formData }) => ({
        url: "/agent/lead",
        method: "PATCH",
        body: { id, ...formData },
      }),
      invalidatesTags: ["Agent"],
    }),


    // ----------------------------------------------------Offers Apis--------------------------------------------------

    // Offers Endpoints
    addOffer: builder.mutation({
      query: (formData) => ({
        url: "/admin/offers",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Offer"],
    }),

    updateOffer: builder.mutation({
      query: ({ id, ...formData }) => ({
        url: `/admin/offers`,
        method: "PUT",
        body: { id, ...formData },
      }),
      invalidatesTags: ["Offer"],
    }),

    deleteOffer: builder.mutation({
      query: (id) => ({
        url: "/admin/offers",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Offer"],
    }),

    fetchOffers: builder.query({
      query: () => "/admin/offers",
      providesTags: ["Offer"],
    }),

    // Get active offers for a course
    fetchActiveOffers: builder.mutation({
      query: (courseId) => ({
        url: "/admin/offers/active",
        method: "POST",
        body: { courseId },
      }),
    }),

    // ----------------------------------------------------Transactions Apis--------------------------------------------------

    // Transactions endpoint
    fetchTransactions: builder.query({
      query: () => "/transactions",
      providesTags: ["Transaction"],
      transformResponse: (response) => ({
        ...response,
        data: response.data.map((tx) => ({
          ...tx,
          userId: { ...tx.userId, name: tx.userId?.name || "N/A" },
          courseId: {
            ...tx.courseId,
            courseName: tx.courseId?.courseName || "N/A",
          },
        })),
      }),
    }),

    // ----------------------------------------------------Practice Test Apis--------------------------------------------------

    // Practice Test Endpoints
    addPracticeTest: builder.mutation({
      query: (formData) => ({
        url: "/practice-test",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["PracticeTest"],
    }),

    fetchPracticeTests: builder.query({
      query: () => "/practice-test",
      providesTags: ["PracticeTest"],
    }),

    updatePracticeTest: builder.mutation({
      query: ({ _id, ...formData }) => ({
        url: "/practice-test",
        method: "PUT",
        body: { _id, ...formData },
      }),
      invalidatesTags: ["PracticeTest"],
    }),

    deletePracticeTest: builder.mutation({
      query: (id) => ({
        url: "/practice-test",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["PracticeTest"],
    }),

    fetchUserPracticeTests: builder.query({
      query: () => "/user/practice-tests",
      providesTags: ["PracticeTest", "User"],
    }),

    fetchPracticeTestById: builder.query({
      query: (id) => `/practice-test?id=${id}`,
    }),

    grantManualCourseAccess: builder.mutation({
      query: (formData) => ({
        url: "/admin/grantcourseaccess",
        method: "POST",
        body: formData,
      }),
    }),

    // ----------------------------------------------------Visitor Tracking Apis-------------------------------------------------- //

    // New Visitor Tracking Endpoints
    trackVisitor: builder.mutation({
      query: (visitorData) => ({
        url: "/visitors",
        method: "POST",
        body: visitorData,
      }),
      invalidatesTags: ["Visitor"],
    }),

    fetchVisitors: builder.query({
      query: () => "/visitors",
      providesTags: ["Visitor"],
      transformResponse: (response) => ({
        ...response,
        data: response.data.map((visitor) => ({
          ...visitor,
          userId: {
            ...visitor.userId,
            name: visitor.userId?.name || "Guest",
            email: visitor.userId?.email || "N/A",
          },
        })),
      }),
    }),

    // Referral Settings

     fetchReferralSettings: builder.query({
      query: () => 'refferal-settings',
      providesTags: ['ReferralSettings'],
    }),

    updateReferralSettings: builder.mutation({
      query: (settings) => ({
        url: 'refferal-settings',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['ReferralSettings'],
    }),

    // ----------------------------------------------------User Practice Attempts Apis-------------------------------------------------- //

    fetchUserPracticeAttempts: builder.query({
      query: () => "/practice-test-attempt",
      providesTags: ["UserPracticeAttempt", "User"],
      transformResponse: (response) => ({
        success: true,
        data: response.data,
      }),
    }),

    addUserPracticeAttempt: builder.mutation({
      query: (formData) => ({
        url: "/user/practice-test-attempt",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["UserPracticeAttempt", "User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,

  useValidateTokenQuery,
  useGetUserProfileQuery,

  useAddCourseMutation,
  useFetchCourcesQuery,
  useAdminloginMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useFetchCourcebyIdQuery,

  useAddAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  useResetAgentPasswordMutation,
  useFetchAgentQuery,
  useFetchAgentsQuery,
  useUpdateAgentTargetMutation,

  useFetchUserQuery,
  useFetchUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useFetchUsersQuery,
  useFetchUserOngoingCoursesQuery,

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

  useUpdateVideoProgressMutation,
  useGetVideoProgressQuery,

  useFetchUserRefferalsQuery,
  useFetchCourseProgressQuery,

  useAddOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
  useFetchOffersQuery,

  useFetchActiveOffersMutation,

  useFetchWithdrawalRequestQuery,
  useFetchUserWithdrawalRequestQuery,
  useCreateWithdrawalRequestMutation,
  useUpdateWithdrawalRequestMutation,
  useDeleteWithdrawalRequestMutation,
  useDeleteUserWithdrawalRequestMutation,

  useFetchAgentStatsQuery,
  useFetchAgentSalesQuery,
  useFetchagentCourseRefferalLinkQuery,
  useCreateLeadMutation,
  useFetchLeadsQuery,
  useUpdateLeadMutation,
  useDeleteLeadMutation, 

  useFetchTransactionsQuery,
  useGrantManualCourseAccessMutation,

  useAddPracticeTestMutation,
  useFetchPracticeTestsQuery,
  useUpdatePracticeTestMutation,
  useDeletePracticeTestMutation,
  useFetchUserPracticeTestsQuery,

  useFetchPracticeTestByIdQuery,

  useTrackVisitorMutation,
  useFetchVisitorsQuery,

  useFetchReferralSettingsQuery,
  useUpdateReferralSettingsMutation,

  useFetchUserPracticeAttemptsQuery,
  useAddUserPracticeAttemptMutation,

} = paarshEduApi;
