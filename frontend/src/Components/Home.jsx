import React, { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../constants/api";
import "../styles/Home.css";
import { toast } from "react-toastify";

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [selectedTag, setSelectedTag] = useState("all");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editContent, setEditContent] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentingId, setCommentingId] = useState(null);
  const [expandedBlog, setExpandedBlog] = useState(null);

  const isLoggedIn = !!sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");

  const getLatestBlog = () => {
    axios
      .get(`${api}/blog/getLatestBlog`)
      .then((response) => {
        setBlogs(response.data);
        setFilteredBlogs(
          selectedTag === "all"
            ? response.data
            : response.data.filter((blog) => blog.tags === selectedTag)
        );
      })
      .catch((error) => console.error("Error fetching blogs:", error));
  };

  useEffect(() => {
    getLatestBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log(blogs);

  const filterByTag = (tag) => {
    setSelectedTag(tag);
    if (tag === "all") {
      setFilteredBlogs(blogs);
    } else {
      setFilteredBlogs(blogs.filter((blog) => blog.tags === tag));
    }
  };

  const handleLike = (id) => {
    const token = sessionStorage.getItem("token");

    axios
      .put(`${api}/blog/like/${id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success(res.data.message || "Liked successfully ✅");

        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog._id === id ? { ...blog, likes: [...blog.likes, userId] } : blog
          )
        );
        getLatestBlog();
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.message || "Something went wrong";
        toast.info(errorMsg);
      });
  };

  const handleDelete = (id) => {
    axios
      .delete(`${api}/blog/deleteBlog/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== id));
        setFilteredBlogs((prevBlogs) =>
          prevBlogs.filter((blog) => blog._id !== id)
        );
        toast.success(res.data.message || "Blog deleted successfully");
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.message || "Something went wrong";
        toast.error(errorMsg);
      });
  };

  const handleUpdate = (id) => {
    const updatedData = {
      title: editTitle,
      content: editContent,
      tags: editTags,
    };

    axios
      .patch(`${api}/blog/updateBlog/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog._id === id ? { ...blog, ...updatedData } : blog
          )
        );
        setFilteredBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog._id === id ? { ...blog, ...updatedData } : blog
          )
        );
        setEditId(null); // close the form
        toast.success(res.data.message || "Blog updated successfully");
      })
      .catch((error) => {
        console.error("Error updating post:", error);
        const errorMsg =
          error.response?.data?.message || "Something went wrong";
        toast.error(errorMsg);
      });
  };

  const handleAddComment = async (blogId) => {
    if (!commentText.trim()) return;

    try {
      const response = await fetch(`${api}/blog/comment/${blogId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ comment: commentText }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Comment added successfully");
        setCommentText("");
        setCommentingId(null);
        getLatestBlog(); // refresh the latest blog data
      } else {
        toast.error(data.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Something went wrong while adding comment");
    }
  };

  return (
    <div className="home-container">
      <div className="header">
        <h1>
          <em>✨ Inspire the World, One Post at a Time</em>
        </h1>
        <p>
          Got ideas, stories, or insights? Share your voice and connect with a
          global audience. Your words have the power to spark change.
        </p>
      </div>
      <div className="filter-buttons">
        {[
          "all",
          "technology",
          "health",
          "lifestyle",
          "travel",
          "food",
          "others",
        ].map((tag) => (
          <button
            key={tag}
            onClick={() => filterByTag(tag)}
            className={selectedTag === tag ? "active" : ""}
          >
            {tag.charAt(0).toUpperCase() + tag.slice(1)}
          </button>
        ))}
      </div>

      <div className="blog-list">
        {filteredBlogs.map((blog) => (
          <div key={blog._id} className="blog-card">
            <div className="card-header">
              <div className="avatar">{blog.title[0].toUpperCase()}</div>
              <div className="title-info">
                <h2>{blog.title}</h2>
                <span className="tag">#{blog.tags}</span>
              </div>

              {isLoggedIn && (
                <div className="actions">
                  <button
                    onClick={() => {
                      setEditId(blog._id);
                      setEditTitle(blog.title);
                      setEditContent(blog.content);
                      setEditTags(blog.tags);
                    }}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this blog?"
                        )
                      ) {
                        handleDelete(blog._id);
                      }
                    }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>

            <div className="card-content">
              <p>
                {expandedBlog === blog._id
                  ? blog.content
                  : blog.content.slice(0, 300) + "..."}
                {blog.content.length > 300 && expandedBlog !== blog._id && (
                  <button
                    onClick={() => setExpandedBlog(blog._id)}
                    className="read-more-btn"
                  >
                    Read More
                  </button>
                )}
                {/* Show Show Less button if content is expanded */}
                {expandedBlog === blog._id && (
                  <button
                    onClick={() => setExpandedBlog(null)}
                    className="read-more-btn"
                  >
                    Show Less
                  </button>
                )}
              </p>

              {editId === blog._id && (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Edit title"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Edit content"
                  />
                  <select
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                  >
                    <option value="">Select Tag</option>
                    <option value="food">Food</option>
                    <option value="health">Health</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="technology">Technology</option>
                    <option value="travel">Travel</option>
                    <option value="others">Others</option>
                  </select>
                  <button onClick={() => handleUpdate(blog._id)}>Save</button>
                  <button onClick={() => setEditId(null)}>Cancel</button>
                </div>
              )}
            </div>

            <div className="card-footer">
              <button onClick={() => handleLike(blog._id)}>
                👍 {blog.likes.length} Likes
              </button>
              <span
                style={{ cursor: "pointer", marginLeft: "1rem" }}
                onClick={() => {
                  const token = sessionStorage.getItem("token");
                  if (!token) {
                    toast.info("Please log in to comment.");
                  } else {
                    setCommentingId(
                      commentingId === blog._id ? null : blog._id
                    );
                  }
                }}
              >
                💬 {blog.comments.length} Comments
              </span>
            </div>

            {isLoggedIn && commentingId === blog._id && (
              <div className="comment-box">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="comment-actions">
                  <button onClick={() => handleAddComment(blog._id)}>
                    Post
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setCommentingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
