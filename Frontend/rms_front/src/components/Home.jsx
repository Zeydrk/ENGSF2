import Navbar from "./Navbar";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function Home() {
  const [products, setProducts] = useState([]);
  const [expiryData, setExpiryData] = useState({ labels: [], datasets: [] });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const fetchProducts = () => {
      fetch("http://localhost:3000/products")
        .then((res) => res.json())
        .then((data) => {
          const now = new Date();

          // Sort logic
          let sorted = [...data];
          if (sortBy === "stock")
            sorted.sort((a, b) => a.product_Stock - b.product_Stock);
          else if (sortBy === "price")
            sorted.sort((a, b) => a.product_Price - b.product_Price);
          else if (sortBy === "expiry")
            sorted.sort(
              (a, b) =>
                new Date(a.product_Expiry) - new Date(b.product_Expiry)
            );
          else sorted.sort((a, b) => a.product_Name.localeCompare(b.product_Name));

          setProducts(sorted);

          // Expiry chart data
          let expired = 0,
            soon = 0,
            good = 0;

          data.forEach((p) => {
            if (!p.product_Expiry) return;
            const expiryDate = new Date(p.product_Expiry);
            const daysRemaining = Math.ceil(
              (expiryDate - now) / (1000 * 60 * 60 * 24)
            );
            if (daysRemaining < 0) expired++;
            else if (daysRemaining <= 3) soon++;
            else good++;
          });

          setExpiryData({
            labels: ["Expired", "Expiring Soon", "Good"],
            datasets: [
              {
                label: "Product Expiry Status",
                data: [expired, soon, good],
                backgroundColor: ["#ef4444", "#facc15", "#22c55e"], // red, yellow, green
                borderWidth: 1,
              },
            ],
          });

          setLastUpdated(now.toLocaleTimeString());
        })
        .catch((err) => console.error("Error fetching products:", err));
    };

    fetchProducts();
    const timer = setInterval(fetchProducts, 3000);
    return () => clearInterval(timer);
  }, [sortBy]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Product Expiry Overview" },
    },
  };

  if (products.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-6">No Products Yet</p>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200" data-theme="autumn">
      <Navbar />

      {/* Welcome Section */}
      <div className="mt-6 mb-6 p-6 rounded-xl bg-white  shadow-md max-w-3xl mx-auto">
        <div className="text-center">
          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard
          </h1>

          {/* Accent line */}
          <div className="w-24 h-1 bg-orange-400 rounded-full mx-auto mb-3"></div>

          {/* Subtitle */}
          <p className="text-gray-700 text-lg">
            Monitor your products, track stock levels, and keep tabs on expirations at a glance.
          </p>
        </div>
      </div>

      {/* Charts and List */}
      <div className="p-6 grid lg:grid-cols-2 gap-6 mt-4">
        {/* Doughnut Chart */}
        <div className="bg-white rounded-2xl p-6 shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Expiry Overview</h2>
          <div className="w-[450px] h-[450px]">
            <Doughnut data={expiryData} options={chartOptions} />
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-3">
              Updates Every 3 seconds: {lastUpdated}
            </p>
          )}
        </div>

        {/* Product List */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Product List</h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm text-gray-700"
            >
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock</option>
              <option value="price">Sort by Price</option>
              <option value="expiry">Sort by Expiry</option>
            </select>
          </div>

          {/* Scrollable container */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 overflow-y-auto max-h-120 pr-2">
            {products.map((p) => {
              const expiryDate = new Date(p.product_Expiry);
              const now = new Date();
              const daysLeft = Math.ceil(
                (expiryDate - now) / (1000 * 60 * 60 * 24)
              );

              let statusLabel = "";
              let labelColor = "";
              if (daysLeft < 0) {
                statusLabel = "Expired";
                labelColor = "bg-red-500 text-white";
              } else if (daysLeft <= 3) {
                statusLabel = "Expiring Soon";
                labelColor = "bg-yellow-400 text-black";
              } else {
                statusLabel = "Good";
                labelColor = "bg-green-500 text-white";
              }

              return (
                <div
                  key={p._id}
                  className={`border rounded-xl p-4 shadow-sm bg-white hover:shadow-lg transition`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {p.product_Name}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${labelColor}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    Price:{" "}
                    <span className="font-medium">
                      ₱{Number(p.product_Price).toFixed(2)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Stock:{" "}
                    <span
                      className={`font-medium ${
                        p.product_Stock < 10
                          ? "text-red-500"
                          : "text-green-600"
                      }`}
                    >
                      {p.product_Stock}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Expiry: {expiryDate.toLocaleDateString()}
                  </p>
                  {daysLeft >= 0 && daysLeft <= 3 && (
                    <p className="text-sm text-red-600 mt-1 font-semibold">
                      {daysLeft} day{daysLeft === 1 ? "" : "s"} left!
                    </p>
                  )}
                  {daysLeft < 0 && (
                    <p className="text-sm text-red-600 mt-1 font-semibold">
                      Already expired!
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
