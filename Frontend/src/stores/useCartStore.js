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
  getCartItems: async () => {
    try {
      const res = await axios.get("/cart");
      set({ cart: res.data });
      get().calculateTotals();
    } catch (err) {
      set({ cart: [] });
      toast.error(err.response.data.message || "Failed to load cart");
    }
  },

  addToCart: async (product) => {
    try {
      await axios.post("/cart", { productId: product._id });

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

      get().calculateTotals();
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  },

  calculateTotals: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let total = subtotal;

    if (coupon) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }
    set({ subtotal, total });
  },

  removeFromCart: async (productId) => {
    if (!productId) return;

    try {
      await axios.delete("/cart/", { data: { productId } });

      set((state) => ({
        cart: state.cart.filter((i) => (i._id || i.id) !== productId),
      }));

      get().calculateTotals();
      toast.success("Removed from cart");
    } catch (err) {
      toast.error("Failed to remove");
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) {
      await get().removeFromCart(productId);
      return;
    }

    await axios.put(`/cart/${productId}`, { quantity });

    set((state) => ({
      cart: state.cart.map((i) =>
        i._id == productId ? { ...i, quantity } : i
      ),
    }));

    get().calculateTotals();
  },

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

  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().cartTotal();
  },
}));
