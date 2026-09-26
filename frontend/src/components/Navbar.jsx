import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <Link to="/" style={{ fontWeight: "bold", fontSize: "1.2rem" }}>SwapZone</Link>

      <div style={{ display: "flex", gap: "1rem" }}>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <span>Hi, {user.name}</span>
            <Link to="/create-listing">+ New Listing</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/my-listings">My Listings</Link>
            <Link to="/bookmarks">Bookmarks</Link>
            <Link to="/trades">Trades</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
