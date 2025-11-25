import Stripe from "stripe";
import dotenv from "dotenv";
import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { coupon: couponCode } = req.body;

    if (!req.user || !req.user.cartItems || req.user.cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Fetch full product data for all cart items
    const productIds = req.user.cartItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    // Build Stripe line items
    const lineItems = req.user.cartItems.map((item) => {
      const product = products.find((p) => p._id.toString() === item.product.toString());
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: product.image ? [product.image] : [],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Handle coupon if provided
    let discount = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (coupon && coupon.discount > 0) { // using coupon.discount
        const stripeCoupon = await stripe.coupons.create({
          duration: "once",
          percent_off: coupon.discount,
        });
        discount = stripeCoupon.id;
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      discounts: discount ? [{ coupon: discount }] : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          req.user.cartItems.map((i) => ({ id: i.product, quantity: i.quantity }))
        ),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
