import React from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";

const categories = [
  {
    href: "/Jeans",
    name: "Jeans",
    imageUrl:
      "https://media.gucci.com/style/HEXFBFBFB_South_0_160_640x640/1760717722/844629_XDDD1_4011_001_100_0000_Light.jpg",
  },
  {
    href: "/T-shirts",
    name: "T-shirts",
    imageUrl:
      "https://media.gucci.com/style/HEXFBFBFB_South_0_160_640x640/1735926315/796395_XJG55_9692_001_100_0000_Light.jpg",
  },
  {
    href: "/Shoes",
    name: "Shoes",
    imageUrl:
      "https://media.gucci.com/style/HEXFBFBFB_South_0_160_640x640/1756190737/850193_AAFOO_9071_001_100_0000_Light.jpg",
  },
  {
    href: "/Glasses",
    name: "Glasses",
    imageUrl:
      "https://media.gucci.com/style/HEXFBFBFB_South_0_160_640x640/1733767301/819689_J0740_1012_001_100_0000_Light.jpg",
  },
  {
    href: "/Jackets",
    name: "Jackets",
    imageUrl:
      "https://media.gucci.com/style/HEXFBFBFB_South_0_160_640x640/1761064253/851725_XKFBD_4795_001_100_0000_Light.jpg",
  },
  {
    href: "/Suits",
    name: "Suits",
    imageUrl:
      "https://media.gucci.com/style/HEXFBFBFB_South_0_160_640x640/1758096062/827953_Z7AP6_4440_001_100_0000_Light.jpg",
  },
  {
    href: "/Bags",
    name: "Bags",
    imageUrl:
      "https://media.gucci.com/style/HEXFBFBFB_South_0_160_640x640/1760458516/839110_FAFHG_9763_001_100_0000_Light.jpg",
  },
];

const HomePage = () => {
  const { fetchFeaturedProducts, products, isLoading } = useProductStore();
  return (
    <div className="relative text-white">
      <div className="relative  z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-center text-5xl sm:text-6xl font-bold text-blue-800 mb-4">
          Explore our Collection
        </h1>
        <p className="text-center text-xl text-gray-300 mb-10 font-bold">
          Discover our latest collection
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
          {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
