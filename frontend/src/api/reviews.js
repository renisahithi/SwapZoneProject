import API from "./axios";

export const createReview = (data) => API.post("/reviews", data);
export const getUserReviews = (userId) => API.get(`/reviews/user/${userId}`);