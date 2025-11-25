import Navbar from "./Navbar";
import React, { useEffect, useState } from "react";
import { useProduct } from "../hooks/useProduct";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const productApi = useProduct();
  const products = productApi.products || [];
  
  const [expiryData, setExpiryData] = useState({ labels: [], datasets: [] });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        setLoading(true);
        
        // Use the same method as Products component
        await productApi.getAllProducts(1, 100); // Get all products for dashboard
        
        const now = new Date();
        
        // Expiry chart data
        let expired = 0, soon = 0, good = 0;

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
          labels: ["Expired", "Expiring Soon (≤3 days)", "Good"],
          datasets: [
            {
              label: "Product Expiry Status",
              data: [expired, soon, good],
              backgroundColor: ["#ef4444", "#facc15", "#22c55e"],
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        });

        setLastUpdated(now.toLocaleTimeString());
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please check your server connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    const timer = setInterval(fetchProducts, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(timer);
  }, [sortBy]);

  // Sort products based on selected criteria
  const sortedProducts = React.useMemo(() => {
    if (!products.length) return [];
    
    let sorted = [...products];
    if (sortBy === "stock")
      sorted.sort((a, b) => a.product_Stock - b.product_Stock);
    else if (sortBy === "price")
      sorted.sort((a, b) => a.product_RetailPrice - b.product_RetailPrice);
    else if (sortBy === "expiry")
      sorted.sort(
        (a, b) =>
          new Date(a.product_Expiry) - new Date(b.product_Expiry)
      );
    else sorted.sort((a, b) => a.product_Name.localeCompare(b.product_Name));
    
    return sorted;
  }, [products, sortBy]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      title: { 
        display: true, 
        text: "Product Expiry Overview",
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '50%',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-base-200" data-theme="autumn">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-base-200" data-theme="autumn">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="alert alert-error max-w-md">
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-base-200" data-theme="autumn">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-4">No Products Yet</p>
            <button className="btn btn-primary"
               onClick={() => navigate('/product')}
            >Add Your First Product</button>
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
        <div className="bg-white rounded-2xl p-6 shadow flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-center">Expiry Overview</h2>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md h-80">
              <Doughnut data={expiryData} options={chartOptions} />
            </div>
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Last updated: {lastUpdated}
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
              className="select select-bordered select-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock</option>
              <option value="price">Sort by Price</option>
              <option value="expiry">Sort by Expiry</option>
            </select>
          </div>

          {/* Scrollable container */}
          <div className="grid sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {sortedProducts.map((p) => {
              const expiryDate = new Date(p.product_Expiry);
              const now = new Date();
              const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

              let statusLabel = "";
              let labelColor = "";
              if (daysLeft < 0) {
                statusLabel = "Expired";
                labelColor = "badge-error";
              } else if (daysLeft <= 3) {
                statusLabel = "Expiring Soon";
                labelColor = "badge-warning";
              } else {
                statusLabel = "Good";
                labelColor = "badge-success";
              }

              return (
                <div
                  key={p.id}
                  className="border rounded-xl p-4 shadow-sm bg-white hover:shadow-lg transition duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 flex-1 pr-2">
                      {p.product_Name}
                    </h3>
                    <span className={`badge ${labelColor} badge-lg`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Price: <span className="font-medium">₱{Number(p.product_RetailPrice).toFixed(2)}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Stock: <span className={`font-medium ${p.product_Stock < 10 ? "text-error" : "text-success"}`}>
                        {p.product_Stock} units
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Expiry: <span className="font-medium">{expiryDate.toLocaleDateString()}</span>
                    </p>
                    {daysLeft >= 0 && daysLeft <= 3 && (
                      <p className="text-sm text-warning mt-1 font-semibold">
                        {daysLeft} day{daysLeft === 1 ? "" : "s"} left!
                      </p>
                    )}
                    {daysLeft < 0 && (
                      <p className="text-sm text-error mt-1 font-semibold">
                        Already expired!
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}