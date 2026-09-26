import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSentRequests, getReceivedRequests, respondToTrade } from "../api/trades";
import { createReview } from "../api/reviews";

const ReviewForm = ({ tradeRequestId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");

  const submitReview = async () => {
    try {
      await createReview({ tradeRequestId, rating, comment });
      setStatus("Review submitted!");
    } catch (err) {
      setStatus(err.response?.data?.message || "Failed to submit review");
    }
  };

  if (status === "Review submitted!") return <p>{status}</p>;

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>{n} stars</option>
        ))}
      </select>
      <input placeholder="Comment" value={comment} onChange={(e) => setComment(e.target.value)} />
      <button onClick={submitReview}>Submit Review</button>
      {status && <p>{status}</p>}
    </div>
  );
};

const TradeInbox = () => {
  const [tab, setTab] = useState("received");
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const { data } = tab === "sent" ? await getSentRequests() : await getReceivedRequests();
    setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
  }, [tab]);

  const handleRespond = async (id, status) => {
    await respondToTrade(id, status);
    fetchRequests();
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "0 1rem" }}>
      <h2>Trade Requests</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button onClick={() => setTab("received")} style={{ fontWeight: tab === "received" ? "bold" : "normal" }}>
          Received
        </button>
        <button onClick={() => setTab("sent")} style={{ fontWeight: tab === "sent" ? "bold" : "normal" }}>
          Sent
        </button>
      </div>

      {requests.length === 0 ? (
        <p>No {tab} requests.</p>
      ) : (
        requests.map((req) => (
          <div key={req._id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
            <Link to={`/listing/${req.listing._id}`}><strong>{req.listing.title}</strong></Link>
            <p>Type: {req.proposalType}</p>
            {req.proposalType === "buy" ? <p>Offered: ₹{req.offeredPrice}</p> : <p>Offered item: {req.offeredItem}</p>}
            {req.message && <p>Message: {req.message}</p>}
            {tab === "received" && req.requester && <p>From: {req.requester.name} ({req.requester.email})</p>}
            <p>Status: <strong>{req.status}</strong></p>

            {tab === "received" && req.status === "Pending" && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => handleRespond(req._id, "Accepted")}>Accept</button>
                <button onClick={() => handleRespond(req._id, "Rejected")}>Reject</button>
              </div>
            )}
            {tab === "received" && req.status === "Accepted" && (
              <button onClick={() => handleRespond(req._id, "Completed")}>Mark Completed</button>
            )}
            {req.status === "Completed" && <ReviewForm tradeRequestId={req._id} />}
          </div>
        ))
      )}
    </div>
  );
};

export default TradeInbox;