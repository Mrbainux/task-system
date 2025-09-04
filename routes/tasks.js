// routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Middleware auth
function auth(req, res, next){
  if(!req.session.userId) return res.redirect('/login');
  next();
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, Date.now() + '.' + ext);
  }
});
const upload = multer({ storage });

// Dashboard
router.get('/dashboard', auth, async (req, res) => {
  const tasks = await Task.find({ user: req.session.userId }).sort({ createdAt: -1 });
  res.render('dashboard', { tasks });
});

// Ajouter une tâche
router.post('/add', auth, upload.single('image'), async (req, res) => {
  const image = req.file ? req.file.filename : null;
  const task = new Task({
    user: req.session.userId,
    ...req.body,
    image
  });
  await task.save();
  res.redirect('/tasks/dashboard');
});

// Éditer tâche (GET)
router.get('/edit/:id', auth, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.session.userId });
  if (!task) return res.redirect('/tasks/dashboard');
  res.render('edit-task', { task });
});

// Éditer tâche (POST)
router.post('/edit/:id', auth, upload.single('image'), async (req, res) => {
  const updateData = { ...req.body };
  if(req.file) updateData.image = req.file.filename;
  await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.session.userId },
    updateData
  );
  res.redirect('/tasks/dashboard');
});

// Supprimer tâche + image
router.post('/delete/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.session.userId });
    if (!task) return res.redirect('/tasks/dashboard');

    // Supprimer l'image si elle existe
    if (task.image) {
      const imagePath = path.join(__dirname, '..', 'public', 'uploads', task.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Image supprimée:', imagePath);
      }
    }

    await Task.deleteOne({ _id: req.params.id, user: req.session.userId });
    res.redirect('/tasks/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/tasks/dashboard');
  }
});

// Rechercher tâches
router.get('/search', async (req, res) => {
  const { category, city } = req.query;
  let filter = {};
  if(category) filter.category = category;
  if(city) filter.city = new RegExp(city, 'i');
  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.render('index', { tasks });
});

module.exports = router;
