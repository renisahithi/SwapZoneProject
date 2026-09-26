import API from "./axios";

export const createTradeRequest = (data) => API.post("/trades", data);
export const getSentRequests = () => API.get("/trades/sent");
export const getReceivedRequests = () => API.get("/trades/received");
export const respondToTrade = (id, status) => API.put(`/trades/${id}`, { status });