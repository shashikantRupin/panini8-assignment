const mongoose = require("mongoose");
const express = require("express");
const Blog = require("../model/blogModels");
const authMiddleware = require("../middlewares/auth");
const blogRouter = express.Router();

// Create a new blog post
blogRouter.post("/createBlog", authMiddleware, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const blog = new Blog({
      title,
      content,
      tags,
      createdBy: req.user.userId,
    });
    await blog.save();
    res.status(201).json({ message: "Blog post created successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all blog posts
blogRouter.get("/getBlog", authMiddleware, async (req, res) => {
  try {
    const blogs = await Blog.find({}).populate("createdBy", "username email");
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
//Get all blog latest posts
blogRouter.get("/getLatestBlog", async (req, res) => {
  try {
    const blogs = await Blog.find({})
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all blog posts created by a specific user
blogRouter.get("/getBlogByUser", authMiddleware, async (req, res) => {
  try {
    const blogs = await Blog.find({ createdBy: req.user.userId }).populate(
      "createdBy",
      "username email"
    );
    if (!blogs.length) {
      return res
        .status(404)
        .json({ message: "No blog posts found for this user" });
    }
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a single blog post by ID
blogRouter.get("/getBlog/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "createdBy",
      "username email"
    );
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a blog post by tag
blogRouter.get("/getBlogByTag/:tag", authMiddleware, async (req, res) => {
  try {
    const blogs = await Blog.find({ tags: req.params.tag }).populate(
      "createdBy",
      "username email"
    );
    if (!blogs.length) {
      return res
        .status(404)
        .json({ message: "No blog posts found for this tag" });
    }
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a blog post by ID
blogRouter.patch("/updateBlog/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const blogId = req.params.id;
    const userId = req.user.userId;

    // Step 1: Find the blog
    const blog = await Blog.findById(blogId);

    // Step 2: Check if the blog exists
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    // Step 3: Check ownership
    if (blog.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this blog" });
    }

    // Step 4: Perform update
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.tags = tags || blog.tags;

    await blog.save();

    res.status(200).json({ message: "Blog post updated successfully", blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a blog post by ID
blogRouter.delete("/deleteBlog/:id", authMiddleware, async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.userId;

    // Step 1: Find the blog
    const blog = await Blog.findById(blogId);

    // Step 2: Check if the blog exists
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    // Step 3: Check ownership
    if (blog.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this blog" });
    }
    // Step 4: Perform delete
    await Blog.findByIdAndDelete(blogId);
    res.status(200).json({ message: "Blog post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Like a blog post by ID
blogRouter.put("/like/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // Check if user already liked
    const userId = req.user.userId;
    const alreadyLiked = blog.likes.includes(userId);

    if (alreadyLiked) {
      return res.status(400).json({ message: "You already liked this post" });
    }

    blog.likes.push(userId);
    await blog.save();

    res.status(200).json({ message: "Post liked successfully", blog });
  } catch (error) {
    console.error("Error liking blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//add comment to blog post by ID
blogRouter.put("/comment/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // Check if the comment is provided
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    // Add the comment to the blog post
    const newComment = {
      commentedBy: req.user.userId,
      comment: comment,
    };

    blog.comments.push(newComment);

    // Save the updated blog post with the new comment
    await blog.save();

    res.status(200).json({ message: "Comment added successfully", blog });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = blogRouter;