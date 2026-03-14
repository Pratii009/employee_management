const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.log('❌ MongoDB Connection Error:', err));

// Basic Route Test
app.get('/', (req, res) => {
  res.json({ message: 'Brahmaputra Performance System Backend ✅' });
});

const PORT = process.env.PORT || 5000;

app.use('/api/auth', require('./routes/auth'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Auth APIs working!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
