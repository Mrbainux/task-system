const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const User = require('../models/User');

function redirectIfAuth(req, res, next){
  if(req.session.userId) return res.redirect('/tasks/dashboard');
  next();
}

// REGISTER
router.get('/register', redirectIfAuth, (req, res) => res.render('register'));
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    req.session.userId = user._id;
    res.redirect('/tasks/dashboard');
  } catch (err) {
    console.error(err);
    res.send('Erreur lors de l’inscription. Nom d’utilisateur peut-être déjà utilisé.');
  }
});

// LOGIN
router.get('/login', redirectIfAuth, (req, res) => res.render('login'));
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if(!user) return res.send('Utilisateur non trouvé');

  const match = await bcrypt.compare(password, user.password);
  if(!match) return res.send('Mot de passe incorrect');

  req.session.userId = user._id;
  res.redirect('/tasks/dashboard');
});

// LOGOUT
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
