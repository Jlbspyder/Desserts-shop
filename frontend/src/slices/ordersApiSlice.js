import { apiSlice } from "./apiSlice";
import { ORDERS_URL, PAYPAL_URL, STRIPE_URL } from "../constants";

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: "POST",
        body: { ...order },
      }),
    }),
    getOrderDetails: builder.query({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: "PUT",
        body: { ...details },
      }),
    }),
    getPayPalClientId: builder.query({
      query: () => ({
        url: PAYPAL_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    getStripePublishableKey: builder.query({
      query: () => ({
        url: STRIPE_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    createPaymentIntent: builder.mutation({
      query: (orderId) => ({
        url: "/api/payment/create-payment-intent",
        method: "POST",
        body: { orderId },
      }),
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/myorders`,
      }),
      keepUnusedDataFor: 5,
    }),
    getOrders: builder.query({
      query: ({ pageNumber }) => ({
        url: ORDERS_URL,
        params: {
          pageNumber,
        },
      }),
      keepUnusedDataFor: 5,
    }),
    deliveredOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/delivered`,
        method: "PUT",
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPayPalClientIdQuery,
  useGetStripePublishableKeyQuery,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useDeliveredOrderMutation,
  useCreatePaymentIntentMutation,
} = ordersApiSlice;
