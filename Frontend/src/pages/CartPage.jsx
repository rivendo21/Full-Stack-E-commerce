import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import CartItem from "../components/CartItem";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import OrdersSummary from "../components/OrdersSummary";
import GiftCouponCard from "../components/GiftCouponCard";

const CartPage = () => {
  const { cart = [], getCartItems } = useCartStore();

  useEffect(() => {
    if (typeof getCartItems === "function") {
      getCartItems().catch((err) => console.error("Error fetching cart:", err));
    }
  }, [getCartItems]);

  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <motion.div
            className="mx-auto w-full flex-none lg:max-w-2xl xl:max-4xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {Array.isArray(cart) && cart.length > 0 ? (
              cart.map((item) =>
                item?._id ? <CartItem key={item._id} item={item} /> : null
              )
            ) : (
              <EmptyCartUI />
            )}
            {Array.isArray(cart) && cart.length > 0 && <PeopleAlsoBought />}
          </motion.div>

          {Array.isArray(cart) && cart.length > 0 && (
            <motion.div
              className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <OrdersSummary />
              <GiftCouponCard />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;

const EmptyCartUI = () => (
  <motion.div
    className="flex flex-col items-center justify-center space-y-4 py-16"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-2xl font-semibold">Your Cart is Empty</h3>
    <p className="text-gray-400">You have no items in your cart</p>
    <Link
      className="mt-4 rounded-md bg-emerald-500 px-6 py-2 text-white transition-colors hover:bg-emerald-600"
      to="/"
    >
      Continue Shopping
    </Link>
  </motion.div>
);
