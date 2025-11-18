import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";
import { a, desc } from "framer-motion/client";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ products });
  } catch (error) {
    console.log("error in get all products controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export default getAllProducts;

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");

    if (featuredProducts) {
      return res.json({ products: JSON.parse(featuredProducts) });
    }

    featuredProducts = await product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    await redis.set("featured_products", JSON.stringify(featuredProducts));
    res.json(featuredProducts);
  } catch (error) {
    console.log("error in get all products controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, image, category, price, isFeatured } = req.body;

    let cloudinaryresponse = null;
    if (image) {
      cloudinaryresponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      image: cloudinaryresponse?.secure_url || "",
      category,
      price,
      isFeatured: isFeatured || false,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("error in create product controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("error in delete product controller", error.message);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("error in delete product controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate(
      [
        { $sample: { size: 3 } },
        { $project: { _id: 1, name: 1, image: 1, description: 1, price: 1 } },
      ],
      { category: req.params.category }
    );
    res.json({ products });
  } catch (error) {
    console.log("error in get all products controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category: req.params.category });
    res.json({ products });
  } catch (error) {
    console.log("error in get all products controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();

      await updateFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("error in toggle featured product controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error in update featured products cache", error.message);
  }
}
