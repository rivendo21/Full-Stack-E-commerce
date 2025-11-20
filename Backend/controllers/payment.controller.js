import Coupon from "../models/coupon.model.js";
import { stripe } from "../lib/stripe.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, coupon: couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "No products provided" });
    }

    // Map products to Stripe line items
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          images: [product.image],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.quantity || 1,
    }));

    // Handle coupon/discount
    let discount = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (coupon) {
        discount = await createStripeCoupon(coupon.discountPercentage);
      }
    }

    // Create Stripe checkout session
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
          products.map((p) => ({
            id: p.id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    
    const totalAmount = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper: create one-time Stripe coupon
async function createStripeCoupon(discountPercentage) {
  const stripeCoupon = await stripe.coupons.create({
    duration: "once",
    percent_off: discountPercentage,
  });
  return stripeCoupon.id;
}

// Helper: create new coupon in DB
async function createNewCoupon(userId) {
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userId,
  });
  await newCoupon.save();
  return newCoupon;
}
