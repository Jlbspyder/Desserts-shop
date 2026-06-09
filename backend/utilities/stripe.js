// utilities/stripe.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function verifyStripePayment(paymentIntentId) {
  const paymentIntent =
    await stripe.paymentIntents.retrieve(paymentIntentId);

  return {
    verified: paymentIntent.status === 'succeeded',
    value: (paymentIntent.amount / 100).toString(),
  };
}