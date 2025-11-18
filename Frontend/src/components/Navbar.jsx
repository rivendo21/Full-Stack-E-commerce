import React from "react";
import { ShoppingCart, UserPlus, LogIn, LogOut, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../images/cart.png";
import logo2 from "../images/admin-lock.png";
import logo3 from "../images/logout.png";
import logo4 from "../images/add-person.png";
import logo5 from "../images/login.png";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
const Navbar = () => {
  const { user, logout } = useUserStore();
  const { cart } = useCartStore();
  const isAdmin = user?.role === "admin";
  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-emerald-400 items-center space-x-2 flex"
          >
            Commerceful
          </Link>
          <nav className="flex flex-wrap items-center gap-4">
            <Link
              to="/"
              className="text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out"
            >
              Home
            </Link>
            {user && (
              <Link
                to="/cart"
                className="relative group text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex flex-row items-center gap-1"
              >
                <span className="hidden sm:inline-block">Cart</span>
                <img className="flex w-4 " src={logo} />
                <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.length}
                </span>
              </Link>
            )}
            {isAdmin && (
              <Link
                to={"/admin-dashboard"}
                className="bg-emerald-700 text-white px-3 py-1 rounded hover:bg-emerald-600 transition duration-300 ease-in-out flex flex-row items-center gap-1"
              >
                {" "}
                <img className="flex w-4 " src={logo2} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}
            {user ? (
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex 
              flex-row gap-1 items-center transition duration-300 ease-in-out"
                onClick={logout}
              >
                <img className="flex w-4" src={logo3} />
                Logout
              </button>
            ) : (
              <>
                <Link to={"/signup"}>
                  <img className="flex w-4" src={logo4} />
                  Sign Up
                </Link>
                <Link to={"/login"}>
                  <img className="flex w-4" src={logo5} />
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
