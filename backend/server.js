const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employee-data')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/manager', require('./routes/manager'));
app.use('/api/users', require('./routes/users'));

app.use('/api/teammembers', require('./routes/teammembers'));
app.use('/api/tasks', require('./routes/tasks'));

// Add after your existing routes:
app.use('/api/admin', require('./routes/admin'));

// Seed departments on startup (optional - run once)
//app.post('/api/admin/seed-departments', require('./routes/admin').seedDepartments);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server working!' });
});



// app.get('/api/manager/test', auth, (req, res) => {
//   res.json({ message: 'Manager access OK', user: req.user });
// });



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
