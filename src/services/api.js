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
    const studentAccessToken = localStorage.getItem("student_access_token");

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    if (adminAccessToken) {
      headers.set("Admin-Authorization", `Bearer ${adminAccessToken}`);
    }
    if (studentAccessToken) {
      headers.set("Student-Authorization", `Bearer ${studentAccessToken}`);
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
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      api.dispatch(logoutAction());
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
    "JobApplication",
    "JobPosition",
    "Notifications",
    "Feedback",
    "Blog",
    "College",
    "Student",
    "Test",
    "Results",
    "Role",
    "Questions",
    "Batch",
    "Tests",
    "TestSession",

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
      transformResponse: (response) => ({
        success: true,
        data: response.data || {},
      }),
    }),

    // User APIs
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
        url: "/user/forgot-password",
        method: "POST",
        body: email,
      }),
    }),

    changePassword: builder.mutation({
      query: ({ email, userId, previousPassword, newPassword }) => ({
        url: "/user/change-password",
        method: "PUT",
        body: { email, userId, previousPassword, newPassword },
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ email, password, otp }) => ({
        url: "/user/forgot-password",
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

    toggleUserBlock: builder.mutation({
      query: ({ userId, isBlocked }) => ({
        url: `/user/${userId}/block`,
        method: "PATCH",
        body: { isBlocked },
      }),
      invalidatesTags: ["Users"],
    }),

    fetchUserRefferals: builder.query({
      query: () => "/user/user-refferals",
      providesTags: ["User"],
    }),

    fetchUserOngoingCourses: builder.query({
      query: () => "/user/ongoing-courses",
      providesTags: ["User"],
    }),

    fetchUserCourse: builder.query({
      query: () => "/user/courses",
      providesTags: ["Course", "User"],
    }),

    // Course APIs
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

    // Admin APIs
    adminlogin: builder.mutation({
      query: (credentials) => ({
        url: "/admin/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Course"],
    }),

    // Agent APIs
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

    createAgentTarget: builder.mutation({
      query: (formData) => ({
        url: "/admin/agents/targetset",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Agent"],
    }),

    // Users APIs
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

    // Categories APIs
    addCategory: builder.mutation({
      query: (formData) => ({
        url: "/course/category",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategories: builder.mutation({
      query: ({ formData, id }) => ({
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

    // SubCategories APIs
    addSubCategory: builder.mutation({
      query: (formData) => ({
        url: "/course/subcategory",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["SubCategory"],
    }),

    updateSubCategories: builder.mutation({
      query: ({ formData, id }) => ({
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

    // Course Videos APIs
    addCourseVideo: builder.mutation({
      query: (formData) => ({
        url: "/course/videos",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["CourseVideo"],
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
      query: (id) => ({
        url: "/course/videos",
        method: "DELETE",
        body: id,
      }),
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
        params,
      }),
      providesTags: ["Progress"],
    }),

    // Payment APIs
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

    grantManualCourseAccess: builder.mutation({
      query: (formData) => ({
        url: "/admin/grantcourseaccess",
        method: "POST",
        body: formData,
      }),
    }),

    // Contact Us APIs
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

    // Meeting Links APIs
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
        params,
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

    // Job Application APIs
    createJobApplication: builder.mutation({
      query: (data) => ({
        url: "/JobApplication",
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

    // Withdrawal Request APIs
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

    // Agent Stats and Sales APIs

    createAgentSale: builder.mutation({
      query: (formData) => ({
        url: "/agent/sale",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Agent"],
    }),

    fetchAgentSales: builder.query({
      query: () => "/agent/saleslist",
      providesTags: ["Agent"],
    }),

    fetchAgentPerformance: builder.query({
      query: ({ id }) => `/admin/agents/${id}/performance`,
      providesTags: ["Agent"],
    }),

    fetchAgentSalesAdmin: builder.query({
      query: ({ agentId }) => `/admin/agents/sales?agentId=${agentId}`,
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

    // Offers APIs
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
        url: "/admin/offers",
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

    fetchActiveOffers: builder.query({
      query: ({ courseId, userId }) => ({
        url: "/admin/offers/active",
        method: "POST",
        body: { courseId, userId },
      }),
    }),

    // Transactions APIs
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

    // Practice Test APIs
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
      providesTags: ["PracticeTest"],
    }),

    // Visitor Tracking APIs
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

    // Referral Settings APIs
    fetchReferralSettings: builder.query({
      query: () => "/refferal-settings",
      providesTags: ["ReferralSettings"],
    }),

    updateReferralSettings: builder.mutation({
      query: (settings) => ({
        url: "/refferal-settings",
        method: "PUT",
        body: settings,
      }),
      invalidatesTags: ["ReferralSettings"],
    }),

    fetchUserRefferalAdmin: builder.query({
      query: () => "/admin/userrefferals",
      providesTags: ["User"],
    }),

    // User Practice Attempts APIs
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

    // ----------------------------------------------------Job Position Apis--------------------------------------------------

    createJobPosition: builder.mutation({
      query: (data) => ({
        url: "/JobPosition",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["JobPosition"],
    }),

    fetchJobPositions: builder.query({
      query: () => "/JobPosition",
      providesTags: ["JobPosition"],
    }),

    updateJobPosition: builder.mutation({
      query: ({ id, ...data }) => ({
        url: "/JobPosition",
        method: "PUT",
        body: { id, ...data },
      }),
      invalidatesTags: ["JobPosition"],
    }),

    deleteJobPosition: builder.mutation({
      query: (id) => ({
        url: "/JobPosition",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["JobPosition"],
    }),

    validateUpiId: builder.mutation({
      query: (upiId) => ({
        url: "/validate-upi",
        method: "POST",
        body: { upiId },
      }),
      // Transform the response to match the expected format
      transformResponse: (response) => ({
        success: response.success,
        customer_name: response.customer_name,
        message: response.message,
      }),
      invalidatesTags: ["Payment"],
    }),

    subscribeToNewsletter: builder.mutation({
      query: (email) => ({
        url: "/newsletter",
        method: "POST",
        body: { email },
      }),
    }),

    // ----------------------------------------------------Notifications Apis--------------------------------------------------

    fetchNotifications: builder.query({
      query: ({ page = 1, limit = 10, isRead }) => {
        const params = new URLSearchParams({ page, limit });

        if (typeof isRead === "boolean") {
          params.append("isRead", isRead.toString());
        }

        return `/notifications?${params.toString()}`;
      },
      providesTags: ["Notifications"],
    }),

    sendNotification: builder.mutation({
      query: (data) => ({
        url: "/notifications/send",
        method: "POST",
        body: { ...data },
      }),
      invalidatesTags: ["Notifications"],
    }),

    sendEmailNotification: builder.mutation({
      query: (data) => ({
        url: "/notifications/send-email",
        method: "POST",
        body: { ...data },
      }),
      invalidatesTags: ["Notifications"],
    }),

    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),

    markNotificationAsRead: builder.mutation({
      query: (payload) => ({
        url: `/notifications/mark-read`,
        method: "POST",
        body:
          typeof payload === "string"
            ? { notificationIds: [payload] }
            : payload, // Handles { markAll: true } or other objects
      }),
      invalidatesTags: ["Notifications"],
    }),

    fetchUnreadNotificationCount: builder.query({
      query: () => "/notifications/unread-count",
    }),

    subscribePushNotifications: builder.mutation({
      query: (subscription) => ({
        url: "/notifications/subscribe",
        method: "POST",
        body: subscription,
      }),
      invalidatesTags: ["Notifications"],
    }),

    fetchAdminNotifications: builder.query({
      query: ({ page = 1, limit = 10, isRead }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (typeof isRead === "boolean") {
          params.append("isRead", isRead.toString());
        }

        return `/admin/notifications?${params.toString()}`;
      },
      providesTags: ["Notifications"],
    }),

    markAdminNotificationAsRead: builder.mutation({
      query: (payload) => ({
        url: `/admin/notifications/mark-read`,
        method: "POST",
        body:
          typeof payload === "string"
            ? { notificationIds: [payload] }
            : payload, // Handles { markAll: true } or other objects
      }),
      invalidatesTags: ["Notifications"],
    }),

    fetchAdminUnreadNotificationCount: builder.query({
      query: () => "/admin/notifications/unread-count",
    }),

    getNotificationLogs: builder.query({
      query: () => "/notifications/send",
      providesTags: ["Notifications"],
    }),

    deleteNotificationLog: builder.mutation({
      query: (jobId) => ({
        url: "/notifications/send",
        method: "DELETE",
        body: { jobId },
      }),
      invalidatesTags: ["Notifications"],
    }),

    resendNotification: builder.mutation({
      query: (jobId) => ({
        url: "/notifications/send",
        method: "PUT",
        body: { jobId },
      }),
      invalidatesTags: ["Notifications"],
    }),

    fetchMe: builder.query({
      query: () => "/me",
      providesTags: ["User"],
    }),

    fetchRole: builder.query({
      query: () => "/admin/loginuser",
      providesTags: ["Role"],
    }),

    fetchUserRefferalAdmin: builder.query({
      query: () => "/admin/userrefferals",
    }),

    // ----------------------------------------------------Feedbacks Apis--------------------------------------------------

    fetchFeedbacks: builder.query({
      query: () => "/feedbacks",
      providesTags: ["Feedback"],
      transformResponse: (response) => ({
        ...response,
        data: response.data.map((fb) => ({
          ...fb,
          userId: { ...fb.userId, name: fb.userId?.name || "N/A" },
        })),
      }),
    }),

    submitFeedback: builder.mutation({
      query: (formData) => ({
        url: "/feedbacks",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Feedback"],
    }),

    deleteFeedback: builder.mutation({
      query: (id) => ({
        url: "/feedbacks",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Feedback"],
    }),

    // ---------------------------------------------------- Ads Apis --------------------------------------------------

    fetchAds: builder.query({
      query: () => "/ads",
      providesTags: ["Ad"],
    }),

    createAd: builder.mutation({
      query: (adData) => ({
        url: "/ads",
        method: "POST",
        body: adData,
      }),
      invalidatesTags: ["Ad"],
    }),

    updateAd: builder.mutation({
      query: ({ id, ...adData }) => ({
        url: "/ads",
        method: "PUT",
        body: { id, ...adData },
      }),
      invalidatesTags: ["Ad"],
    }),
    deleteAd: builder.mutation({
      query: (id) => ({
        url: "/ads",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Ad"],
    }),

    // ---------------------------------------------------- Enquiries Apis --------------------------------------------------

    fetchEnquiries: builder.query({
      query: () => "/enquiries",
      providesTags: ["Enquiry"],
    }),

    createEnquiry: builder.mutation({
      query: (enquiryData) => ({
        url: "/enquiries",
        method: "POST",
        body: enquiryData,
      }),
      invalidatesTags: ["Enquiry"],
    }),

    deleteEnquiry: builder.mutation({
      query: (id) => ({
        url: `/enquiries?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Enquiry"],
    }),

    // ---------------------------------------------------- Blogs Apis --------------------------------------------------

    fetchBlogs: builder.query({
      query: () => "blogs",
      providesTags: ["Blog"],
    }),

    fetchBlogById: builder.query({
      query: (blogId) => `/blogs/${blogId}`,
      providesTags: (result, error, id) => [{ type: "Blog", id }],
    }),

    createBlog: builder.mutation({
      query: (blog) => ({
        url: "blogs",
        method: "POST",
        body: blog,
      }),
      invalidatesTags: ["Blog"],
    }),

    updateBlog: builder.mutation({
      query: ({ id, blog }) => ({
        url: "blogs",
        method: "PUT",
        body: { id, ...blog },
      }),
      invalidatesTags: ["Blog"],
    }),

    deleteBlog: builder.mutation({
      query: (id) => ({
        url: "blogs",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Blog"],
    }),

    // Apptitude Test Apis

    createCollege: builder.mutation({
      query: (collegeData) => ({
        url: "/admin/aptitude-test/colleges",
        method: "POST",
        body: collegeData,
      }),
      invalidatesTags: ["College"],
    }),

    updateCollege: builder.mutation({
      query: ({collegeId , data}) => ({
        url: `/admin/aptitude-test/colleges?collegeId=${collegeId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["College"], 
    }),
  
    deleteCollege: builder.mutation({
      query: ({collegeId}) => ({
        url: `/admin/aptitude-test/colleges?collegeId=${collegeId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["College"],
    }),

    fetchColleges: builder.query({
      query: () => "/admin/aptitude-test/colleges",
      providesTags: ["College"],
    }),

    fetchCollegebatches: builder.query({
      query: ({collegeId}) => `/admin/aptitude-test/colleges/batches?collegeId=${collegeId}`,
      providesTags: ["Batch"],
    }),

    getCollegeResults: builder.query({
      query: (collegeId) => `/admin/aptitude-test/colleges/${collegeId}/results`,
      providesTags: ["Results"],
    }),

    generateTestLink: builder.mutation({
      query: (collegeId) => ({
        url: `/admin/aptitude-test/colleges/${collegeId}/test-link`,
        method: "POST",
      }),
    }),

    // Question Endpoints 

     createQuestion: builder.mutation({
      query: (questionData) => ({
        url: '/aptitude-test/questions',
        method: 'POST',
        body: questionData,
      }),
      invalidatesTags: ['Questions'],
    }),

    addQuestions: builder.mutation({
      query: (body) => ({
        url: "/aptitude-test-questions",
        method: "POST",
        body,

      }),
      providesTags: ["Questions"],
    }),

    fetchQuestions: builder.query({
      query: () => "/aptitude-test-questions",
      providesTags: ["Questions"],
    }),

    updateQuestion: builder.mutation({
      query: ({ id, ...questionData }) => ({
        url: `/admin/aptitude-questions/${id}`,
        method: 'PUT',
        body: questionData,
      }),
      invalidatesTags: ['Questions'],
    }),
    
    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `/admin/aptitude-questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Questions']
    }),

    // Student endpoints
   registerStudent: builder.mutation({
      query: (studentData) => ({
        url: '/admin/aptitude-test/student/register',
        method: 'POST',
        body: studentData,
      }),
    }),

   loginStudent: builder.mutation({
      query: (credentials) => ({
        url: '/admin/aptitude-test/student/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Test endpoints
    createTestSession: builder.mutation({
      query: (testSessionData) => ({
        url: '/admin/aptitude-test/session',
        method: 'POST',
        body: testSessionData,
      }),
      invalidatesTags: ['TestSession'],
    }),

    startTestSession: builder.mutation({
      query: (sessionData) => ({
        url: '/admin/aptitude-test/start',
        method: 'POST',
        body: sessionData,
      }),
    }),

    saveAnswer: builder.mutation({
      query: ({ sessionId, questionId, selectedAnswer }) => ({
        url: `/admin/aptitude-test/session/${sessionId}/answer`,
        method: 'PATCH',
        body: { questionId, selectedAnswer },
      }),
    }),

    submitTest: builder.mutation({
      query: ({ sessionId, answers }) => ({
        url: `/admin/aptitude-test/session/${sessionId}/submit`,
        method: "POST",
        body: { sessionId, answers },
      }),
      invalidatesTags: ["Test", "Results"],
    }),

  getTestSessions: builder.query({
      query: ({ collegeId }) => ({
        url: collegeId ? `/admin/aptitude-test/sessions?collegeId=${collegeId}` : "/admin/aptitude-test/sessions",
        method: "GET",
      }),
      transformResponse: (response) => response.testSessions,
      providesTags: ["TestSession"],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("Test Sessions query error:", error);
        }
      },
    }),

    getTestSession: builder.query({
      query: (sessionId) => `/admin/aptitude-test/session/${sessionId}`,
      providesTags: ['TestSession'],
    }),

    reportViolation: builder.mutation({
      query: (violationData) => ({
        url: "/aptitude-test/violation",
        method: "POST",
        body: violationData,
      }),
    }),

    createTest: builder.mutation({
      query: (testData) => ({
        url: '/admin/aptitude-test/colleges/test',
        method: 'POST',
        body: testData,
      }),
    }),

    getTestInfo: builder.query({
      query: ({ sessionId, testId, collegeId }) =>
        `/admin/aptitude-test?sessionId=${sessionId}&testId=${testId}&collegeId=${collegeId}`,
      transformResponse: (response) => response.data,
    }),

    getTestInstruction: builder.query({
      query: ({ sessionId, testId, collegeId }) =>
        `/admin/aptitude-test/instructions?sessionId=${sessionId}&testId=${testId}&collegeId=${collegeId}`,
      transformResponse: (response) => response.data,
    }),

    getTests: builder.query({
      query: ({collegeId}) => `/admin/aptitude-test/colleges/test?collegeId=${collegeId}`,
      transformResponse: (response) => response.data,
      providesTags:(result, error, collegeId) => [{ type: 'Tests', id: collegeId }],
    }),

    getTestByCollegeId: builder.query({
      query: ({collegeId}) => `/admin/aptitude-test/colleges/college/test?collegeId=${collegeId}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, collegeId) => [{ type: 'Tests', id: collegeId }],
    }),
 
    deleteTest: builder.mutation({
      query: ({ testId, collegeId }) => ({
        url: `/admin/aptitude-test/colleges/test?testId=${testId}&collegeId=${collegeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { collegeId }) => [
        { type: 'Tests', id: collegeId },
        'Colleges',
      ],
    }),

    // Student APIs
    fetchStudents: builder.query({
      query: () => "/admin/students",
      providesTags: ["Student"],
    }),

    deleteStudent: builder.mutation({
      query: (id) => ({
        url: "/admin/students",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["Student"],
    }),

    bulkUploadQuestions: builder.mutation({
      query: (data) => ({
        url: "/admin/aptitude-questions/bulk-upload",
        method: "POST",
        body: data,
      }),
    }),

  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useForgotPasswordMutation,
  useChangePasswordMutation,
  useResetPasswordMutation,
  useToggleUserBlockMutation,
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
  useFetchAgentSalesAdminQuery,
  useFetchAgentsQuery,
  useCreateAgentTargetMutation,
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
  useFetchActiveOffersQuery,
  useFetchWithdrawalRequestQuery,
  useFetchUserWithdrawalRequestQuery,
  useCreateWithdrawalRequestMutation,
  useUpdateWithdrawalRequestMutation,
  useDeleteWithdrawalRequestMutation,
  useDeleteUserWithdrawalRequestMutation,
  useCreateAgentSaleMutation,
  useFetchAgentPerformanceQuery,
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
  useFetchUserRefferalAdminQuery,
  useFetchUserPracticeAttemptsQuery,
  useAddUserPracticeAttemptMutation,

  useCreateJobPositionMutation,
  useFetchJobPositionsQuery,
  useUpdateJobPositionMutation,
  useDeleteJobPositionMutation,

  useValidateUpiIdMutation,
  useSubscribeToNewsletterMutation,

  useFetchNotificationsQuery,
  useSendNotificationMutation,
  useSendEmailNotificationMutation,
  useDeleteNotificationMutation,
  useMarkNotificationAsReadMutation,
  useFetchUnreadNotificationCountQuery,
  useSubscribePushNotificationsMutation,

  useFetchAdminNotificationsQuery,
  useMarkAdminNotificationAsReadMutation,
  useFetchAdminUnreadNotificationCountQuery,

  useGetNotificationLogsQuery,
  useDeleteNotificationLogMutation,
  useResendNotificationMutation,

  useFetchMeQuery,
  useFetchRoleQuery,
  useFetchFeedbacksQuery,
  useSubmitFeedbackMutation,
  useDeleteFeedbackMutation,

  useFetchAdsQuery,
  useCreateAdMutation,
  useUpdateAdMutation,
  useDeleteAdMutation,

  useFetchEnquiriesQuery,
  useCreateEnquiryMutation,
  useDeleteEnquiryMutation,

  useFetchBlogsQuery,
  useFetchBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,

  useCreateCollegeMutation,
  useFetchCollegesQuery,
  useFetchCollegebatchesQuery,
  useUpdateCollegeMutation,
  useDeleteCollegeMutation,
  useGetCollegeResultsQuery,
  useGenerateTestLinkMutation,
  useRegisterStudentMutation,
  useLoginStudentMutation,
  useSubmitTestMutation,
  useReportViolationMutation,

  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useFetchQuestionsQuery,
  useAddQuestionsMutation,
  useDeleteQuestionMutation,

  useGetTestSessionsQuery,
  useCreateTestSessionMutation,

  useStartTestSessionMutation,
  useSaveAnswerMutation,
  useGetTestInfoQuery,
  useGetTestInstructionQuery,
  useCreateTestMutation,
  useLazyGetTestsQuery,
  useGetTestsQuery,
  useGetTestByCollegeIdQuery,
  useDeleteTestMutation,

  useFetchStudentsQuery,
  useDeleteStudentMutation,
  useBulkUploadQuestionsMutation,
} = paarshEduApi;
