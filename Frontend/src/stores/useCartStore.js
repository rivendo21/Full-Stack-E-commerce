import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  subtotal: 0,
  total: 0,
  coupon: null,
  isCouponApplied: false,

  // Load cart from server
  getCartItems: async () => {
    try {
      const res = await axios.get("/cart", { withCredentials: true });
      const cartItems = Array.isArray(res.data.cart) ? res.data.cart : [];

      const detailedCart = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const productRes = await axios.get(`/products/${item.id}`);
            return { ...productRes.data, quantity: item.quantity };
          } catch (err) {
            console.warn("Product fetch failed for id", item.id);
            return null;
          }
        })
      );

      set({ cart: detailedCart.filter(Boolean) });
      get().cartTotal?.();
    } catch (error) {
      set({ cart: [] });
      toast.error(error?.response?.data?.message || "Failed to load cart");
    }
  },

  cartTotal: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let total = subtotal;

    if (coupon?.discountPercentage) {
      total = subtotal - (subtotal * coupon.discountPercentage) / 100;
    }

    set({ subtotal, total });
  },

  addToCart: async (product) => {
    if (!product?._id) return toast.error("Product not found");
    try {
      await axios.post("/cart", { productId: product._id }, { withCredentials: true });

      set((prev) => {
        const existingItem = prev.cart.find((i) => i._id === product._id);
        const newCart = existingItem
          ? prev.cart.map((i) =>
              i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
            )
          : [...prev.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });

      get().cartTotal?.();
      toast.success("Product added to cart");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add to cart");
    }
  },

  removeFromCart: async (_id) => {
    try {
      await axios.delete("/cart", { data: { productId: _id }, withCredentials: true });
      set((prev) => ({ cart: prev.cart.filter((i) => i._id !== _id) }));
      get().cartTotal?.();
      toast.success("Product removed from cart");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove product");
    }
  },

  updateQuantity: async (_id, quantity) => {
    if (quantity < 1) {
      return get().removeFromCart(_id);
    }
    try {
      await axios.put(`/cart/${_id}`, { quantity }, { withCredentials: true });
      set((prev) => ({
        cart: prev.cart.map((i) => (i._id === _id ? { ...i, quantity } : i)),
      }));
      get().cartTotal?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update quantity");
    }
  },
}));
