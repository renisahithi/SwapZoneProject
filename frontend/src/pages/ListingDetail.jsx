import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getListingById } from "../api/listing";
import { createTradeRequest } from "../api/trades";
import { AuthContext } from "../context/AuthContext";
import { BookmarkContext } from "../context/BookmarkContext";
// import { createReview } from "../api/reviews";
const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [proposalType, setProposalType] = useState("buy");
  const [offeredPrice, setOfferedPrice] = useState("");
  const [offeredItem, setOfferedItem] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const { user } = useContext(AuthContext);
  const { toggleBookmark, isBookmarked } = useContext(BookmarkContext);
  const navigate = useNavigate();

  useEffect(() => {
    getListingById(id).then((res) => setListing(res.data));
  }, [id]);

  const handleTradeRequest = async (e) => {
    e.preventDefault();
    setStatus("");
    try {
      await createTradeRequest({
        listingId: id,
        proposalType,
        offeredPrice: proposalType === "buy" ? offeredPrice : undefined,
        offeredItem: proposalType === "barter" ? offeredItem : undefined,
        message,
      });
      setStatus("Request sent!");
    } catch (err) {
      setStatus(err.response?.data?.message || "Failed to send request");
    }
  };

  if (!listing) return <p>Loading...</p>;

  const isOwner = user && listing.owner._id === user._id;
//   const [reviewRating, setReviewRating] = useState(5);
// const [reviewComment, setReviewComment] = useState("");
// const [reviewStatus, setReviewStatus] = useState("");

// const handleReview = async (tradeRequestId) => {
//   try {
//     await createReview({ tradeRequestId, rating: reviewRating, comment: reviewComment });
//     setReviewStatus("Review submitted!");
//   } catch (err) {
//     setReviewStatus(err.response?.data?.message || "Failed to submit review");
//   }
// };
  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "0 1rem" }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", margin: "1rem 0" }}>
        {listing.images.length > 0 ? (
          listing.images.map((img, i) => (
            <img
              key={i}
              src={`http://localhost:5000${img}`}
              alt={listing.title}
              style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "6px" }}
            />
          ))
        ) : (
          <p>No images</p>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{listing.title}</h1>
        {user && (
          <button onClick={() => toggleBookmark(listing)}>
            {isBookmarked(listing._id) ? "★ Bookmarked" : "☆ Bookmark"}
          </button>
        )}
      </div>

      <p>{listing.description}</p>
      <p><strong>Category:</strong> {listing.category}</p>
      <p><strong>Type:</strong> {listing.type}</p>
      {listing.type === "sale" && <p><strong>Price:</strong> ₹{listing.price}</p>}
      <p><strong>Location:</strong> {listing.campusLocation}</p>
      <p><strong>Status:</strong> {listing.status}</p>
      <p><strong>Posted by:</strong> {listing.owner.name} ({listing.owner.campus})</p>

      {!isOwner && user && listing.status === "Available" && (
        <form onSubmit={handleTradeRequest} style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "400px" }}>
          <h3>Make a Request</h3>
          <select value={proposalType} onChange={(e) => setProposalType(e.target.value)}>
            <option value="buy">Buy</option>
            <option value="barter">Barter</option>
          </select>

          {proposalType === "buy" ? (
            <input
              type="number"
              placeholder="Your offered price"
              value={offeredPrice}
              onChange={(e) => setOfferedPrice(e.target.value)}
            />
          ) : (
            <input
              type="text"
              placeholder="What are you offering in exchange?"
              value={offeredItem}
              onChange={(e) => setOfferedItem(e.target.value)}
            />
          )}

          <textarea
            placeholder="Message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button type="submit">Send Request</button>
          {status && <p>{status}</p>}
        </form>
      )}

      {!user && <p>Log in to make a request on this listing.</p>}
      {isOwner && <p>This is your own listing.</p>}
    </div>
  );
};

export default ListingDetail;