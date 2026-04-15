// const express = require('express');

// const router = express.Router();  // ✅ MISSING THIS LINE
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const auth = require('../middleware/auth');
// const User = require('../models/User');

// // @route   POST api/auth/register
// // @desc    Register user
// router.post('/register', async (req, res) => {
//   const { name, email, password, role, department, phone } = req.body;

//   try {
//     let user = await User.findOne({ email });
//     if (user) return res.status(400).json({ msg: 'User already exists' });

//     user = new User({
//       name, email, password, role, department, phone
//     });

//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(password, salt);
//     await user.save();

//     const payload = { id: user.id, role: user.role };
//     jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
//       if (err) throw err;
//       res.json({ token, user: { id: user._id, name, email, role } });
//     });
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // @route   POST api/auth/login
// // @desc    Login user / Return JWT
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

//     const payload = { id: user.id, role: user.role };
//     jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
//       if (err) throw err;
//       res.json({
//         token,
//         user: { id: user._id, name: user.name, email, role: user.role }
//       });
//     });
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // @route   GET api/auth/me
// // @desc    Get logged in user
// router.get('/me', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// module.exports = router;  // ✅ Export router
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


