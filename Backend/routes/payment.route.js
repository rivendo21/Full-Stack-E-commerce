import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import Coupon from "./../models/coupon.model.js";
import { createCheckoutSession } from "../controllers/payment.controller.js";
import { stripe } from "../lib/stripe.js";
import Order from "../models/order.model.js";

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/checkout-success", protectRoute, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          {
            isActive: false,
          }
        );
      }
      const products = JSON.parse(session.metadata.products);
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalamount: session.amount_total / 100,
        stripeSessionId: sessionId,
      });
      await newOrder.save();
      res.status(200).json({
        success: true,
        message: "Order created successfully",
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    console.error(error);
  }
});

export default router;
