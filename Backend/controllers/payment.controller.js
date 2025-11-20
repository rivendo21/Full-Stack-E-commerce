import Stripe from "stripe";
import dotenv from "dotenv";
import Coupon from "../models/coupon.model.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, coupon: couponCode } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "No products provided" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const lineItems = products.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          images: product.image ? [product.image] : [], // avoid undefined
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.quantity || 1,
    }));

    let discount = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (coupon && coupon.discountPercentage > 0) {
        const stripeCoupon = await stripe.coupons.create({
          duration: "once",
          percent_off: coupon.discountPercentage,
        });
        discount = stripeCoupon.id;
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: discount ? [{ coupon: discount }] : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({ id: p.id, quantity: p.quantity, price: p.price }))
        ),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
