import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import { api } from "../constants/api";
import axios from 'axios';


const Signup = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      setSuccess("");
      return;
    }
  
    setError("");
    setSuccess("");
    setLoading(true);
  
    try {
      const response = await axios.post(`${api}/user/register`, {
        username: form.username,
        email: form.email,
        password: form.password,
      });
  
      if (response.status === 200 || response.status === 201) {
        setSuccess("Account created successfully!");
        setForm({ username: "", email: "", password: "" });
  
        setTimeout(() => {
          navigate("/signin");
        }, 1500);
      } else {
        setError(response.data?.message || "Signup failed! Please try again.");
      }
  
    } catch (err) {
      console.error("Error in Signup:", err.response || err.message);
      setError(err.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title"><em>Create Your Account</em></h2>
        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <form onSubmit={handleSubmit} className="signup-form">
          <label>
            Username
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              placeholder="Enter username"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Enter email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Minimum 8 characters"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?{" "}
          <button
            className="link-button"
            onClick={() => navigate("/signin")}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
