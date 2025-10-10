require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const booksRouter = require('./routes/books');
const app = express();

// ✅ Allow only your deployed frontend domain (use the final Netlify domain, not preview)
app.use(
  cors({
    origin: [
      'https://venerable-florentine-63962b.netlify.app', // ✅ main production domain
      'https://68e93503cbf69b87349f970f--venerable-florentine-63962b.netlify.app', // ✅ optional preview domain
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Serve uploaded book cover images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
app.use('/api/books', booksRouter);

// ❌ Don't serve frontend — handled by Netlify
app.get('/', (req, res) => {
  res.send('📚 Book Recommendation API is running successfully!');
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('❌ MONGO_URI not found in environment variables');

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
