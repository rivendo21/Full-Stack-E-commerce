import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";
import { useUserStore } from "./useUserStore.js";
import coupon from "../../../Backend/models/coupon.model.js";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  subtotal: 0,
  total: 0,
  isCouponApplied: false,

  getMyCoupon: async () => {
    try {
      const res = await axios.get("/coupons", { withCredentials: true });
      set({ coupon: res.data.coupon });
    } catch (error) {
      set({ coupon: null });
      const message =
        error?.response?.data?.message || "Error in Get My Coupon Function";
      toast.error(message);
    }
  },

  applyCoupon: async (code) => {
    try {
      const res = await axios.post(
        "/coupons/validate",
        { code },
        { withCredentials: true }
      );
      set({ coupon: res.data, isCouponApplied: true });
      get().cartTotal();
      toast.success("Coupon applied successfully");
    } catch (error) {
      set({ coupon: null });
      const message =
        error?.response?.data?.message || "Error in Apply Coupon Function";
      toast.error(message);
    }
  },

  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().cartTotal();
    toast.success("Coupon removed successfully");
  },

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
      get().cartTotal?.(); // safely call cartTotal if it exists
    } catch (error) {
      set({ cart: [] });
      const message =
        error?.response?.data?.message || "Error in Get Cart Function";
      toast.error(message);
    }
  },
  clearCart: async () => {
    set({ cart: [], coupon: null, total: 0, subtotal: 0 });
  },

  addToCart: async (product) => {
    if (!product) return toast.error("Product not found");
    try {
      await axios.post(
        "/cart",
        { productId: product._id },
        { withCredentials: true }
      );

      set((prevState) => {
        const existingItem = prevState.cart.find(
          (item) => item._id === product._id
        );
        const newCart = existingItem
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...prevState.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });

      get().cartTotal();
      toast.success("Product added to cart successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error in Add to Cart Function"
      );
    }
  },

  removeFromCart: async (productId) => {
    try {
      await axios.delete("/cart", {
        data: { productId },
        withCredentials: true,
      });

      set((prevState) => ({
        cart: prevState.cart.filter((item) => item._id !== productId),
      }));

      get().cartTotal();
      toast.success("Product removed from cart");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error in Remove from Cart Function"
      );
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity < 1) {
      get().removeFromCart(productId);
      return;
    }

    try {
      // Do NOT include /api again — proxy handles it
      await axios.put(
        `/cart/${productId}`,
        { quantity },
        { withCredentials: true }
      );

      set((prevState) => ({
        cart: prevState.cart.map((item) =>
          item._id === productId ? { ...item, quantity } : item
        ),
      }));

      get().cartTotal();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error in Update Quantity Function"
      );
      console.error(error.response);
    }
  },

  cartTotal: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let total = subtotal;
    if (coupon) {
      const discount = (coupon.discountPercentage / 100) * subtotal;
      total = subtotal - subtotal * (coupon.discountPercentage / 100);
    }

    set({ subtotal, total });
  },
}));
