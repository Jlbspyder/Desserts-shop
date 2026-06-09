import asynchandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Menu from "../models/menuModel.js";
import { calculatePrices } from "../utilities/CalculatePrices.js";
import {
  verifyPayPalpayment,
  checkIfNewTransaction,
} from "../utilities/paypal.js";
import { verifyStripePayment } from "../utilities/stripe.js";

//Create new order
//POST /api/orders
//Private access
const addOrders = asynchandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  } else {
    // get the ordered items from the database
    const itemsFromDatabase = await Menu.find({
      _id: { $in: orderItems.map((x) => x._id) },
    });

    // map over the order items and use the price from items from the database
    const databaseOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDatabase = itemsFromDatabase.find(
        (itemFromDatabase) =>
          itemFromDatabase._id.toString() === itemFromClient._id,
      );
      return {
        ...itemFromClient,
        menu: itemFromClient._id,
        price: matchingItemFromDatabase.price,
        _id: undefined,
      };
    });
    // claculate prices
    const { itemPrice, taxPrice, shippingPrice, totalPrice } =
      calculatePrices(databaseOrderItems);

    const order = new Order({
      orderItems: databaseOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });
    const createOrder = await order.save();

    res.status(201).json(createOrder);
  }
});

//Get logged in user's orders
//GET /api/orders/myorders
//Private access
const getMyOrders = asynchandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json(orders);
});

//Get order by  ID
//GET /api/orders/:id
//Private access
const getOrderById = asynchandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );

  if (order) {
    res.status(200).json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

//Update order to paid
//PUT /api/orders/:id/pay
//Private access
const updateOrderToPaid = asynchandler(async (req, res) => {
  // const { verified, value } = await verifyPayPalpayment(req.body.id);
  // if (!verified) throw new Error('Payment not verified');
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  let verified;
  let value;

  //check if this transaction has been done before
  // const isNewTransaction = await checkIfNewTransaction(Order, req.body.id);
  // if(!isNewTransaction) throw new Error('Transaction has been done before');

  if (order.paymentMethod === "PayPal") {
    ({ verified, value } = await verifyPayPalpayment(req.body.id));
  }

  if (order.paymentMethod === "CreditCard") {
    ({ verified, value } = await verifyStripePayment(req.body.id));
  }

  // if (order) {
    //check to see if correct amount was paid
    // const paidCorrectAmount = order.totalPrice.toString() === value;
    // if (!paidCorrectAmount) throw new Error("Incorrect amount paid");

    if (!verified) throw new Error("Payment not verified");

    const isNewTransaction = await checkIfNewTransaction(Order, req.body.id);
    if (!isNewTransaction) throw new Error("Transaction has been done before");

    const paidCorrectAmount = order.totalPrice.toString() === value;
    if (!paidCorrectAmount) throw new Error("Incorrect amount paid");

    order.paid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      paymentMethod: order.paymentMethod,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };
    const updateOrder = await order.save();

    res.json(updateOrder);
  // } else {
  //   res.status(404);
  //   throw new Error("Order not found");
  // }
});

//Update order to delivered
//PUT /api/orders/:id/delivered
//Private/Admin access
const updateOrderToDelivered = asynchandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.delivered = true;
    order.deliveredAt = Date.now();

    const updateOrder = await order.save();

    res.status(200).json(updateOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

//Get all orders
//GET /api/orders
//Private/Admin access
const getOrders = asynchandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT;
  const page = Number(req.query.pageNumber) || 1;
  const count = await Order.countDocuments();

  const orders = await Order.find({})
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.json({ orders, page, pages: Math.ceil(count / pageSize) });
});

export {
  addOrders,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
};
