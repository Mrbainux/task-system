const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: [
      'Ménage & entretien',
      'Cours & soutien scolaire',
      'Livraison & courses',
      'Bricolage & réparation',
      'Beauté & bien-être',
      'Événementiel',
      'Informatique & web',
      'Autres services'
    ],
    default: 'Autres services'
  },
  city: { type: String, required: true },
  phone: { type: String, required: true },
  price: { type: Number },
  home_service: { type: String },
  contact_method: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Task', TaskSchema);
