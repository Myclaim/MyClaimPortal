const DepartmentService = require('../models/DepartmentService');

const getServices = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const services = await DepartmentService.find(filter);
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createService = async (req, res) => {
  try {
    const service = await DepartmentService.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await DepartmentService.findByIdAndUpdate(id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await DepartmentService.findByIdAndDelete(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const seedServices = async (req, res) => {
  try {
    const { services } = req.body;
    if (services && Array.isArray(services)) {
      // Clear existing of this type to avoid duplicates? Or just insert.
      // Better to just insert to ensure it works.
      const created = await DepartmentService.insertMany(services);
      return res.status(201).json(created);
    }
    res.status(400).json({ message: 'No services provided' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getServices, createService, updateService, deleteService, seedServices };
