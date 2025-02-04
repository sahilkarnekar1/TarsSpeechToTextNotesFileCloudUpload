const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const Note = require("../models/Note");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Configure Cloudinary
cloudinary.config({
  cloud_name: "dmukjdg4r",
  api_key: "996883297646237",
  api_secret: "uD8O12N4K2Fl3ybAdv62qFFb5d4",
});

// 🔹 Set up Multer with Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "notes-audio", // Cloudinary folder name
    resource_type: "auto", // Ensures it handles audio files
    format: async (req, file) => "webm", // Convert to webm format
    public_id: (req, file) => `audio-${Date.now()}`,
  },
});

const upload = multer({ storage });

// 📝 Add a new note with audio file uploaded to Cloudinary
router.post("/add", authMiddleware, upload.single("audio"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const audioUrl = req.file ? req.file.path : null; // Cloudinary URL

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const newNote = new Note({
      user: req.user.id,
      title,
      content,
      audioPath: audioUrl, // Store Cloudinary URL instead of local path
    });

    await newNote.save();
    res.status(201).json({ message: "Note added successfully", note: newNote });
  } catch (error) {
    res.status(500).json({ message: "Error adding note", error });
  }
});

// 📌 Get all notes for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes", error });
  }
});

// ✏️ Update a note
router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.user.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    note.title = title || note.title;
    note.content = content || note.content;
    await note.save();

    res.json({ message: "Note updated successfully", note });
  } catch (error) {
    res.status(500).json({ message: "Error updating note", error });
  }
});

// ❌ Delete a note
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.user.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    await note.deleteOne();
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note", error });
  }
});

// 🎵 Serve audio files statically
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = router;
