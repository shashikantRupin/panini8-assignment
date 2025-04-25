import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navItems } from "../constants/Navitems";
import { Menu, X } from "lucide-react";
import "../styles/Navbar.css"; 
const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    navigate("/signin"); // Redirect to signin
  };

  return (
    <nav className="navbar">
      <div className="container">
        {/* Logo */}
        <div className="logo">
          <Link to="/">Blogs</Link>
        </div>

        {/* Desktop Nav */}
        <ul className="nav-links">
          {navItems().map((item) => (
            <li key={item.id}>
              <Link
                to={item.url}
                className={`nav-item ${
                  location.pathname === item.url ? "active" : ""
                } ${
                  item.title === "Signup" || item.title === "Signin"
                    ? "newClass"
                    : ""
                }`}
                onClick={item.title === "Logout" ? handleLogout : null}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Toggle */}
        <div className="menu-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <ul className="mobile-nav-links">
          {navItems().map((item) => (
            <li key={item.id}>
              <Link
                to={item.url}
                onClick={() => {
                  setIsOpen(false);
                  if (item.title === "Logout") handleLogout(); // Add logout handler
                }}
                className={`mobile-nav-item ${
                  location.pathname === item.url ? "active" : ""
                }`}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
