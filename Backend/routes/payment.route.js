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

    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
            isActive: true,
          },
          { isActive: false }
        );
      }
      const products = JSON.parse(session.metadata.products);
      const order = new Order({
        userId: session.metadata.userId,
        products: products.map((p) => ({
          productId: p.id,
          quantity: p.quantity,
          price: p.price,
        })),
        totalAmount: session.amount_total / 100,
        sessionId: sessionId,
      });
      await order.save();
      res.status(200).json({ message: "Order created successfully" });
    }
  } catch (error) {
    console.error("Error in /checkout-success:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
