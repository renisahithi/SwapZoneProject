import { useContext } from "react";
import { Link } from "react-router-dom";
import { BookmarkContext } from "../context/BookmarkContext";

const Bookmarks = () => {
  const { bookmarks, removeBookmark } = useContext(BookmarkContext);

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "0 1rem" }}>
      <h2>My Bookmarks</h2>
      {bookmarks.length === 0 ? (
        <p>No bookmarks yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
          {bookmarks.map((listing) => (
            <div key={listing._id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem" }}>
              {listing.images[0] && (
                <img
                  src={`http://localhost:5000${listing.images[0]}`}
                  alt={listing.title}
                  style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "4px" }}
                />
              )}
              <Link to={`/listing/${listing._id}`}><h3>{listing.title}</h3></Link>
              <p>{listing.category}</p>
              <button onClick={() => removeBookmark(listing._id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;