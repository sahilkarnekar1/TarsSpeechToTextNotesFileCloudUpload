const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    audioPath: { type: String }, // Store audio file path
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

module.exports = mongoose.model("Note", NoteSchema);
