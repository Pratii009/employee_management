const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register - FIXED
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, unit } = req.body;
    
    // Hash password BEFORE creating user
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,  // Use hashed version
      role, 
      unit 
    });
    
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !await user.matchPassword(password)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
