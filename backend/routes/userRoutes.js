const express = require('express');
const router = express.Router();
const { getUsers, createUser, enrolClient, updateUser, getUserById, deleteUser, uploadKycDocs, updateEmployeeProfile, getEmployeeProfile, updateClientProfile, getClientProfile, addFamilyMember, addClientFolder, renameClientFolder, deleteClientFolder, updateFamilyMember, bustCache } = require('../controllers/user/userController');
const { protect, admin, adminOrSuperPartner } = require('../middleware/authMiddleware');
const uploadDocs = require('../middleware/docsUploadMiddleware');

router.route('/').get(protect, getUsers).post(protect, adminOrSuperPartner, createUser);
router.route('/enrol').post(protect, admin, enrolClient);
router.post('/kyc-upload', protect, admin, uploadDocs.array('files', 8), uploadKycDocs);

// Cache bust endpoint — forces server to re-fetch fresh data from DB on next request
router.post('/cache-bust', protect, admin, (req, res) => {
  bustCache();
  res.json({ message: 'Cache cleared successfully' });
});


router.route('/employee/profile')
  .get(protect, getEmployeeProfile)
  .patch(protect, uploadDocs.single('avatar'), updateEmployeeProfile);

router.route('/client/profile')
  .get(protect, getClientProfile)
  .patch(protect, uploadDocs.single('avatar'), updateClientProfile);

router.route('/:id')
  .get(protect, adminOrSuperPartner, getUserById)
  .patch(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

router.post('/:id/family', protect, addFamilyMember);
router.put('/:id/family/:memberId', protect, updateFamilyMember);
router.post('/:id/folders', protect, adminOrSuperPartner, addClientFolder);
router.put('/:id/folders/rename', protect, adminOrSuperPartner, renameClientFolder);
router.delete('/:id/folders/:folderName', protect, adminOrSuperPartner, deleteClientFolder);

module.exports = router;
