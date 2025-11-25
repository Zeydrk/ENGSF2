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
import { useProduct } from "../hooks/useProduct";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function Home() {
  const productApi = useProduct();
  const [expiryData, setExpiryData] = useState({ labels: [], datasets: [] });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use products from the hook
  const products = productApi.products || [];

  useEffect(() => {
    const updateDashboard = () => {
      const now = new Date();
      
      // Sort logic
      let sorted = [...products];
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

      // Expiry chart data - only if we have products
      if (products.length > 0) {
        let expired = 0,
          soon = 0,
          good = 0;

        products.forEach((p) => {
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
              backgroundColor: ["#ef4444", "#facc15", "#22c55e"],
              borderWidth: 1,
            },
          ],
        });
      } else {
        // Set empty chart data when no products
        setExpiryData({
          labels: ["No Products"],
          datasets: [
            {
              label: "Product Expiry Status",
              data: [1],
              backgroundColor: ["#9ca3af"],
              borderWidth: 1,
            },
          ],
        });
      }

      setLastUpdated(now.toLocaleTimeString());
      setLoading(false);
    };

    updateDashboard();
  }, [products, sortBy]); // Re-run when products or sortBy changes

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await productApi.getAllProducts(1, 100); // Load all products for dashboard
      } catch (err) {
        setError(err.message || "Failed to load products");
      }
    };

    loadInitialData();
  }, []); // Run only once on component mount

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { 
        display: true, 
        text: products.length > 0 ? "Product Expiry Overview" : "No Products Available"
      },
    },
  };

  // Show loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-base-200" data-theme="autumn">
        <Navbar />
        <div className="flex items-center justify-center flex-grow">
          <p className="text-center text-gray-500 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-base-200" data-theme="autumn">
        <Navbar />
        <div className="flex items-center justify-center flex-grow">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-2">Error loading products</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200" data-theme="autumn">
      <Navbar />

      {/* Welcome Section */}
      <div className="mt-6 mb-6 p-6 rounded-xl bg-white shadow-md max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard
          </h1>
          <div className="w-24 h-1 bg-orange-400 rounded-full mx-auto mb-3"></div>
          <p className="text-gray-700 text-lg">
            Monitor your products, track stock levels, and keep tabs on expirations at a glance.
          </p>
        </div>
      </div>

      {/* Charts and List */}
      <div className="p-6 grid lg:grid-cols-2 gap-6 mt-4">
        {/* Doughnut Chart */}
        <div className="bg-white rounded-2xl p-6 shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">
            {products.length > 0 ? "Expiry Overview" : "No Products"}
          </h2>
          <div className="w-[450px] h-[450px]">
            <Doughnut data={expiryData} options={chartOptions} />
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-3">
              Last Updated: {lastUpdated}
            </p>
          )}
        </div>

        {/* Product List */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Product List {products.length > 0 && `(${products.length})`}
            </h2>
            {products.length > 0 && (
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
            )}
          </div>

          {/* Products or Empty State */}
          {products.length > 0 ? (
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
                    key={p._id || p.id}
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No products found</p>
              <p className="text-gray-400 text-sm">
                Products will appear here once they are added to the system.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}