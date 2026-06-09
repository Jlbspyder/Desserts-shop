import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Spinner from "../../components/Spinner";
import Meta from "../../components/Meta";
import { toast } from "react-toastify";
import { useGetMenuQuery } from "../../slices/menuApiSlice";
import { clearCartItems } from "../../slices/cartSlice";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePayment from "../../components/StripePayment";
import CheckoutSteps from "../../components/checkout/CheckoutSteps";
import {
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPayPalClientIdQuery,
  useDeliveredOrderMutation,
  useCreatePaymentIntentMutation,
  useGetStripePublishableKeyQuery
} from "../../slices/ordersApiSlice";
import "./ordersummary.css";

const OrderSummary = () => {
  const { id: orderId, pageNumber, keyword } = useParams();
  
  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const {
    data: stripeConfig,
    isLoading: loadingStripeConfig,
    error: errorStripeConfig,
  } = useGetStripePublishableKeyQuery();

  // const { data, isLoading: loadingMenu, error: menuError } = useGetMenuQuery({ pageNumber, keyword});

  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliveredOrderMutation();

  const [clientSecret, setClientSecret] = useState("");

  const [createPaymentIntent, { isLoading: loadingStripeIntent }] =
    useCreatePaymentIntentMutation();

  const dispatch = useDispatch();

  const totalItem = order?.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const itemPrice = order?.orderItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  const [payForOrder, { isLoading: loadingPayment }] = usePayOrderMutation();

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  const [stripePromise, setStripePromise] = useState(null);

useEffect(() => {
  if (stripeConfig?.publishableKey) {
    setStripePromise(loadStripe(stripeConfig.publishableKey));
  }
}, [stripeConfig]);



  // const {
  //   data: paypal,
  //   isLoading: loadingPayPal,
  //   error: errorPayPal,
  // } = useGetPayPalClientIdQuery();

  const {
    data: paypal,
    isLoading: loadingPayPal,
    error: errorPayPal,
  } = useGetPayPalClientIdQuery(undefined, {
    skip: order?.paymentMethod !== "PayPal",
  });

  const { userInfo } = useSelector((state) => state.auth);

  const cart = useSelector((state) => state.cart);
  const { shippingPrice } = cart;

  const freeShipping = shippingPrice == 0 && "FREE";

  useEffect(() => {
    if (order?.paymentMethod !== "PayPal") return;

    if (!errorPayPal && !loadingPayPal && paypal.clientId) {
      const loadPayPalScript = async () => {
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": paypal.clientId,
            currency: "USD",
          },
        });

        paypalDispatch({
          type: "setLoadingStatus",
          value: "pending",
        });
      };

      if (order && !order.paid) {
        if (!window.paypal) {
          loadPayPalScript();
        }
      }
    }
  }, [order, paypal, paypalDispatch, loadingPayPal, errorPayPal]);

  useEffect(() => {
    const getClientSecret = async () => {
      if (order && !order.paid && order.paymentMethod === "CreditCard") {
        try {
          const data = await createPaymentIntent(order._id).unwrap();
          setClientSecret(data.clientSecret);
        } catch (error) {
          toast.error(error?.data?.message || error.message);
        }
      }
    };

    getClientSecret();
  }, [order, createPaymentIntent]);

  // useEffect(() => {
  //   if (!errorPayPal && !loadingPayPal && paypal.clientId) {
  //     const loadPayPalScript = async () => {
  //       paypalDispatch({
  //         type: "resetOptions",
  //         value: {
  //           "client-id": paypal.clientId,
  //           currency: "USD",
  //         },
  //       });
  //       paypalDispatch({ type: "setLoadingStatus", value: "pending" });
  //     };
  //     if (order && !order.paid) {
  //       if (!window.paypal) {
  //         loadPayPalScript();
  //       }
  //     }
  //   }
  // }, [order, paypal, paypalDispatch, loadingPayPal, errorPayPal]);

  const deliverOrderHandler = async () => {
    try {
      await deliverOrder(orderId);
      refetch();
      toast.success("Order Delivered");
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then(async function (details) {
      try {
        await payForOrder({ orderId, details }).unwrap();
        refetch();
        toast.success("Payment successful");
        dispatch(clearCartItems());
      } catch (error) {
        toast.error(error?.data?.message || error.message);
      }
    });
  };

  const onApproveStripe = async (paymentIntent) => {
    console.log("PAYMENT INTENT ID:", result.paymentIntent.id);
    console.log("CLIENT SECRET:", clientSecret);
    try {
      await payForOrder({
        orderId,
        details: {
          id: result.paymentIntent.id,
          status: result.paymentIntent.status,
          paymentMethod: "CreditCard",
        },
      }).unwrap();

      refetch();
      toast.success("Payment successful");
      dispatch(clearCartItems());
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  // const onApproveTest = async () => {
  //   await payForOrder({ orderId, details: { payer: {} } });
  //   refetch();
  //   dispatch(clearCartItems());
  //   toast.success('Payment successful');
  // };

  const onError = (error) => {
    toast.error(error.message);
  };

  const createOrder = (data, actions) => {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: {
              value: order.totalPrice,
            },
          },
        ],
      })
      .then((orderId) => {
        return orderId;
      });
  };

  return isLoading ? (
    <Spinner />
  ) : (
    <div className="your-cart summary_">
      <Meta title="JLB24 | Order summary" />
      <CheckoutSteps step1 step2 step3 step4 />
      <div className="confirm-page">
        <div id="info">
          {!order.paid ? <h3>ORDER SUMMARY</h3> : <h3>ORDER COMPLETE</h3>}
        </div>
        {order.paid && !order.delivered && !userInfo.isAdmin && (
          <p>
            Thank you <strong>{userInfo?.firstname}</strong> for your order! We
            are preparing your desserts. We hope you enjoy your meal. An email
            has been sent to <strong>{order?.user.email}</strong> with details
            of your order.
          </p>
        )}
        {order.paid && order.delivered && !userInfo.isAdmin && (
          <p>
            Thank you <strong>{userInfo?.firstname.toUpperCase()}</strong> for
            your order! We hope you enjoyed your meal.
          </p>
        )}
        {order.paid && (
          <div className="order-detail">
            <div className="bill">
              <p>ORDER DATE</p>
              <p>{order.createdAt}</p>
            </div>
            <div className="bill">
              <p>ORDER NUMBER</p>
              <p>{order._id}</p>
            </div>
            <div className="bill">
              <p>ORDER TOTAL</p>
              <p>
                ${order.totalPrice.toFixed(2)} ({totalItem}{" "}
                {totalItem > 1 ? "items" : "item"})
              </p>
            </div>
          </div>
        )}
        <div className="order-detail">
          <h4>Payment Method</h4>
          <p>{order.paymentMethod}</p>
        </div>
        <div className="sumary">
          {order.paid ? (
            <p id="paid">Paid at {order.paidAt.substring(11, 19)} GMT</p>
          ) : (
            <p id="not-paid">Not Paid</p>
          )}
          {totalItem > 1 ? (
            <h5 className="items">Order Items</h5>
          ) : (
            <h5 className="items">Order Item</h5>
          )}
          {order.orderItems.map((item) => (
            <div key={item._id} className="confirm-page-summary">
              <img src={item.thumbnail} alt="menu-img" className="menu-img" />
              <div className="sumary-info">
                <div>
                  <h4>{item.name}</h4>
                  <div className="price-container">
                    <p id="qty">Quantity: {item.quantity}</p>
                    <p id="qty">@ ${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <p>${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        <br />
        {order.delivered ? (
          <p id="delivered">
            Delivered at {order.deliveredAt.substring(11, 19)} GMT
          </p>
        ) : (
          <p id="not-delivered">Not Delivered</p>
        )}
        <div id="info">
          <h3>DELIVERY ADDRESS</h3>
        </div>
        <div className="order-details">
          <span>{order.shippingAddress.name},</span>{" "}
          {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
          {order.shippingAddress.state}, {order.shippingAddress.postalCode},{" "}
          {order.shippingAddress.country}.
        </div>
        <div className="confirm-page">
          {order.paid && <h3>ORDER SUMMARY</h3>}
          <div className="order-sumary">
            <div>ITEMS</div>
            <div>${itemPrice.toFixed(2)}</div>
          </div>
          <div className="order-sumary">
            <div>SHIPPING COST</div>
            {freeShipping === "FREE" ? (
              <div>{freeShipping}</div>
            ) : (
              <div>${order.shippingPrice.toFixed(2)}</div>
            )}
          </div>
          <div className="order-sumary">
            <div>TOTAL BEFORE TAX</div>
            <div>${(order.totalPrice - order.taxPrice).toFixed(2)}</div>
          </div>
          <div className="order-sumary">
            <div>ESTIMATED TAX COLLECTED</div>
            <div>${order.taxPrice.toFixed(2)}</div>
          </div>
          <br />
          <hr />
          <div className="order-sumary">
            <h3>ORDER TOTAL</h3>
            <h3>${order.totalPrice.toFixed(2)}</h3>
          </div>
        </div>
        <div className="order-pay">
          {!order.paid && (
            <div>
              {loadingPayment && <Spinner />}
              {isPending ? (
                <Spinner />
              ) : (
                <div>
                  {order.paymentMethod === "CreditCard" && clientSecret && stripePromise && (
                    <>
                      {loadingStripeIntent && <Spinner />}

                      
                        <Elements
                          stripe={stripePromise}
                          options={{ clientSecret }}
                        >
                          <StripePayment onApproveStripe={onApproveStripe} />
                        </Elements>
                    
                    </>
                  )}
                  {order.paymentMethod === "PayPal" && (
                    <PayPalButtons
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={onError}
                    ></PayPalButtons>
                  )}
                </div>
              )}
            </div>
          )}
          {loadingDeliver && <Spinner />}
          {userInfo && userInfo.isAdmin && order.paid && !order.delivered && (
            <button
              type="button"
              className="confirm-order btn-straight"
              onClick={deliverOrderHandler}
            >
              MARK AS DELIVERED
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
