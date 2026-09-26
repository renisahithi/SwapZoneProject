import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { getListings, deleteListing } from "../api/listing";
import { AuthContext } from "../context/AuthContext";

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchMyListings = async () => {
    const { data } = await getListings({ owner: user._id });
    setListings(data.listings);
  };

  useEffect(() => {
    if (user) fetchMyListings();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    await deleteListing(id);
    setListings((prev) => prev.filter((l) => l._id !== id));
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "0 1rem" }}>
      <h2>My Listings</h2>
      {listings.length === 0 ? (
        <p>You haven't posted any listings yet.</p>
      ) : (
        listings.map((listing) => (
          <div key={listing._id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Link to={`/listing/${listing._id}`}><strong>{listing.title}</strong></Link>
              <p>{listing.category} · {listing.status}</p>
            </div>
            <button onClick={() => handleDelete(listing._id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
};

export default MyListings;