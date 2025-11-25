import User from "../models/user.model.js";
import Product from "../models/product.model.js";

// -----------------------------------------
// GET CART PRODUCTS
// -----------------------------------------
export const getCartProducts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cartItems.product");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Map cart items to include product details
    const cart = user.cartItems.map((item) => ({
      _id: item.product?._id || null,
      name: item.product?.name || "Deleted product",
      price: item.product?.price || 0,
      image: item.product?.image || "",
      quantity: item.quantity,
    }));

    res.status(200).json({ cart });
  } catch (err) {
    console.error("Error in getCartProducts:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------
// ADD TO CART
// -----------------------------------------
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) return res.status(400).json({ message: "Product ID missing" });

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = await User.findById(userId);

    // Check if product already in cart
    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push({ product: productId, quantity: 1 });
    }

    await user.save();

    res.status(200).json({ cart: user.cartItems });
  } catch (err) {
    console.error("Error in addToCart controller:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------
// REMOVE ALL FROM CART
// -----------------------------------------
export const removeAllFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cartItems = [];
    await user.save();

    res.status(200).json({ cart: user.cartItems });
  } catch (err) {
    console.error("Error in removeAllFromCart:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------
// UPDATE QUANTITY
// -----------------------------------------
export const updateQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: productId } = req.params;
    const { quantity } = req.body;

    if (!productId) return res.status(400).json({ message: "Product ID missing" });
    if (quantity < 1) return res.status(400).json({ message: "Quantity must be at least 1" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const item = user.cartItems.find((item) => item.product.toString() === productId);
    if (!item) return res.status(404).json({ message: "Product not in cart" });

    item.quantity = quantity;

    await user.save();

    res.status(200).json({ cart: user.cartItems });
  } catch (err) {
    console.error("Error in updateQuantity:", err);
    res.status(500).json({ message: "Server error" });
  }
};
