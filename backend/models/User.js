const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // allows null/undefined without duplicate key error for older records
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: { type: String },
    middleName: { type: String },
    lastName: { type: String },
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

    phone: { type: String },
    alternatePhone: { type: String },
    myClaimEmail: { type: String },
    is_active: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['admin', 'team', 'super_admin', 'claim_admin', 'service_admin', 'store_admin', 'employee', 'super_partner', 'partner', 'client'],
      default: 'team',
    },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    client_id_ref: { type: String, index: true },
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
    address: {
      country: { type: String },
      state: { type: String },
      city: { type: String },
      pincode: { type: String },
      permanentAddress: { type: String },
      temporaryAddress: { type: String },
    },
    otherDocsDesc: { type: String },
    relation: { type: String },
    relationWithHolder: { type: String },
    reference: { type: String },
    referenceName: { type: String },
    referenceMobileNo: { type: String },
    referredById: { type: String },
    
    // Partner specific
    profession: { type: String },
    entity: { type: String },
    superPartner: { type: String },
    category: { type: String },
    companyName: { type: String },
    partnerAgreementFile: { type: String },
    deadline: { type: String },
    dateOfCommencement: { type: String },
    notes: { type: String },
    
    // Nominee Details (Section 7)
    nomineeAge: { type: String },
    nomineeName: { type: String },
    nomineeId: { type: String }, // optional, for consistency
    nomineeDob: { type: String },
    nomineeRelation: { type: String },
    nomineeAadharPath: { type: String },
    nomineePanPath: { type: String },
    nomineeNocPath: { type: String },
    nomineeOtherDocsPath: { type: String },

    // Preference & Status (Section 8)
    preference: { type: String },
    permissions: { type: [String], default: [] },
    status: { type: String, default: 'new' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);

