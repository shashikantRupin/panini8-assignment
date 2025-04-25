const express = require('express');
const userRouter = express.Router();
const User = require('../model/userModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');
require('dotenv').config()


userRouter.post('/register', async(req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        if(password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

userRouter.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({username: user.username,userId: user._id, token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get all users by ID
userRouter.get('/getUsers', async(req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get user by ID
userRouter.get('/getUser/:id',authMiddleware, async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Updae user profile by ID
userRouter.put('/updateUser/:id',authMiddleware,async(req, res) => {
    try {
        const { username, email } = req.body;
        const id = req.params.id;
        const userId = req.user.userId;
        if (id !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this user' });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { username, email }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = userRouter;