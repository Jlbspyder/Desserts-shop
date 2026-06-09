import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";
import { FaCcDiscover } from "react-icons/fa";
import { FaCcVisa } from "react-icons/fa6";
import { FaCcMastercard } from "react-icons/fa6";
import CheckoutSteps from "../../components/checkout/CheckoutSteps";
import { savePaymentMethod } from "../../slices/cartSlice";
import { useCreateOrderMutation } from "../../slices/ordersApiSlice";
import { clearCartItems, clearShippingAddress } from "../../slices/cartSlice";
import Timer from "../../components/Timer";
import Meta from "../../components/Meta";
import "./placeorder.css";

const PlaceOrderPage = () => {
  const cart = useSelector((state) => state.cart);
  const {
    shippingAddress,
    paymentMethod,
    cardDetails,
    cartItems,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = cart;

  const [payment, setPayment] = useState(paymentMethod || "");
  const [checked, setChecked] = useState(false);
  const [msg, setMsg] = useState("");


  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate("/shipping");
    } else if (!payment) {
      navigate("/placeorder");
    }
    dispatch(savePaymentMethod(payment));
  }, [shippingAddress.address, navigate, payment]);

  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const freeShipping = shippingPrice == 0 && "FREE";

  useEffect(() => {
    if (!shippingAddress) {
      navigate("/shipping");
    }
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(payment));
  };

  const placeOrderHandler = async () => {
    if (!paymentMethod ) {
      setMsg("Select a payment method");

      setTimeout(() => {
        setMsg("");
      }, 3000);

      return;
    }
    if (!checked ) {
      setMsg("You must accept terms and conditions");

      setTimeout(() => {
        setMsg("");
      }, 3000);

      return;
    }
    
    try {
      const res = await createOrder({
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      }).unwrap();
      navigate(`/order/${res._id}`);
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div className="order">
      <Meta title="JLB24 | Place order" />
      <CheckoutSteps step1 step2 step3 />
      <br />
      <h2>CHECKOUT</h2>
      <div className="place-order">
        <div className="place-order-info1">
          <h3 id="arrival">
            ESTIMATED ARRIVAL:&nbsp;&nbsp; {<Timer duration={60 * 60 * 1000} />}
            &nbsp; &nbsp;<span>if you place the order now</span>
          </h3>
          <div className="order-summary">
            {cartItems.map((item) => (
              <div key={item._id} className="order-dets">
                <Link to={`/menu/${item._id}`}>
                  <img src={item.thumbnail} alt={item.name} />
                </Link>
                <div className="place-order-description">
                  <div>
                    <h5>{item.name}</h5>
                    <p>{item.category}</p>
                    <br />
                    <div className="price-container">
                      <p id="qty">Quantity: {item.quantity}</p>
                      <p id="qty">@ ${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="price-wrapper">
                    <strong>
                      <p>${(item.price * item.quantity).toFixed(2)}</p>
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="order-pricing">
            <div className="bill">
              <h3>SUBTOTAL</h3>
              <h4>${subTotal.toFixed(2)}</h4>
            </div>
            <div className="bill">
              <h3>SHIPPING COST</h3>
              {freeShipping === "FREE" ? (
                <h4>{freeShipping}</h4>
              ) : (
                <h4>${shippingPrice}</h4>
              )}
            </div>
            <div className="bill">
              <h3>SALES TAX</h3>
              <h4>${taxPrice}</h4>
            </div>
          </div>
          <div className="bill bill-sum">
            <h3>TOTAL</h3>
            <h4>${totalPrice}</h4>
          </div>
        </div>
        <div className="place-order-info2">
          <div id="info">
            <h3>1. SHIPPING & BILLING</h3>
            <Link to={"/shipping"}>
              <p>EDIT</p>
            </Link>
          </div>
          <div className="order-details">
            <span>{shippingAddress.name},</span> {shippingAddress.address},{" "}
            {shippingAddress.city}, {shippingAddress.state},{" "}
            {shippingAddress.postalCode}, {shippingAddress.country}.
          </div>
          <h3 id="info">2. PAYMENT METHOD</h3>
          <div>
            <div className="payment-cards">
              <div id="payment-form">
                <div className="cards">
                  <FaCcDiscover />
                  <FaCcVisa />
                  <FaCcMastercard />
                </div>
                <div className="form-cntrl">
                  <label htmlFor="paymentMethod">PayPal</label>
                  <input
                    type="radio"
                    name="payment"
                    value="PayPal"
                    id="paymentMethod"
                    checked={payment === "PayPal"}
                    onChange={(e) => setPayment(e.target.value)}
                  />
                </div>
                <div className="form-cntrl">
                  <label htmlFor="paymentMethod">Credit Card</label>
                  <input
                    type="radio"
                    name="payment"
                    value="CreditCard"
                    id="paymentMethod"
                    checked={payment === "CreditCard"}
                    onChange={(e) => setPayment(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {payment === "CreditCard" && (
              <div className="payment-infor">
                <p>
                  You will enter your card details securely on the payment page.
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={placeOrderHandler}
              disabled={cartItems.length === 0}
              className="confirm-order btn-straight"
            >
              CONTINUE TO PAYMENT
            </button>
            <small>{msg}</small>
            <div className="tc">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <small>
                By continuing, I confirm that I have read and accepted the
                &nbsp;
                <Link to={"/terms"}>Terms and Conditions</Link> and the &nbsp;
                <Link to={"/privacy"}>Privacy Policy</Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderPage;
