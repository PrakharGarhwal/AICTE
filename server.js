const express = require('express');
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}
const mongoose = require('mongoose');
const multer = require('multer'); // Handles file uploads
const path = require('path');
const cors = require('cors'); // Required for deployment
require('dotenv').config();
const app = express();

// Configure how files are saved
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'), // Save in 'uploads' folder
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/aicte_portal');

const Curriculum = mongoose.model('Curriculum', {
    branch: String,
    code: String,
    revision: String,
    status: { type: String, default: 'Draft' },
    filePath: String // New field to store the syllabus link
});

app.use(express.json());
app.use(cors()); // Allow your frontend to talk to this backend

app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads')); // Makes the files downloadable

// --- UPDATED ROUTES ---

app.get('/api/curriculum', async (req, res) => {
    res.json(await Curriculum.find());
});

// Use upload.single('syllabusFile') to catch the file from your admin.js
app.post('/api/curriculum', upload.single('syllabusFile'), async (req, res) => {
    try {
        const entry = new Curriculum({
            branch: req.body.branch,
            code: req.body.code,
            revision: req.body.revision,
            status: req.body.status,
            filePath: req.file ? `/uploads/${req.file.filename}` : '#' 
        });
        await entry.save();
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: "Failed to save course" });
    }
});

app.delete('/api/curriculum/:id', async (req, res) => {
    await Curriculum.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000; 

app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
