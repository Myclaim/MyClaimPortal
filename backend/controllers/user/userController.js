const User = require('../../models/User');
const Admin = require('../../models/admin/Admin');
const Partner = require('../../models/partner/Partner');
const Client = require('../../models/client/Client');
const Employee = require('../../models/employee/Employee');
const Activity = require('../../models/Activity');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../../utils/emailService');

/** Omit password hash from Mongoose documents returned to the client */
function userToPublicJSON(doc) {
  if (!doc) return null;
  const o = typeof doc.toObject === 'function' ? doc.toObject({ versionKey: false }) : { ...doc };
  if (o.password) delete o.password;
  return o;
}

// ─────────────────────────────────────────────
// SERVER-SIDE IN-MEMORY CACHE
// Keyed by role (admins share one cache entry)
// Near-zero latency for all reads after first fetch
// ─────────────────────────────────────────────
const _cache = new Map();
const CACHE_FIELDS = 'name username email phone companyName representative profession entity category department skills designation specialization is_active role createdAt client_id_ref firstName lastName address.city city parent_id';

const _fetchAndCache = async (cacheKey, role, userId) => {
  let admins = [], partners = [], clients = [], employees = [], others = [];

  if (role === 'admin' || role === 'super_admin') {
    [admins, partners, clients, employees, others] = await Promise.all([
      Admin.find({}, CACHE_FIELDS).sort({ createdAt: -1 }).lean(),
      Partner.find({}, CACHE_FIELDS).sort({ createdAt: -1 }).lean(),
      Client.find({}, CACHE_FIELDS).sort({ createdAt: -1 }).lean(),
      Employee.find({}, CACHE_FIELDS).sort({ createdAt: -1 }).lean(),
      User.find({}, CACHE_FIELDS).sort({ createdAt: -1 }).lean(),
    ]);
  } else if (role === 'super_partner') {
    const subs = await Partner.find({ parent_id: userId }, '_id').lean();
    const ids = [userId, ...subs.map(p => p._id)];
    [partners, clients] = await Promise.all([
      Partner.find({ _id: { $in: ids } }, CACHE_FIELDS).lean(),
      Client.find({ parent_id: { $in: ids } }, CACHE_FIELDS).lean(),
    ]);
  } else if (role === 'partner') {
    clients = await Client.find({ parent_id: userId }, CACHE_FIELDS).lean();
  }

  const allRaw = [...admins, ...partners, ...clients, ...employees, ...others];

  // Single aggregation for all client counts
  const counts = await Client.aggregate([{ $group: { _id: '$parent_id', count: { $sum: 1 } } }]);
  const countMap = {};
  for (const c of counts) { if (c._id) countMap[c._id.toString()] = c.count; }

  const result = allRaw.map(u => ({ ...u, clientCount: countMap[u._id.toString()] || 0 }));
  _cache.set(cacheKey, { data: result, cachedAt: Date.now() });
  return result;
};

// Bust cache for all admin entries on any mutation
const bustCache = () => {
  for (const key of _cache.keys()) {
    if (key.startsWith('admin_') || key.startsWith('super_admin_')) {
      _cache.delete(key);
    } else {
      _cache.delete(key); // bust all
    }
  }
};

// Pre-warm admin cache in background every 2 minutes
// so the first request is also fast
const _warmAdminCache = async () => {
  try {
    await _fetchAndCache('admin_global', 'admin', null);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Cache] Admin user list refreshed');
    }
  } catch (e) { /* silent fail */ }
};

// Start background refresh after 5s (let server boot first)
setTimeout(() => {
  _warmAdminCache();
  setInterval(_warmAdminCache, 2 * 60 * 1000); // refresh every 2 minutes
}, 5000);

// ─────────────────────────────────────────────
// @desc    Get all users (served from cache)
// @route   GET /api/users
// @access  Private/Admin
// ─────────────────────────────────────────────
const getUsers = async (req, res) => {
  const { _id, role } = req.user;
  try {
    // ── RBAC: clients can only query their own family members (parent_id matches their _id) ──
    if (role === 'client') {
      const parentIdQuery = req.query.parent_id;
      if (parentIdQuery && parentIdQuery.toString() === _id.toString()) {
        const [clients, users] = await Promise.all([
          Client.find({ parent_id: _id }, CACHE_FIELDS).lean(),
          User.find({ parent_id: _id }, CACHE_FIELDS).lean()
        ]);
        return res.json([...clients, ...users]);
      }
      return res.status(403).json({ message: 'Not authorized to query other users' });
    }

    // ── RBAC: plain admin only sees employees (their own department's) or clients ──────
    if (role === 'admin') {
      if (req.query.role === 'client') {
        const clients = await Client.find({}, CACHE_FIELDS).sort({ createdAt: -1 }).lean();
        return res.json(clients);
      }
      const dept = (req.user.department || '').toLowerCase();
      const query = dept ? { department: { $regex: new RegExp(`^${dept}$`, 'i') } } : {};
      const employees = await Employee.find(query, CACHE_FIELDS).sort({ createdAt: -1 }).lean();
      return res.json(employees);
    }

    // super_admin, super_partner, partner use the cache as before
    const cacheKey = role === 'super_admin'
      ? 'admin_global'
      : `${role}_${_id}`;

    const cached = _cache.get(cacheKey);
    if (cached) {
      return res.json(cached.data);
    }

    const data = await _fetchAndCache(cacheKey, role, _id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  const { name, username, email, phone, password, role, parent_id, client_id_ref } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email and password' });
  }

  const normalizedEmail = email.toLowerCase();

  // Prevent Super Partners from escalating privileges
  if (req.user.role === 'super_partner' && !['partner', 'client'].includes(role)) {
    return res.status(403).json({ message: 'Not authorized to create admin-level users.' });
  }

  // Check email or username uniqueness across all collections
  const orConditions = [{ email: normalizedEmail }];
  if (username) orConditions.push({ username });
  if (client_id_ref) orConditions.push({ client_id_ref });

  const checks = await Promise.all([
    Admin.findOne({ $or: orConditions }),
    Partner.findOne({ $or: orConditions }),
    Client.findOne({ $or: orConditions }),
    Employee.findOne({ $or: orConditions }),
    User.findOne({ $or: orConditions })
  ]);
  
  const identifierExists = checks.find(u => u !== null);

  if (identifierExists) {
    return res.status(400).json({ message: 'A user with this email, username, or ID already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let newUser;
  const payload = {
    name,
    username: username || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    phone,
    alternatePhone: req.body.alternatePhone,
    myClaimEmail: req.body.myClaimEmail,
    password: hashedPassword,
    role: role || 'team',
    parent_id,
    client_id_ref,
    address: req.body.address,
    // Add all possible client fields
    firstName: req.body.firstName,
    middleName: req.body.middleName,
    lastName: req.body.lastName,
    dob: req.body.dob,
    gender: req.body.gender,
    maritalStatus: req.body.maritalStatus,
    oldName: req.body.oldName,
    newName: req.body.newName,
    citizenship: req.body.citizenship,
    state: req.body.state,
    city: req.body.city,
    pincode: req.body.pincode,
    permanentAddress: req.body.permanentAddress,
    stateOld: req.body.stateOld,
    cityOld: req.body.cityOld,
    pincodeOld: req.body.pincodeOld,
    oldAddress: req.body.oldAddress,
    kyc_data: req.body.kyc_data,
    otherDocsDesc: req.body.otherDocsDesc,
    relation: req.body.relation,
    relationWithHolder: req.body.relationWithHolder,
    reference: req.body.reference,
    referenceName: req.body.referenceName,
    referenceMobileNo: req.body.referenceMobileNo,
    referredById: req.body.referredById,
    
    // Partner specific
    profession: req.body.profession || req.body.currentProfession,
    representative: req.body.representative,
    entity: req.body.entity,
    superPartner: req.body.superPartner,
    category: req.body.category,
    companyName: req.body.companyName,
    partnerAgreementFile: req.body.partnerAgreementFile,
    deadline: req.body.deadline,
    dateOfCommencement: req.body.dateOfCommencement,
    notes: req.body.notes,
    department: req.body.department,
    skills: req.body.skills,
    specialization: req.body.specialization,
    designation: req.body.designation ?? req.body.roles,

    // Nominee
    nomineeAge: req.body.nomineeAge,
    nomineeName: req.body.nomineeName,
    nomineeId: req.body.nomineeId,
    nomineeDob: req.body.nomineeDob,
    nomineeRelation: req.body.nomineeRelation,
    nomineeAadharPath: req.body.nomineeAadharPath,
    nomineePanPath: req.body.nomineePanPath,
    nomineeNocPath: req.body.nomineeNocPath,
    nomineeOtherDocsPath: req.body.nomineeOtherDocsPath,
    preference: req.body.preference,
    status: req.body.status,
  };

  // Save to "different folder" (model) based on role
  if (role === 'admin' || role === 'super_admin') {
    newUser = await Admin.create(payload);
  } else if (role === 'partner' || role === 'super_partner') {
    newUser = await Partner.create(payload);
  } else if (role === 'client') {
    newUser = await Client.create(payload);
  } else if (role === 'employee') {
    newUser = await Employee.create(payload);
  } else {
    newUser = await User.create(payload);
  }

  if (newUser) {
    bustCache(); // Bust server cache so next read reflects new user
    await Activity.create({
      action: `User ${name} (${role || 'team'}) created in ${role} collection`,
      user: req.user._id,
    });
    
    // Send welcome email with temporary password
    // Use the generated username or email from payload, and original plain-text password
    await sendWelcomeEmail(payload.email, payload.username, password);

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
      phone: newUser.phone,
      department: newUser.department,
      skills: newUser.skills,
      designation: newUser.designation,
      specialization: newUser.specialization,
      companyName: newUser.companyName,
      representative: newUser.representative,
      profession: newUser.profession,
      entity: newUser.entity,
      category: newUser.category,
      parent_id: newUser.parent_id,
      client_id_ref: newUser.client_id_ref,
      role: newUser.role,
      is_active: newUser.is_active,
      createdAt: newUser.createdAt,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

const enrolClient = async (req, res) => {
  const { name, email, password, kyc_data, lead_id, parent_id, username, client_id_ref } = req.body;
  const normalizedEmail = email.toLowerCase();
  const generatedUsername = username || normalizedEmail.split('@')[0];

  // Check email, username, or client_id_ref uniqueness across all collections
  const orConditions = [{ email: normalizedEmail }];
  if (username) orConditions.push({ username: generatedUsername });
  if (client_id_ref) orConditions.push({ client_id_ref });

  const checks = await Promise.all([
    Admin.findOne({ $or: orConditions }),
    Partner.findOne({ $or: orConditions }),
    Client.findOne({ $or: orConditions }),
    Employee.findOne({ $or: orConditions }),
    User.findOne({ $or: orConditions })
  ]);
  
  const identifierExists = checks.find(u => u !== null);

  if (identifierExists) {
    return res.status(400).json({ message: 'A user with this email, username, or ID already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const client = await Client.create({
    name,
    email: normalizedEmail,
    username: generatedUsername,
    password: hashedPassword,
    role: 'client',
    parent_id,
    // Add all other fields that might be passed during enrollment
    ...req.body,
    email: normalizedEmail, // Ensure normalized
    password: hashedPassword, // Ensure hashed
    role: 'client' // Ensure role is client
  });

  if (client) {
    if (lead_id) {
      const Lead = require('../../models/Lead');
      await Lead.findByIdAndUpdate(lead_id, { status: 'converted', convertedClientId: client._id });
    }

    await Activity.create({
      action: `Client enrolled in Client collection: ${name}`,
      user: req.user._id,
    });

    bustCache();
    res.status(201).json(userToPublicJSON(client));
  } else {
    res.status(400).json({ message: 'Invalid client data' });
  }
};

const updateUser = async (req, res) => {
  // Simplification: try to find in each
  let user = await Admin.findById(req.params.id);
  if (!user) user = await Partner.findById(req.params.id);
  if (!user) user = await Client.findById(req.params.id);
  if (!user) user = await Employee.findById(req.params.id);
  if (!user) user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: 'User not found' });

  if (req.body.currentProfession !== undefined && req.body.profession === undefined) {
    req.body.profession = req.body.currentProfession;
  }

  const oldDepartment = user.department;

  const fieldsToUpdate = [
    'name', 'email', 'username', 'phone', 'department', 'skills', 'designation', 'specialization', 'role', 'is_active', 'client_id_ref', 'parent_id', 'representative',
    'alternatePhone', 'myClaimEmail', 'address',
    'firstName', 'middleName', 'lastName', 'dob', 'gender', 'maritalStatus', 
    'oldName', 'newName', 'citizenship', 'state', 'city', 'pincode', 
    'permanentAddress', 'stateOld', 'cityOld', 'pincodeOld', 'oldAddress',
    'kyc_data', 'otherDocsDesc', 'relation', 'relationWithHolder', 
    'reference', 'referenceName', 'referenceMobileNo', 'referredById',
    'profession', 'entity', 'superPartner', 'category', 'companyName', 
    'partnerAgreementFile', 'deadline', 'dateOfCommencement', 'notes',
    'nomineeAge', 'nomineeName', 'nomineeId', 'nomineeDob', 'nomineeRelation', 'nomineeAadharPath', 'nomineePanPath', 'nomineeNocPath', 'nomineeOtherDocsPath',
    'preference', 'status'
  ];

  fieldsToUpdate.forEach((field) => {
    if (req.body[field] === undefined) return;
    if (field === 'is_active') {
      user[field] = Boolean(req.body[field]);
    } else if (field === 'parent_id') {
      const v = req.body.parent_id;
      user.parent_id = v === '' || v == null ? null : v;
    } else {
      user[field] = req.body[field];
    }
  });

  await user.save();

  let actionText = `User ${user.name} (${user.role}) was updated`;
  if (req.body.department && req.body.department !== oldDepartment) {
    actionText += ` - Department changed from ${oldDepartment || 'None'} to ${req.body.department}`;
  }

  await Activity.create({
    action: actionText,
    user: req.user._id,
  });
  bustCache(); // Bust server cache so next read reflects updated user
  res.json(userToPublicJSON(user));
};

const getUserById = async (req, res) => {
  try {
    let user = await Admin.findById(req.params.id);
    if (!user) user = await Partner.findById(req.params.id);
    if (!user) user = await Client.findById(req.params.id);
    if (!user) user = await Employee.findById(req.params.id);
    if (!user) user = await User.findById(req.params.id);

    if (user) {
      res.json(userToPublicJSON(user));
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid User ID' });
  }
};

const uploadKycDocs = async (req, res) => {
  try {
    const { userId, docType } = req.body; // docType: 'panCard', 'aadharCard', 'passport', etc.
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Find the user
    let user = await Admin.findById(userId);
    if (!user) user = await Partner.findById(userId);
    if (!user) user = await Client.findById(userId);
    if (!user) user = await Employee.findById(userId);
    if (!user) user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Build file paths map
    const fileMap = {};
    const docTypeMap = {
      panCard: 'panCardFile',
      aadharCard: 'aadharCardFile',
      passport: 'passportFile',
      drivingLicence: 'drivingLicenceFile',
      nriDocs: 'nriDocsFile',
      otherDocs: 'otherDocsFile',
      nomineeAadhar: 'nomineeAadharPath',
      nomineePan: 'nomineePanPath',
      nomineeNoc: 'nomineeNocPath',
      nomineeOtherDocs: 'nomineeOtherDocsPath',
    };

    req.files.forEach((file, index) => {
      const type = Array.isArray(docType) ? docType[index] : docType;
      const schemaField = docTypeMap[type] || 'otherDocsFile';
      fileMap[schemaField] = `/uploads/documents/clients/${userId}/${file.filename}`;
    });

    // Update kyc_data or direct fields
    if (!user.kyc_data) user.kyc_data = {};
    for (const [field, path] of Object.entries(fileMap)) {
      if (['nomineeAadharPath', 'nomineePanPath', 'nomineeNocPath', 'nomineeOtherDocsPath'].includes(field)) {
        user[field] = path;
      } else {
        user.kyc_data[field] = path;
      }
    }

    await user.save();
    bustCache();
    res.json({ message: 'Files uploaded successfully', files: fileMap });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    // Try to find user in each collection
    let user = await Admin.findById(req.params.id);
    let sourceModel = 'Admin';
    if (!user) { user = await Partner.findById(req.params.id); sourceModel = 'Partner'; }
    if (!user) { user = await Client.findById(req.params.id); sourceModel = 'Client'; }
    if (!user) { user = await Employee.findById(req.params.id); sourceModel = 'Employee'; }
    if (!user) { user = await User.findById(req.params.id); sourceModel = 'User'; }

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent deleting super_admin unless requester is also super_admin
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Not authorized to delete super admin' });
    }

    // Clear pointers to this partner so lists and dashboards do not reference a removed user
    if (sourceModel === 'Partner') {
      const pid = user._id;
      await Partner.updateMany({ parent_id: pid }, { $set: { parent_id: null } });
      await Client.updateMany({ parent_id: pid }, { $set: { parent_id: null } });
    }

    await user.deleteOne();
    bustCache();
    await Activity.create({
      action: `User ${user.name} (${user.role}) deleted from ${sourceModel} collection`,
      user: req.user._id,
    });
    res.json({ message: 'User deleted successfully', _id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEmployeeProfile = async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ message: 'Not authorized. Only employees can use this endpoint.' });
    }

    const employee = await Employee.findById(req.user._id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { email, phone, currentPassword, newPassword } = req.body;

    // Contact Update
    if (email) employee.email = email;
    if (phone) employee.phone = phone;

    // Password Update
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, employee.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid current password' });
      }
      const salt = await bcrypt.genSalt(10);
      employee.password = await bcrypt.hash(newPassword, salt);
    }

    // Profile Picture Upload
    if (req.file) {
      const fullPath = req.file.path;
      const uploadsIndex = fullPath.indexOf('uploads');
      const fileUrl = '/' + fullPath.substring(uploadsIndex).replace(/\\/g, '/');
      // If we had an avatar field we'd update it here. Assuming standard 'profilePicture' or similar.
      employee.profilePicture = fileUrl; // Add to schema dynamically or if exists
    }

    await employee.save();
    bustCache();
    
    res.json(userToPublicJSON(employee));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeeProfile = async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ message: 'Not authorized. Only employees can use this endpoint.' });
    }
    const employee = await Employee.findById(req.user._id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateClientProfile = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Not authorized. Only clients can use this endpoint.' });
    }

    const client = await Client.findById(req.user._id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const { name, email, phone, alternatePhone, address, city, state, pincode, currentPassword, newPassword } = req.body;

    // Contact & Personal Update
    if (name) client.name = name;
    if (email) client.email = email;
    if (phone) client.phone = phone;
    if (alternatePhone !== undefined) client.alternatePhone = alternatePhone;
    if (address !== undefined) client.permanentAddress = address;
    if (city !== undefined) client.city = city;
    if (state !== undefined) client.state = state;
    if (pincode !== undefined) client.pincode = pincode;

    // Password Update
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, client.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid current password' });
      }
      const salt = await bcrypt.genSalt(10);
      client.password = await bcrypt.hash(newPassword, salt);
    }

    // Profile Picture Upload
    if (req.file) {
      const fullPath = req.file.path;
      const uploadsIndex = fullPath.indexOf('uploads');
      const fileUrl = '/' + fullPath.substring(uploadsIndex).replace(/\\/g, '/');
      client.profilePicture = fileUrl;
    }

    await client.save();
    bustCache();
    
    res.json(userToPublicJSON(client));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClientProfile = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Not authorized. Only clients can use this endpoint.' });
    }
    const client = await Client.findById(req.user._id).select('-password');
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, relationWithHolder, phone, email, dob, aadharNo, panNo } = req.body;

    // Security check: Clients can only modify their own family members
    if (req.user.role === 'client' && req.user._id.toString() !== id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify another user\'s family tree' });
    }

    let user = await Admin.findById(id);
    if (!user) user = await Partner.findById(id);
    if (!user) user = await Client.findById(id);
    if (!user) user = await Employee.findById(id);
    if (!user) user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.familyMembers) {
      user.familyMembers = [];
    }

    const newMember = {
      name,
      relationWithHolder,
      phone,
      email,
      dob,
      aadharNo,
      panNo
    };

    user.familyMembers.push(newMember);
    await user.save();

    bustCache();

    res.status(201).json({ message: 'Family member added successfully', familyMembers: user.familyMembers });
  } catch (error) {
    console.error('Error adding family member:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateFamilyMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { name, relationWithHolder, phone, email, dob, aadharNo, panNo } = req.body;

    // Security check: Clients can only modify their own family members
    if (req.user.role === 'client' && req.user._id.toString() !== id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify another user's family tree" });
    }

    let user = await Admin.findById(id);
    if (!user) user = await Partner.findById(id);
    if (!user) user = await Client.findById(id);
    if (!user) user = await Employee.findById(id);
    if (!user) user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.familyMembers) {
      return res.status(404).json({ message: 'Family member not found' });
    }

    const memberIndex = user.familyMembers.findIndex(m => m._id.toString() === memberId.toString());
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Family member not found' });
    }

    user.familyMembers[memberIndex] = {
      ...user.familyMembers[memberIndex].toObject ? user.familyMembers[memberIndex].toObject() : user.familyMembers[memberIndex],
      name: name || user.familyMembers[memberIndex].name,
      relationWithHolder: relationWithHolder || user.familyMembers[memberIndex].relationWithHolder,
      phone: phone || user.familyMembers[memberIndex].phone,
      email: email !== undefined ? email : user.familyMembers[memberIndex].email,
      dob: dob !== undefined ? dob : user.familyMembers[memberIndex].dob,
      aadharNo: aadharNo !== undefined ? aadharNo : user.familyMembers[memberIndex].aadharNo,
      panNo: panNo !== undefined ? panNo : user.familyMembers[memberIndex].panNo,
    };

    await user.save();
    bustCache();

    res.status(200).json({ message: 'Family member updated successfully', familyMembers: user.familyMembers });
  } catch (error) {
    console.error('Error updating family member:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a custom folder for a client
// @route   POST /api/users/:id/folders
// @access  Private (Admin/Partner)
const addClientFolder = async (req, res) => {
  try {
    const { folderName } = req.body;
    if (!folderName) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    // Find the user across all models (legacy architecture)
    let client = await Admin.findById(req.params.id);
    if (!client) client = await Partner.findById(req.params.id);
    if (!client) client = await Client.findById(req.params.id);
    if (!client) client = await Employee.findById(req.params.id);
    if (!client) client = await User.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (!client.customFolders) client.customFolders = [];
    if (!client.customFolders.includes(folderName)) {
      client.customFolders.push(folderName);
      await client.save();
    }

    res.status(200).json({ message: 'Folder added successfully', customFolders: client.customFolders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rename a custom folder for a client
// @route   PUT /api/users/:id/folders/rename
// @access  Private (Admin/Partner)
const renameClientFolder = async (req, res) => {
  try {
    const { oldName, newName } = req.body;
    if (!oldName || !newName) return res.status(400).json({ message: 'Both old and new folder names are required' });

    let client = await Admin.findById(req.params.id);
    if (!client) client = await Partner.findById(req.params.id);
    if (!client) client = await Client.findById(req.params.id);
    if (!client) client = await Employee.findById(req.params.id);
    if (!client) client = await User.findById(req.params.id);

    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Update in customFolders
    if (client.customFolders) {
      const index = client.customFolders.indexOf(oldName);
      if (index !== -1) {
        client.customFolders[index] = newName;
        await client.save();
      }
    }

    // Bulk update documents
    const Document = require('../../models/Document');
    await Document.updateMany(
      { client_id: req.params.id, folder: oldName },
      { $set: { folder: newName } }
    );

    res.status(200).json({ message: 'Folder renamed successfully', customFolders: client.customFolders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a custom folder for a client
// @route   DELETE /api/users/:id/folders/:folderName
// @access  Private (Admin/Partner)
const deleteClientFolder = async (req, res) => {
  try {
    const { folderName } = req.params;

    let client = await Admin.findById(req.params.id);
    if (!client) client = await Partner.findById(req.params.id);
    if (!client) client = await Client.findById(req.params.id);
    if (!client) client = await Employee.findById(req.params.id);
    if (!client) client = await User.findById(req.params.id);

    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (client.customFolders) {
      client.customFolders = client.customFolders.filter(f => f !== folderName);
      await client.save();
    }

    // Bulk delete or move documents? Usually delete the folder means documents go to General
    const Document = require('../../models/Document');
    await Document.updateMany(
      { client_id: req.params.id, folder: folderName },
      { $set: { folder: 'General' } }
    );

    res.status(200).json({ message: 'Folder deleted and documents moved to General', customFolders: client.customFolders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  enrolClient,
  updateUser,
  getUserById,
  deleteUser,
  uploadKycDocs,
  getEmployeeProfile,
  updateEmployeeProfile,
  getClientProfile,
  updateClientProfile,
  addFamilyMember,
  updateFamilyMember,
  addClientFolder,
  renameClientFolder,
  deleteClientFolder,
};
