require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const booksRouter = require('./routes/books');
const app = express();

// ✅ Allow only your frontend domain
app.use(
  cors({
    origin: ['https://book-recommendation-frontend-qb1b.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Serve uploaded book cover images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
app.use('/api/books', booksRouter);

// ❌ Do NOT serve frontend since it's on Vercel

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI not set in .env');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('❌ Failed to start server', err);
    process.exit(1);
  }
}

start();
