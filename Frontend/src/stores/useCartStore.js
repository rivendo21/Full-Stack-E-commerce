import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  subtotal: 0,
  total: 0,
  isCouponApplied: false,
  cartLoaded: false, // <- new flag

  getCartItems: async () => {
    if (get().cartLoaded) return; // already loaded, skip
    try {
      const res = await axios.get("/cart", { withCredentials: true });
      const cartItems = Array.isArray(res.data.cart) ? res.data.cart : [];
      set({ cart: cartItems, cartLoaded: true });
      get().cartTotal();
    } catch (error) {
      set({ cart: [], cartLoaded: true });
      toast.error(error?.response?.data?.message || "Error loading cart");
    }
  },

  cartTotal: () => {
    const { cart, coupon } = get();
    const subtotal = Array.isArray(cart)
      ? cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
      : 0;
    let total = subtotal;
    if (coupon?.discountPercentage) {
      total = subtotal - subtotal * (coupon.discountPercentage / 100);
    }
    set({ subtotal, total });
  },

  addToCart: async (product) => {
    if (!product?._id) return toast.error("Product not found");
    try {
      await axios.post("/cart", { productId: product._id }, { withCredentials: true });

      set((prev) => {
        const exists = prev.cart.find((i) => i._id === product._id);
        const newCart = exists
          ? prev.cart.map((i) => (i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i))
          : [...prev.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });

      get().cartTotal();
      toast.success("Product added to cart");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error adding product");
    }
  },

  removeFromCart: async (productId) => {
    if (!productId) return;
    try {
      await axios.delete("/cart", { data: { productId }, withCredentials: true });
      set((prev) => ({ cart: prev.cart.filter((i) => i._id !== productId) }));
      get().cartTotal();
      toast.success("Product removed from cart");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error removing product");
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (!productId) return;
    if (quantity < 1) {
      get().removeFromCart(productId);
      return;
    }
    try {
      await axios.put(`/cart/${productId}`, { quantity }, { withCredentials: true });
      set((prev) => ({ cart: prev.cart.map((i) => (i._id === productId ? { ...i, quantity } : i)) }));
      get().cartTotal();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error updating quantity");
    }
  },

  applyCoupon: async (code) => {
    try {
      const res = await axios.post("/cart/apply-coupon", { code }, { withCredentials: true });
      set({ coupon: res.data.coupon, isCouponApplied: true });
      get().cartTotal();
      toast.success("Coupon applied");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid coupon");
    }
  },

  removeCoupon: async () => {
    set({ coupon: null, isCouponApplied: false });
    get().cartTotal();
  },
}));
