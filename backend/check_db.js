const mongoose = require('mongoose');
const DepartmentService = require('./models/DepartmentService');
require('dotenv').config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/my_claim";

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to DB");
    const count = await DepartmentService.countDocuments();
    console.log("Total Services Count:", count);
    const services = await DepartmentService.find().lean();
    console.log("Services list:", services.map(s => ({ name: s.name, type: s.type, status: s.status })));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
