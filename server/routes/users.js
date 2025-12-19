const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getCaregivers,
  getElders,
  addEmergencyContact,
  removeEmergencyContact,
  updateProfileImage,
} = require('../controllers/users');

const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
let appointmentRouter;
let vitalRouter;

try {
  appointmentRouter = require('./appointments');
} catch (e) {
  appointmentRouter = null;
}

try {
  vitalRouter = require('./vitals');
} catch (e) {
  vitalRouter = null;
}

// Re-route into other resource routers
if (appointmentRouter) {
  router.use('/:userId/appointments', appointmentRouter);
}
if (vitalRouter) {
  router.use('/:userId/vitals', vitalRouter);
}

// Base user routes
router
  .route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

// Caregiver specific routes
router.get('/caregivers', protect, getCaregivers);
router.get('/elders', protect, getElders);

// User profile image
router.route('/:id/photo').put(protect, updateProfileImage);

// Emergency contacts
router
  .route('/:id/emergency-contacts')
  .post(protect, addEmergencyContact);

router
  .route('/:id/emergency-contacts/:contactId')
  .delete(protect, removeEmergencyContact);

// Standard user CRUD operations
router
  .route('/:id')
  .get(protect, getUser)
  .put(protect, updateUser)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
