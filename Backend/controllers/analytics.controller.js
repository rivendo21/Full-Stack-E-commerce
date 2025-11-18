import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  const totalOrders = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$totalamount" },
      },
    },
  ]);

  const { totalSales, totalRevenue } = totalOrders[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

export const getDailySalesData = async (startDate, endDate) => {
  const dailySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$totalamount" },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const dateArray = getDatesInRange(startDate, endDate);

  return dateArray.map((date) => {
    const salesData = dailySales.find((item) => item._id === date);
    return {
      name: date,
      sales: salesData?.totalSales || 0,
      revenue: salesData?.totalRevenue || 0,
    };
  });
};

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}
