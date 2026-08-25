const mongoose = require('mongoose');

const leadSchema = mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  serviceInterest: { type: String, required: true },
  sourceUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Personal Info
  dob: { type: String },
  gender: { type: String },
  maritalStatus: { type: String },
  oldName: { type: String },
  newName: { type: String },
  citizenship: { type: String },

  // Contact Info
  state: { type: String },
  city: { type: String },
  pincode: { type: String },
  permanentAddress: { type: String },
  stateOld: { type: String },
  cityOld: { type: String },
  pincodeOld: { type: String },
  oldAddress: { type: String },

  otherDocsDesc: { type: String },
  relation: { type: String },
  relationWithHolder: { type: String },
  reference: { type: String },
  referenceName: { type: String },
  referenceMobileNo: { type: String },

  // Nominee Details (Section 7)
  nomineeAge: { type: String },
  nomineeName: { type: String },
  nomineeDob: { type: String },
  nomineeRelation: { type: String },
  nomineeAadharPath: { type: String },
  nomineePanPath: { type: String },
  nomineeNocPath: { type: String },
  nomineeOtherDocsPath: { type: String },

  // Preference & Status (Section 8)
  preference: { type: String },


  notes: { type: String },
  status: { 
    type: String, 
    enum: ['new', 'in_discussion', 'not_interested', 'converted'],
    default: 'new' 
  },
  convertedClientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);
