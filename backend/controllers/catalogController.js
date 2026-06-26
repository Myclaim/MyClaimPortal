const ServiceCatalog = require('../models/ServiceCatalog');

const getCatalog = async (req, res) => {
  try {
    const catalog = await ServiceCatalog.find();
    res.json(catalog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCatalogItem = async (req, res) => {
  try {
    const item = await ServiceCatalog.create(req.body);
    const Activity = require('../models/Activity');
    await Activity.create({
      action: `Catalog item created: ${item.bundleName || item.mainCategory} (${item.vertical})`,
      user: req.user._id,
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getCatalog, createCatalogItem };
