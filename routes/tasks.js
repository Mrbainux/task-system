const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const multer = require('multer');

function auth(req, res, next){
  if(!req.session.userId) return res.redirect('/login');
  next();
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, Date.now() + '.' + ext); // timestamp + extension
  }
});
const upload = multer({ storage });

router.get('/dashboard', auth, async (req, res) => {
  const tasks = await Task.find({ user: req.session.userId }).sort({ createdAt: -1 });
  res.render('dashboard', { tasks });
});

router.post('/add', auth, upload.single('image'), async (req, res) => {
  console.log('req.file =', req.file); // <--- ça doit afficher le fichier
  console.log('req.body =', req.body);

  const image = req.file ? req.file.filename : null;
  console.log('image filename =', image);

  const task = new Task({
    user: req.session.userId,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    city: req.body.city,
    phone: req.body.phone,
    price: req.body.price,
    home_service: req.body.home_service,
    contact_method: req.body.contact_method,
    image // <--- ça doit être rempli ici
  });

  await task.save();
  res.redirect('/tasks/dashboard');
});

// Page d'édition
router.get('/edit/:id', auth, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.session.userId });
  if (!task) return res.redirect('/tasks/dashboard');
  res.render('edit-task', { task });
});
router.post('/edit/:id', auth, upload.single('image'), async (req, res) => {
  let updateData = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    city: req.body.city,
    phone: req.body.phone,
    price: req.body.price,
    home_service: req.body.home_service,
    contact_method: req.body.contact_method,
  };

// ✅ Route GET pour afficher le formulaire de modification
router.get('/tasks/edit/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.redirect('/tasks/dashboard');
    }
    res.render('edit-task', { task });
  } catch (err) {
    console.error(err);
    res.redirect('/tasks/dashboard');
  }
});
  // Si une nouvelle image est uploadée
  if (req.file) {
    updateData.image = req.file.filename;
  }

  await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.session.userId },
    updateData
  );

  res.redirect('/tasks/dashboard');
});



router.post('/delete/:id', auth, async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, user: req.session.userId });
  res.redirect('/tasks/dashboard');
});

module.exports = router;
