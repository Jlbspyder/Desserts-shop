// controllers/stripeController.js
import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.body.orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100),
    currency: 'usd',
    metadata: {
      orderId: order._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  res.json({
    clientSecret: paymentIntent.client_secret,
  });
});

export { createPaymentIntent };