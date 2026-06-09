import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

const StripePayment = ({ onApproveStripe }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleStripePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (result.error) {
      toast.error(result.error.message);
      return;
    }

    if (result.paymentIntent?.status === 'succeeded') {
      await onApproveStripe(result.paymentIntent);
    }
  };

  return (
    <form onSubmit={handleStripePayment}>
      <PaymentElement />

      <button
        type="submit"
        className="confirm-order btn-straight"
        disabled={!stripe}
      >
        PAY WITH CARD
      </button>
    </form>
  );
};

export default StripePayment;