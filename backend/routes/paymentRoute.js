import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createPaymentIntent } from '../controllers/stripeController.js';

const router = express.Router();

router.route('/create-payment-intent').post(protect, createPaymentIntent);

export default router;