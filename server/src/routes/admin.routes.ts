import { Router } from 'express';
import {
  getAnalytics,
  getAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct, uploadProductScriptZip,
  getAdminUsers, handleAdminUserAction,
  getAdmins, addAdmin, demoteAdmin,
  getStaffRoles, createStaffRole, deleteStaffRole, updateAdminRole,
  getAdminOrders,
  getAdminLicenses, handleAdminLicenseAction, createAdminLicense, encryptAdminLua,
  getAdminTickets, updateAdminTicketStatus,
  getAdminReviews, approveAdminReview, deleteAdminReview,
  updateAdminSettings,
  getAdminCoupons, createAdminCoupon, updateAdminCoupon, deleteAdminCoupon
} from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { uploadScriptZip } from '../middleware/upload';

const router = Router();
router.use(authenticateToken, requireAdmin);

router.get('/analytics', getAnalytics);

// Products
router.get('/products', getAdminProducts);
router.post('/products', createAdminProduct);
router.post('/products/upload-zip', uploadScriptZip.single('file'), uploadProductScriptZip);
router.put('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);

// Users
router.get('/users', getAdminUsers);
router.post('/users/:id/:action', handleAdminUserAction);

// Staff Roles Zone
router.get('/roles', getStaffRoles);
router.post('/roles', createStaffRole);
router.delete('/roles/:id', deleteStaffRole);

// Admins Zone
router.get('/admins', getAdmins);
router.post('/admins', addAdmin);
router.put('/admins/:id/role', updateAdminRole);
router.post('/admins/:id/demote', demoteAdmin);
router.delete('/admins/:id', demoteAdmin);

// Orders
router.get('/orders', getAdminOrders);

// Licenses
router.get('/licenses', getAdminLicenses);
router.post('/licenses', createAdminLicense);
router.post('/licenses/:id/:action', handleAdminLicenseAction);

// Escrow Encryption Studio
router.post('/escrow/encrypt', encryptAdminLua);

// Tickets
router.get('/tickets', getAdminTickets);
router.post('/tickets/:id/status', updateAdminTicketStatus);

// Reviews
router.get('/reviews', getAdminReviews);
router.post('/reviews/:id/approve', approveAdminReview);
router.delete('/reviews/:id', deleteAdminReview);

// Settings
router.put('/settings', updateAdminSettings);

// Coupons
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createAdminCoupon);
router.put('/coupons/:id', updateAdminCoupon);
router.delete('/coupons/:id', deleteAdminCoupon);

export default router;
