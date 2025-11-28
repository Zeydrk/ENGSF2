
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { useProduct } from "../hooks/useProduct";
import AdminLogReport from "./Adminlogreport";

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

export default function Home() {
  const productApi = useProduct();
  const [expiryData, setExpiryData] = useState({ labels: [], datasets: [] });
  const [stockData, setStockData] = useState({ labels: [], datasets: [] });
  const [priceDistributionData, setPriceDistributionData] = useState({ labels: [], datasets: [] });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'lowStock', 'expiring'

  // Statistics states
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    expiringSoon: 0,
    totalInventoryValue: 0,
    averagePrice: 0,
    highValueProducts: 0,
  });

  // Filtered products based on active filter
  const filteredProducts = products.filter(product => {
    if (activeFilter === "lowStock") {
      return product.product_Stock < 10;
    } else if (activeFilter === "expiring") {
      if (!product.product_Expiry) return false;
      const expiryDate = new Date(product.product_Expiry);
      const daysRemaining = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
      return daysRemaining <= 3 && daysRemaining >= 0;
    }
    return true; // 'all' filter
  });

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const productsData = await productApi.getAllProducts(1, 100);
        setProducts(productsData?.products || []); 
      } catch (err) {
        setError(err.message || "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Update dashboard when products change
  useEffect(() => {
    const updateDashboard = () => {
      const now = new Date();
      
      const safeProducts = Array.isArray(products) ? products : [];
      
      // Calculate statistics
      const totalProducts = safeProducts.length;
      const lowStock = safeProducts.filter(p => p.product_Stock > 0 && p.product_Stock < 10).length;
      const outOfStock = safeProducts.filter(p => p.product_Stock === 0).length;
      
      let expiringSoon = 0;
      let totalInventoryValue = 0;
      let highValueProducts = 0;

      safeProducts.forEach((p) => {
        totalInventoryValue += (p.product_Stock * (p.product_RetailPrice || 0));
        
        if ((p.product_Stock * (p.product_RetailPrice || 0)) > 1000) {
          highValueProducts++;
        }
        
        if (p.product_Expiry) {
          const expiryDate = new Date(p.product_Expiry);
          const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          if (daysRemaining <= 3 && daysRemaining >= 0) expiringSoon++;
        }
      });

      const averagePrice = totalProducts > 0 ? totalInventoryValue / totalProducts : 0;

      setStats({
        totalProducts,
        lowStock,
        outOfStock,
        expiringSoon,
        totalInventoryValue,
        averagePrice,
        highValueProducts,
      });

      // Charts data (same as before)
      if (safeProducts.length > 0) {
        let expired = 0, soon = 0, good = 0;

        safeProducts.forEach((p) => {
          if (!p.product_Expiry) {
            good++;
            return;
          }
          const expiryDate = new Date(p.product_Expiry);
          const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
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

        // Stock level chart
        const stockLevels = {
          "Out of Stock": outOfStock,
          "Low Stock (1-9)": lowStock,
          "Medium Stock (10-49)": safeProducts.filter(p => p.product_Stock >= 10 && p.product_Stock < 50).length,
          "High Stock (50+)": safeProducts.filter(p => p.product_Stock >= 50).length,
        };

        setStockData({
          labels: Object.keys(stockLevels),
          datasets: [
            {
              label: "Stock Levels",
              data: Object.values(stockLevels),
              backgroundColor: ["#ef4444", "#facc15", "#3b82f6", "#22c55e"],
              borderWidth: 1,
            },
          ],
        });

        // Price distribution chart
        const priceRanges = {
          "₱0-10": safeProducts.filter(p => (p.product_RetailPrice || 0) <= 10).length,
          "₱11-50": safeProducts.filter(p => (p.product_RetailPrice || 0) > 10 && (p.product_RetailPrice || 0) <= 50).length,
          "₱51-100": safeProducts.filter(p => (p.product_RetailPrice || 0) > 50 && (p.product_RetailPrice || 0) <= 100).length,
          "₱101+": safeProducts.filter(p => (p.product_RetailPrice || 0) > 100).length,
        };

        setPriceDistributionData({
          labels: Object.keys(priceRanges),
          datasets: [
            {
              label: "Price Distribution",
              data: Object.values(priceRanges),
              backgroundColor: ["#86efac", "#4ade80", "#22c55e", "#16a34a"],
              borderWidth: 1,
            },
          ],
        });
      } else {
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
    };

    updateDashboard();
  }, [products]);

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

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Fixed Quick Actions
  const quickActions = [
    { 
      label: "Add New Product",  
      action: () => window.location.href = "/product" 
    },
    { 
      label: "View Low Stock", 
      action: () => setActiveFilter("lowStock"),
      active: activeFilter === "lowStock"
    },
    { 
      label: "Check Expiry",  
      action: () => setActiveFilter("expiring"),
      active: activeFilter === "expiring"
    },
    { 
      label: "Show All", 
      action: () => setActiveFilter("all"),
      active: activeFilter === "all"
    },
  ];

  // Show loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-base-200" data-theme="autumn">
       
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
 

      {/* Welcome Section */}
      <div className="mt-6 mb-6 p-6 rounded-xl bg-white shadow-md max-w-4xl mx-auto w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard
          </h1>
          <div className="w-24 h-1 bg-orange-400 rounded-full mx-auto mb-3"></div>
          <p className="text-gray-700 text-lg mb-6">
            Monitor your products, track stock levels, and keep tabs on expirations at a glance.
          </p>
          
          {/* Active Filter Display */}
          {activeFilter !== "all" && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 font-medium">
                {activeFilter === "lowStock" 
                  ? `Showing ${filteredProducts.length} low stock products (less than 10 units)` 
                  : `Showing ${filteredProducts.length} products expiring within 3 days`}
              </p>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  action.active 
                    ? "bg-orange-500 text-white" 
                    : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                }`}
              >
                <span className="text-lg">{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last Updated: {lastUpdated}
            </p>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Products */}
          <div className="stat bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="stat-title text-gray-600">Total Products</div>
            <div className="stat-value text-blue-600 text-2xl">
              {activeFilter === "all" ? stats.totalProducts : filteredProducts.length}
            </div>
            <div className="stat-desc text-gray-500">
              {activeFilter === "all" ? "In inventory" : "Filtered view"}
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="stat bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="stat-title text-gray-600">Stock Alerts</div>
            <div className="stat-value text-red-600 text-2xl">
              {stats.lowStock + stats.outOfStock}
            </div>
            <div className="stat-desc text-gray-500">
              {stats.outOfStock} out of stock, {stats.lowStock} low
            </div>
          </div>

          {/* Expiry Alerts */}
          <div className="stat bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="stat-title text-gray-600">Expiring Soon</div>
            <div className="stat-value text-yellow-600 text-2xl">{stats.expiringSoon}</div>
            <div className="stat-desc text-gray-500">Within 3 days</div>
          </div>

          {/* Inventory Value */}
          <div className="stat bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="stat-title text-gray-600">Inventory Value</div>
            <div className="stat-value text-green-600 text-2xl">
              ₱{stats.totalInventoryValue.toLocaleString()}
            </div>
            <div className="stat-desc text-gray-500">
              ₱{stats.averagePrice.toFixed(2)} avg/product
            </div>
          </div>
        </div>
      </div>

      {/* Product List Preview */}
      {activeFilter !== "all" && filteredProducts.length > 0 && (
        <div className="px-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              {activeFilter === "lowStock" ? "Low Stock Products" : "Products Expiring Soon"}
            </h3>
            <div className="grid gap-2">
              {filteredProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{product.product_Name}</span>
                  <span className="text-sm text-gray-600">
                    {activeFilter === "lowStock" 
                      ? `Stock: ${product.product_Stock}` 
                      : `Expires: ${new Date(product.product_Expiry).toLocaleDateString()}`}
                  </span>
                </div>
              ))}
              {filteredProducts.length > 5 && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  ... and {filteredProducts.length - 5} more
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts and Logs Section */}
      <div className="p-6 grid lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
        {/* Doughnut Chart */}
        <div className="bg-white rounded-2xl p-6 shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">
            {products.length > 0 ? "Expiry Overview" : "No Products"}
          </h2>
          <div className="w-full max-w-[300px] h-[300px]">
            <Doughnut data={expiryData} options={chartOptions} />
          </div>
        </div>

        {/* Stock Levels Chart */}
        <div className="bg-white rounded-2xl p-6 shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Stock Levels</h2>
          <div className="w-full h-[300px]">
            <Bar data={stockData} options={barChartOptions} />
          </div>
        </div>

        {/* Price Distribution Chart */}
        <div className="bg-white rounded-2xl p-6 shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Price Distribution</h2>
          <div className="w-full h-[300px]">
            <Bar data={priceDistributionData} options={barChartOptions} />
          </div>
        </div>

        {/* Admin Log Report */}
        <div className="bg-white rounded-2xl p-6 shadow lg:col-span-2 xl:col-span-3">
          <AdminLogReport />
        </div>
      </div>
    </div>
  );
}