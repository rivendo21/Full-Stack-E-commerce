import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  subtotal: 0,
  total: 0,
  isCouponApplied: false,
  cartLoaded: false,

  // -----------------------------------------
  // LOAD CART FROM BACKEND
  // -----------------------------------------
  getCartItems: async () => {
    if (get().cartLoaded) return;

    try {
      const res = await axios.get("/cart", { withCredentials: true });

      const items = Array.isArray(res.data.cart) ? res.data.cart : [];

      set({ cart: items, cartLoaded: true });
      get().cartTotal();
    } catch (err) {
      set({ cart: [], cartLoaded: true });
      toast.error("Failed to load cart");
    }
  },

  // -----------------------------------------
  // CALCULATE TOTALS
  // -----------------------------------------
  cartTotal: () => {
    const { cart, coupon } = get();

    const subtotal = cart.reduce((sum, item) => {
      const price = item?.price || 0;
      const qty = item?.quantity || 0;
      return sum + price * qty;
    }, 0);

    let total = subtotal;

    if (coupon?.discountPercentage) {
      total = subtotal - subtotal * (coupon.discountPercentage / 100);
    }

    set({ subtotal, total });
  },

  // -----------------------------------------
  // ADD TO CART
  // -----------------------------------------
  addToCart: async (product) => {
    if (!product?._id) return toast.error("Product ID missing");

    try {
      await axios.post(
        "/cart",
        { productId: product._id },
        { withCredentials: true }
      );

      set((state) => {
        const exists = state.cart.find((i) => i._id === product._id);

        let updatedCart;

        if (exists) {
          // Increase quantity
          updatedCart = state.cart.map((i) =>
            i._id === product._id
              ? { ...i, quantity: (i.quantity || 0) + 1 }
              : i
          );
        } else {
          // Add new item — IMPORTANT: keep previous items
          updatedCart = [
            ...state.cart,
            { ...product, quantity: 1 },
          ];
        }

        return { cart: updatedCart };
      });

      get().cartTotal();
      toast.success("Added to cart");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  },

  // -----------------------------------------
  // REMOVE FROM CART
  // -----------------------------------------
  removeFromCart: async (productId) => {
    if (!productId) return;

    try {
      await axios.delete("/cart", {
        data: { productId },
        withCredentials: true,
      });

      set((state) => ({
        cart: state.cart.filter((i) => i._id !== productId),
      }));

      get().cartTotal();
      toast.success("Removed from cart");
    } catch (err) {
      toast.error("Failed to remove");
    }
  },

  // -----------------------------------------
  // UPDATE QUANTITY
  // -----------------------------------------
  updateQuantity: async (productId, quantity) => {
    if (!productId) return;

    if (quantity < 1) {
      get().removeFromCart(productId);
      return;
    }

    try {
      await axios.put(
        `/cart/${productId}`,
        { quantity },
        { withCredentials: true }
      );

      set((state) => ({
        cart: state.cart.map((i) =>
          i._id === productId ? { ...i, quantity } : i
        ),
      }));

      get().cartTotal();
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  },

  // -----------------------------------------
  // APPLY COUPON
  // -----------------------------------------
  applyCoupon: async (code) => {
    if (!code) return toast.error("Enter a coupon");

    try {
      const res = await axios.post(
        "/cart/apply-coupon",
        { code },
        { withCredentials: true }
      );

      set({
        coupon: res.data.coupon,
        isCouponApplied: true,
      });

      get().cartTotal();
      toast.success("Coupon applied");
    } catch (err) {
      toast.error("Invalid coupon");
    }
  },

  // -----------------------------------------
  // REMOVE COUPON
  // -----------------------------------------
  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().cartTotal();
  },
}));
