import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getListings } from "../api/listing";

const categories = ["Textbooks", "Electronics", "Dorm Essentials", "Academic Supplies", "Skills", "Other"];

const Home = () => {
  const [listings, setListings] = useState([]);
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (sortBy) params.sortBy = sortBy;
      if (search) params.search = search;

      const { data } = await getListings(params);
      setListings(data.listings);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, sortBy, search]);

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1rem" }}>
      <h1>SwapZone Listings</h1>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Sort By</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : listings.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {listings.map((listing) => (
            <Link
              key={listing._id}
              to={`/listing/${listing._id}`}
              style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", textDecoration: "none", color: "inherit" }}
            >
              {listing.images[0] && (
                <img
                  src={`http://localhost:5000${listing.images[0]}`}
                  alt={listing.title}
                  style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "4px" }}
                />
              )}
              <h3>{listing.title}</h3>
              <p>{listing.category} · {listing.type}</p>
              {listing.type === "sale" && <p>₹{listing.price}</p>}
              <p style={{ fontSize: "0.85rem", color: "#666" }}>{listing.campusLocation}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;