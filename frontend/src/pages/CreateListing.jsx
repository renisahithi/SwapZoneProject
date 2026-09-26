import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing } from "../api/listing";

const categories = ["Textbooks", "Electronics", "Dorm Essentials", "Academic Supplies", "Skills", "Other"];
const campusLocations = ["North Dorm", "South Dorm", "Library", "Main Building", "Cafeteria"];

const CreateListing = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [type, setType] = useState("sale");
  const [price, setPrice] = useState("");
  const [campusLocation, setCampusLocation] = useState(campusLocations[0]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5); // max 5
    setImages(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("type", type);
    formData.append("price", type === "sale" ? price : 0);
    formData.append("campusLocation", campusLocation);
    images.forEach((img) => formData.append("images", img));

    try {
      const { data } = await createListing(formData);
      navigate(`/listing/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create listing");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "0 1rem" }}>
      <h2>Create Listing</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="sale">Sale</option>
          <option value="barter">Barter</option>
          <option value="donate">Donate</option>
        </select>

        {type === "sale" && (
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        )}

        <select value={campusLocation} onChange={(e) => setCampusLocation(e.target.value)}>
          {campusLocations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <label>Images (up to 5):</label>
        <input type="file" accept="image/*" multiple onChange={handleImageChange} />

        {previews.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {previews.map((src, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img src={src} alt="preview" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }} />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  style={{ position: "absolute", top: 0, right: 0, background: "red", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer" }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit">Create Listing</button>
      </form>
    </div>
  );
};

export default CreateListing;