import Product from "../models/product.model.js";

// Get all products in the user's cart
export const getCartProducts = async (req, res) => {
  try {
    console.log("req.user:", req.user);

    const products = await Product.find({ _id: { $in: req.user.cartItems.map(i => i.id) } });

    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product._id.toString()
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });

    res.status(200).json({ cart: cartItems });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add a product to the cart
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push({ id: productId, quantity: 1 });
    }

    await user.save();

    res.status(200).json({
      message: "Product added to cart successfully",
      cart: user.cartItems,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove a specific product or clear the entire cart
export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!productId) {
      // Clear the whole cart
      user.cartItems = [];
    } else {
      // Remove specific product
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }

    await user.save();

    res.status(200).json({
      cart: user.cartItems,
      message:
        user.cartItems.length === 0
          ? "Cart cleared successfully"
          : "Product removed from cart successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update quantity of a product in the cart
export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (!existingItem) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    } else {
      existingItem.quantity = quantity;
    }

    await user.save();

    res.status(200).json({
      message: "Cart updated successfully",
      cart: user.cartItems,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
