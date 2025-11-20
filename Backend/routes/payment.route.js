import Stripe from "stripe";
import dotenv from "dotenv";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe checkout session
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const { cartItems, couponCode } = req.body;
    const userId = req.user._id; // Assuming protectRoute sets req.user

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const line_items = cartItems.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        userId: userId.toString(),
        products: JSON.stringify(cartItems),
        couponCode: couponCode || "",
      },
    });

    res.status(200).json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({ success: false, message: "Failed to create checkout session" });
  }
};

/**
 * Handle checkout success webhook (optional)
 * Or can be called manually after redirect from Stripe
 */
export const handleCheckoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          { code: session.metadata.couponCode, userId: session.metadata.userId },
          { isActive: false }
        );
      }

      const products = JSON.parse(session.metadata.products);
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map(product => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalamount: session.amount_total / 100,
        stripeSessionId: sessionId,
      });

      await newOrder.save();
      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        orderId: newOrder._id,
      });
    }

    res.status(400).json({ success: false, message: "Payment not completed" });
  } catch (error) {
    console.error("Checkout success error:", error);
    res.status(500).json({ success: false, message: "Failed to process checkout success" });
  }
};
