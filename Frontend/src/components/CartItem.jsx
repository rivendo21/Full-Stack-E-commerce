import { useCartStore } from "../stores/useCartStore";
import logo from "../images/trash.png";

const CartItem = ({ item }) => {
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  if (!item?._id) return null;

  const handleDecrease = () => {
    if (typeof updateQuantity === "function") {
      updateQuantity(item._id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (typeof updateQuantity === "function") {
      updateQuantity(item._id, item.quantity + 1);
    }
  };

  const handleRemove = () => {
    if (typeof removeFromCart === "function") {
      removeFromCart(item._id);
    }
  };

  return (
    <div className="rounded-lg border p-4 shadow-sm border-gray-700 bg-gray-800 md:p-6">
      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
        <div className="shrink-0 md:order-1">
          <img
            className="h-20 md:h-32 rounded object-cover"
            src={item.image}
            alt={item.name}
          />
        </div>

        <div className="flex items-center justify-between md:order-3 md:justify-end gap-4">
          <div className="flex items-center gap-2">
            <button onClick={handleDecrease} className="...">-</button>
            <p>{item.quantity}</p>
            <button onClick={handleIncrease} className="...">+</button>
          </div>

          <div className="text-end md:order-4 md:w-32">
            <p className="text-base font-bold text-emerald-400">${item.price}</p>
          </div>
        </div>

        <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
          <p className="text-base font-medium text-white hover:text-emerald-400 hover:underline">
            {item.name}
          </p>
          <p className="text-sm text-gray-400">{item.description}</p>

          <button
            className="inline-flex items-center text-sm font-medium text-red-400 hover:text-red-300 hover:underline gap-1"
            onClick={handleRemove}
          >
            <img className="w-6 h-6" src={logo} alt="Remove" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
