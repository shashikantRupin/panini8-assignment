import React, { useState } from "react";
import axios from "axios";
import { api } from "../constants/api";
import "../styles/Blogs.css";

const Blogs = () => {
  const isLoggedIn = sessionStorage.getItem("token");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.tags) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");

      const response = await axios.post(`${api}/blog/createBlog`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(response.data.message);
      setFormData({ title: "", content: "", tags: "" });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="create-blog-container">
      <h2 className="text-2xl font-semibold mb-4"><em>Create a New Blog Post</em></h2>

      {isLoggedIn ? (
        <form className="blog-form" onSubmit={handleSubmit}>
          {message && <p className="success-msg">{message}</p>}
          {error && <p className="error-msg">{error}</p>}
          <label>Title</label>
          <input
            type="text"
            name="title"
            placeholder="Enter title"
            value={formData.title}
            onChange={handleChange}
          />

          <label>Content</label>
          <textarea
            name="content"
            rows="6"
            placeholder="Write your blog content..."
            value={formData.content}
            onChange={handleChange}
          ></textarea>

          <label>Tag</label>
          <select name="tags" value={formData.tags} onChange={handleChange}>
            <option value="">Select Tag</option>
            <option value="food">Food</option>
            <option value="health">Health</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="technology">Technology</option>
            <option value="travel">Travel</option>
            <option value="others">Others</option>
          </select>

          <button type="submit">Create Blog</button>
        </form>
      ) : (
        <div className="text-center text-red-600 text-lg mt-8">
          Please log in to create a blog post.
        </div>
      )}
    </div>
  );
};

export default Blogs;
