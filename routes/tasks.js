const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Dashboard - afficher les tâches de l'utilisateur
router.get('/dashboard', async (req, res) => {
  const tasks = await Task.find({ user: req.session.userId }).sort({ createdAt: -1 });
  res.render('dashboard', { tasks });
});

// Ajouter une tâche
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const taskData = { ...req.body, user: req.session.userId };
    if(req.file) taskData.image = req.file.filename;
    const task = new Task(taskData);
    await task.save();
    res.redirect('/tasks/dashboard');
  } catch(err) {
    console.error(err);
    res.send('Erreur lors de la création de la tâche');
  }
});

// Modifier une tâche
router.post('/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if(!task) return res.send('Tâche introuvable');

    Object.assign(task, req.body);

    if(req.file){
      // Supprimer ancienne image
      if(task.image){
        const oldPath = path.join(__dirname, '..', 'public', 'uploads', task.image);
        if(fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      task.image = req.file.filename;
    }

    await task.save();
    res.redirect('/tasks/dashboard');
  } catch(err){
    console.error(err);
    res.send('Erreur lors de la modification de la tâche');
  }
});

// Supprimer une tâche
router.post('/delete/:id', async (req, res) => {
  try{
    const task = await Task.findById(req.params.id);
    if(!task) return res.send('Tâche introuvable');

    // Supprimer image si existante
    if(task.image){
      const imgPath = path.join(__dirname, '..', 'public', 'uploads', task.image);
      if(fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Task.deleteOne({ _id: req.params.id });
    res.redirect('/tasks/dashboard');
  } catch(err){
    console.error(err);
    res.send('Erreur lors de la suppression de la tâche');
  }
});

module.exports = router;
