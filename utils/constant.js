export const NOTIFICATION_TYPES = {
  COURSE_PURCHASE: 'course_purchase',
  NEW_COURSE: 'new_course',
  USER_REGISTRATION: 'user_registration',
  NEW_OFFER: 'new_offer',
  NEW_BLOG: 'new_blog',
  JOB_APPLICATION: 'job_application',
  ENQUIRY: 'enquiry',
  WITHDRAWAL_REQUEST: 'withdrawal_request'
};

export const NOTIFICATION_MESSAGES = {
  [NOTIFICATION_TYPES.COURSE_PURCHASE]: {
    user: (courseName) => `🎓 You have successfully purchased "${courseName}". Start learning now!`,
    admin: (userName, courseName) => `💰 ${userName} purchased "${courseName}"`
  },
  [NOTIFICATION_TYPES.NEW_COURSE]: {
    broadcast: (courseName) => `📚 New course "${courseName}" is now available. Check it out!`
  },
  [NOTIFICATION_TYPES.USER_REGISTRATION]: {
    admin: (userName, email) => `👤 New user registered: ${userName} (${email})`
  },
  [NOTIFICATION_TYPES.NEW_OFFER]: {
    broadcast: (offerTitle) => `🎉 Special offer: ${offerTitle}. Limited time only!`
  },
  [NOTIFICATION_TYPES.NEW_BLOG]: {
    broadcast: (blogTitle) => `📝 New blog post: "${blogTitle}". Read now!`
  },
  [NOTIFICATION_TYPES.JOB_APPLICATION]: {
    admin: (userName, position) => `💼 New job application from ${userName} for ${position}`
  },
  [NOTIFICATION_TYPES.ENQUIRY]: {
    admin: (userName, subject) => `❓ New enquiry from ${userName}: ${subject}`
  },
  [NOTIFICATION_TYPES.WITHDRAWAL_REQUEST]: {
    admin: (userName, amount) => `💰 Withdrawal request from ${userName}: $${amount}`
  }
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed'
};