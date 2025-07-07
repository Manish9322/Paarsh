// utils/formatRelativeTime.js
import { formatDistanceToNow } from "date-fns";

export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true }); 
};