const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ----------------------
// Multer Configuration
// ----------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  }
});
const upload = multer({ storage: storage });

// ----------------------
// CREATE Book (with optional cover upload)
// ----------------------
router.post('/', upload.single('cover'), async (req, res) => {
  try {
    const { title, author, genre, rating, summary } = req.body;
    const cover = req.file ? `/uploads/${req.file.filename}` : null;

    const book = new Book({ title, author, genre, rating, summary, cover });
    const saved = await book.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ----------------------
// READ All Books
// ----------------------
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// READ One Book
// ----------------------
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------
// UPDATE Book (with optional cover upload)
// ----------------------
router.put('/:id', upload.single('cover'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.cover = `/uploads/${req.file.filename}`;
    }

    const updated = await Book.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ----------------------
// DELETE Book
// ----------------------
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });

    // Remove cover file if exists
    if (deleted.cover) {
      const filePath = `.${deleted.cover}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
