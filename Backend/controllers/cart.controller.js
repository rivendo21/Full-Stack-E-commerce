import User from "../models/user.model.js";
import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product._id
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });
    res.json({ cartItems });
  } catch (error) {
    console.log("Error in getCartProducts controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!productId)
      return res.status(400).json({ message: "Product ID missing" });

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check if product already in cart
    const existingItem = user.cartItems.find(
      (item) => item.product === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }

    await user.save();

    res.status(200).json(user.cartItems);
  } catch (err) {
    console.error("Error in addToCart controller:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cartItems = [];
    await user.save();

    res.status(200).json(user.cartItems);
  } catch (err) {
    console.error("Error in removeAllFromCart:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter(
          (item) => item.product.toString() !== productId
        );
        await user.save();
        return res.status(200).json({ cart: user.cartItems });
      }
      existingItem.quantity = quantity;
      await user.save();
      return res.status(200).json({ cart: user.cartItems });
    }
    return res.status(404).json({ message: "Product not found in cart" });
  } catch (err) {
    console.error("Error in updateQuantity:", err);
    res.status(500).json({ message: "Server error" });
  }
};
