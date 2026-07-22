const mongoose = require('mongoose');

const clientSchema = mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'client' },
  phone: { type: String },
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
  
  // Documents / KYC
  kyc_data: { 
    pan: String, 
    aadhaar: String,
    panCardFile: String,
    aadharCardFile: String,
    passportFile: String,
    drivingLicenceFile: String,
    nriDocsFile: String,
    otherDocsFile: String,
    rentAgreementVeraBillFile: String
  },
  otherDocsDesc: { type: String },

  // Relationship & Reference
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
  status: { type: String, default: 'new' },

  familyMembers: [{
    name: { type: String, required: true },
    relationWithHolder: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    dob: { type: String },
    aadharNo: { type: String },
    panNo: { type: String }
  }],

  customFolders: [{ type: String }],

  parent_id: { type: mongoose.Schema.Types.ObjectId, index: true },
  client_id_ref: { type: String, unique: true, sparse: true },
  is_active: { type: Boolean, default: true },

  // Referral System
  referralCode: { type: String, unique: true, sparse: true }, // this client's own referral code
  referredBy: { type: String, default: null },               // referral code of the person who referred this client
  referralCount: { type: Number, default: 0 },               // how many people used this client's code
  referCodePromptCount: { type: Number, default: 0 },        // how many times prompt was shown (max 3)
  hasEnteredReferCode: { type: Boolean, default: false }      // true once code entered or 3 dismissals done
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
