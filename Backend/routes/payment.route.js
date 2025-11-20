import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import Coupon from "../models/coupon.model.js";
import { createCheckoutSession } from "../controllers/payment.controller.js";
import { stripe } from "../lib/stripe.js";
import Order from "../models/order.model.js";

const router = express.Router();

// Create Stripe checkout session
router.post("/create-checkout-session", protectRoute, createCheckoutSession);

// Handle successful checkout (client-side POST)
router.post("/checkout-success", protectRoute, async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "sessionId is required" });
    }

    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

    // Prevent duplicate order creation
    const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
    if (existingOrder) {
      return res.status(200).json({ success: true, message: "Order already exists", orderId: existingOrder._id });
    }

    // Handle coupon usage
    if (session.metadata.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: session.metadata.couponCode, userId: session.metadata.userId },
        { isActive: false }
      );
    }

    // Parse products safely
    let products = [];
    try {
      products = JSON.parse(session.metadata.products);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid products metadata" });
    }

    // Create new order
    const newOrder = new Order({
      user: session.metadata.userId,
      products: products.map((product) => ({
        product: product.id,
        quantity: product.quantity,
        price: product.price,
      })),
      totalAmount: session.amount_total / 100,
      stripeSessionId: sessionId,
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Checkout success error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
