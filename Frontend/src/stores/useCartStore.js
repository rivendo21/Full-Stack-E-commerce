import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  subtotal: 0,
  total: 0,
  isCouponApplied: false,

  getCartItems: async () => {
    try {
      const res = await axios.get("/cart", { withCredentials: true });
      const cartItems = Array.isArray(res.data.cart) ? res.data.cart : [];

      const detailedCart = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const productRes = await axios.get(`/products/${item.id}`);
            return {
              ...productRes.data,
              cartItemId: item.id, // backend cart item ID
              quantity: item.quantity,
            };
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
      toast.error(error?.response?.data?.message || "Error fetching cart");
    }
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
        error?.response?.data?.message || "Error adding product to cart"
      );
    }
  },

  removeFromCart: async (cartItemId) => {
    try {
      await axios.delete("/cart", {
        data: { productId: cartItemId },
        withCredentials: true,
      });

      set((prevState) => ({
        cart: prevState.cart.filter((item) => item.cartItemId !== cartItemId),
      }));

      get().cartTotal();
      toast.success("Product removed from cart");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error removing product from cart"
      );
    }
  },

  updateQuantity: async (cartItemId, quantity) => {
    if (quantity < 1) {
      get().removeFromCart(cartItemId);
      return;
    }

    try {
      await axios.put(
        `/cart/${cartItemId}`,
        { quantity },
        { withCredentials: true }
      );

      set((prevState) => ({
        cart: prevState.cart.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity } : item
        ),
      }));

      get().cartTotal();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error updating quantity"
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
      total = subtotal - discount;
    }

    set({ subtotal, total });
  },

  clearCart: () => set({ cart: [], coupon: null, subtotal: 0, total: 0 }),
}));
