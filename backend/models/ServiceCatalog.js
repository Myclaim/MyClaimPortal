const mongoose = require('mongoose');

const serviceCatalogSchema = mongoose.Schema({
  vertical: { type: String, enum: ['claim', 'service', 'store'], required: true },
  mainCategory: { type: String, required: true },
  subCategory: { type: String, required: true },
  bundleName: { type: String, required: true },
  price: { type: Number },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('ServiceCatalog', serviceCatalogSchema);
