import React, { useEffect, useState } from "react";
import { useProduct } from "../../hooks/useProduct";
import { useRef } from "react";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import { Link } from 'react-router-dom';
import { 
  FiHome,
  FiUsers,
  FiTruck,
  FiPackage,
  FiSearch, 
  FiFilter, 
  FiEdit2, 
  FiEye,
  FiPlus,
  FiX,
  FiSave,
  FiArchive,
  FiShoppingBag,
  FiCalendar,
  FiDollarSign,
  FiShoppingCart,
  FiRefreshCw,
  FiTrash2
} from 'react-icons/fi';
import "react-toastify/dist/ReactToastify.css";
import './product.css';

export default function ProductsWithTable() {
  const productApi = useProduct();

  // UI state
  const [loading, setLoading] = useState(false);
  const [filteredResults, setFilteredResults] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [form, setForm] = useState({
    p_Name: "",
    p_Desc: "",
    p_Retail: "",
    p_Buying: "",
    p_Stock: "",
    p_Cat: "",
    p_Expiry: "",
  });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Pagination & mode
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(7);
  const [mode, setMode] = useState("product");

  // New design states
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(null);
  const [showUnarchiveConfirm, setShowUnarchiveConfirm] = useState(null);

  // Full lists from hook
  const products = productApi.products || [];
  const archived = productApi.archived || [];

  // Debounce
  const debounceRef = useRef(null);

  // etc
  const [errors, setErrors] = useState({});

  // Reset pagination & filters on mode change
  useEffect(() => {
    setPage(1);
    setError(null);
    setFilteredResults(null);
    refresh(1);
  }, [mode]);

  async function refresh(currentPage = page) {
    setLoading(true);
    setError(null);
    try {
      const data =
        mode === "product"
          ? await productApi.getAllProducts(currentPage, limit)
          : await productApi.archivedProducts(currentPage, limit);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  // --- Search handler ---
 async function handleSearch(e) {
  const value = e.target.value.toLowerCase();
  setSearchText(value);

  clearTimeout(debounceRef.current);

  debounceRef.current = setTimeout(() => {
    applyFilters(value, selectedCategory);
  }, 300);
}

  // --- Category dropdown handler ---
 async function handleDropDown(option) {
  setSelectedCategory(option);
  applyFilters(searchText, option);
}

async function applyFilters(newSearch, newCategory) {
  setLoading(true);
  try {
    if(mode === "product"){
    await productApi.searchProduct( newSearch || "", newCategory || "",);
    setPage(1);
    setTotalPages(1);
    setFilteredResults(null);
  }else if (mode === "archive"){
    await productApi.searchArchivedProduct(newSearch || "", newCategory || "");
    setPage(1);
    setTotalPages(1);
    setFilteredResults(null);
  }
    
  } catch (err) {
    setError(err?.message || "Search failed");
  } finally {
    setLoading(false);
  }
}

  function resetForm() {
    setForm({
      p_Name: "",
      p_Desc: "",
      p_Retail: "",
      p_Buying: "",
      p_Stock: "",
      p_Cat: "",
      p_Expiry: "",
    });
  }

 function validateProduct(payload) {
  const newErrors = {};

  // Expiry
  const today = new Date();
  const expiry = new Date(payload.product_Expiry);
  const diff = (expiry - today) / (1000 * 60 * 60 * 24);

  if (expiry < today) {
    newErrors.product_Expiry = "Expiry date cannot be in the past.";
  } else if (diff <= 5) {
    newErrors.product_Expiry = "Expiry must be more than 5 days from today.";
  }

  // Retail price
  if (!payload.product_RetailPrice || payload.product_RetailPrice <= 0) {
    newErrors.product_RetailPrice = "Retail price must be greater than 0.";
  }

  // Buying price
  if (!payload.product_BuyingPrice || payload.product_BuyingPrice <= 0) {
    newErrors.product_BuyingPrice = "Buying price must be greater than 0.";
  }

  // Stock
  if (!payload.product_Stock || payload.product_Stock <= 0) {
    newErrors.product_Stock = "Stock must be greater than 0.";
  }

  // Name
  if (!payload.product_Name.trim()) {
    newErrors.product_Name = "Product name is required.";
  }

  // Description
  if (!payload.product_Description.trim()) {
    newErrors.product_Description = "Description is required.";
  }

  // Category
  if (!payload.product_Category.trim()) {
    newErrors.product_Category = "Category is required.";
  }

  return newErrors;
}

  // --- CRUD handlers ---
async function handleCreate(e) {
  e.preventDefault();

  const payload = {
    product_Name: form.p_Name.trim(),
    product_Description: form.p_Desc.trim(),
    product_RetailPrice: parseFloat(form.p_Retail),
    product_BuyingPrice: parseFloat(form.p_Buying),
    product_Stock: parseFloat(form.p_Stock),
    product_Category: form.p_Cat.trim(),
    product_Expiry: new Date(form.p_Expiry).toISOString().split("T")[0],
  };

  const validationErrors = validateProduct(payload);

  // Frontend check for duplicate name
  const duplicate = tableData.some(
    (p) =>
      p.product_Name.toLowerCase() === payload.product_Name.toLowerCase()
  );
  if (duplicate) {
    validationErrors.product_Name = "Product name already exists!";
  }

  setErrors(validationErrors);

  if (Object.keys(validationErrors).length > 0) {
    // Show toast for immediate feedback
    if (validationErrors.product_Name) {
      toast.error(validationErrors.product_Name, {
        duration: 4000,
        position: "top-right",
      });
    }
    return;
  }

  try {
    const response = await productApi.createProduct(payload);
    resetForm();
    setShowProductForm(false);
    refresh();
    toast.success("Product created successfully!", {
      duration: 4000,
      position: "top-right",
    });
  } catch (err) {
    const msg = err?.response?.data?.message || "Create failed";
    toast.error(msg, {
      duration: 4000,
      position: "top-right",
    });
    setError(msg);
  }
}

  async function handleDelete(id, stock) {
  if (stock > 0) {
    toast.error("Cannot delete a product with stock", {
      duration: 4000,
      position: "top-right",
      style: { background: "#cf2b2bff", color: "#fff" },
    });
    return;
  }

  // Show toast confirmation
  const confirmDelete = await new Promise((resolve) => {
    const toastId = toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <span>Delete this product? This action cannot be undone.</span>
          <div className="flex gap-2 justify-end mt-2">
            <button
              className="btn btn-sm btn-error"
              onClick={() => {
                resolve(false);
                toast.dismiss(t.id);
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-success"
              onClick={() => {
                resolve(true);
                toast.dismiss(t.id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-right" }
    );
  });

  if (!confirmDelete) return;

  try {
    await productApi.deleteProduct({ id });
    toast.success("Product deleted successfully", {
      duration: 3000,
      position: "top-right",
      style: { background: "#34d399", color: "#fff" },
    });
    refresh();
  } catch (err) {
    toast.error(err.message || "Delete failed", {
      duration: 4000,
      position: "top-right",
      style: { background: "#f87171", color: "#fff" },
    });
    setError(err.message || "Delete failed");
  }
}

  async function handleArchive (id) {
    const confirmArchive = await new Promise((resolve) => {
    const toastId = toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <span>Archive this product?</span>
          <div className="flex gap-2 justify-end mt-2">
            <button
              className="btn btn-sm btn-error"
              onClick={() => {
                resolve(false);
                toast.dismiss(t.id);
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-success"
              onClick={() => {
                resolve(true);
                toast.dismiss(t.id);
              }}
            >
              Archive
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-right" }
    );
  });
    if(!confirmArchive) return;
    
    try {
      await productApi.archiveProduct({ id });
      toast.success("Product archived successfully", {
      duration: 3000,
      position: "top-right",
      style: { background: "#34d399", color: "#fff" },
    });
      refresh();
    } catch (err) {
      toast.error(err.message || "Archive failed", {
      duration: 4000,
      position: "top-right",
      style: { background: "#f87171", color: "#fff" },
    });
    setError(err.message || "Archive failed");
    }
  }

  async function handleAddBack(id) {
    try {
      await productApi.archiveAddBack({ id });
      toast.success("Product added back successfully", {
      duration: 3000,
      position: "top-right",
      style: { background: "#34d399", color: "#fff" },
    });
      refresh();
    } catch (err) {
      toast.error(err.message || "Adding back failed", {
      duration: 4000,
      position: "top-right",
      style: { background: "#f87171", color: "#fff" },
    });
    setError(err.message || "Adding back  failed");
    }
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      p_Name: product?.product_Name ?? "",
      p_Desc: product?.product_Description ?? "",
      p_Retail:
        product?.product_RetailPrice !== undefined ? String(product.product_RetailPrice) : "",
      p_Buying:
        product?.product_BuyingPrice !== undefined ? String(product.product_BuyingPrice) : "",
      p_Stock: product?.product_Stock !== undefined ? String(product.product_Stock) : "",
      p_Cat: product?.product_Category ?? "",
      p_Expiry: product?.product_Expiry
        ? new Date(product.product_Expiry).toISOString().split("T")[0]
        : "",
    });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editing) return;
    const payload = {
      id: editing.id,
      product_Name: form.p_Name.trim(),
      product_Description: form.p_Desc.trim(),
      product_RetailPrice: parseFloat(form.p_Retail),
      product_BuyingPrice: parseFloat(form.p_Buying),
      product_Stock: parseFloat(form.p_Stock),
      product_Category: form.p_Cat.trim(),
      product_Expiry: form.p_Expiry,
    };

     const validationErrors = validateProduct(payload);
      setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
    return;
  }
    try {
      await productApi.updateProduct(payload);
      setEditing(null);
      resetForm();
       toast.success("Product Updated successfully", {
      duration: 3000,
      position: "top-right",
      style: { background: "#34d399", color: "#fff" },
    });
     refresh();
    } catch (err) {
      toast.error(err.message || "Update failed", {
      duration: 4000,
      position: "top-right",
      style: { background: "#f87171", color: "#fff" },
    });
    setError(err.message || "Update failed");
    }
  }

  // --- New design helper functions ---
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === tableData.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(tableData.map(p => p.id));
    }
  };

  const handleBulkArchive = async () => {
    try {
      for (const id of selectedProducts) {
        await productApi.archiveProduct({ id });
      }
      toast.success(`${selectedProducts.length} product(s) archived successfully`, {
        duration: 3000,
        position: "top-right",
      });
      setSelectedProducts([]);
      refresh();
    } catch (err) {
      toast.error("Bulk archive failed", {
        duration: 4000,
        position: "top-right",
      });
    }
  };

  const handleBulkUnarchive = async () => {
    try {
      for (const id of selectedProducts) {
        await productApi.archiveAddBack({ id });
      }
      toast.success(`${selectedProducts.length} product(s) unarchived successfully`, {
        duration: 3000,
        position: "top-right",
      });
      setSelectedProducts([]);
      refresh();
    } catch (err) {
      toast.error("Bulk unarchive failed", {
        duration: 4000,
        position: "top-right",
      });
    }
  };

  const getStatusColor = (stock) => {
    if (stock > 10) return 'text-green-600 bg-green-100';
    if (stock > 0) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusText = (stock) => {
    if (stock > 10) return 'In Stock';
    if (stock > 0) return 'Low Stock';
    return 'Out of Stock';
  };

  // --- Table data ---
  const tableData = filteredResults ?? (mode === "archive" ? archived : products);
  const showPagination = filteredResults === null;

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-red-50 p-4 sm:p-6 products-container">
      {/* Header Section - New Design */}
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
  <div className="text-center sm:text-left">
    <h1 className="text-2xl pb-5 sm:text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-700 to-orange-800">
      Product Management
    </h1>
    <p className="text-amber-700 mt-1 sm:mt-2 text-sm sm:text-lg">
      Manage your inventory and product listings
    </p>
  </div>
  
  {/* Buttons Container */}
  <div className="flex flex-col gap-3 w-full sm:w-auto">
    {/* Add Product Button - Made Smaller */}
    <button
      onClick={() => setShowProductForm((s) => !s)}
      className="bg-linear-to-r from-amber-500 to-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
    >
      <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
      <span className="text-xs sm:text-sm">
        {showProductForm ? "Close Form" : "Add New Product"}
      </span>
    </button>
    {/* Refresh Button - Icon Only */}
  <button 
    className="p-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors duration-200 flex items-center justify-center w-full sm:w-auto"
    onClick={() => refresh()}
    title="Refresh"
  >
    <FiRefreshCw className="w-4 h-4" />
  </button>
  </div>
</div>

      {/* Tab Navigation - New Design */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-4 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setMode("product");
              setSelectedProducts([]);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
              mode === "product"
                ? 'bg-amber-500 text-white'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Active Products ({products.length})
          </button>
          <button
            onClick={() => {
              setMode("archive");
              setSelectedProducts([]);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
              mode === "archive"
                ? 'bg-amber-500 text-white'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Archived ({archived.length})
          </button>
        </div>
      </div>

      {/* Search and Filter Bar - Enhanced Design */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
            </div>
           <input
  type="text"
  placeholder="Search products by name or code..."
  value={searchText}
  onChange={handleSearch}
  className="block w-full pl-10 sm:pl-12 pr-3 py-2 sm:py-3 border border-amber-200 rounded-xl bg-amber-50 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base text-black"
/>
          </div>
          <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => handleDropDown(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-amber-200 rounded-xl bg-white text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
            >
              <option value="">All Categories</option>
              {[
                "Beverages",
                "Snacks",
                "Dairy",
                "Fruits & Vegetables",
                "Grains & Cereals",
                "Frozen Food",
                "Condiments & Sauces",
                "Cleaning Supplies",
                "Personal Care",
                "Household Essentials",
                "Others",
              ].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions - New Feature */}
      {selectedProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-amber-800 font-semibold">
              {selectedProducts.length} product(s) selected
            </p>
            <div className="flex space-x-2">
              {mode === "product" ? (
                <button
                  onClick={handleBulkArchive}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <FiArchive className="w-4 h-4" />
                  <span>Archive Selected</span>
                </button>
              ) : (
                <button
                  onClick={handleBulkUnarchive}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <FiArchive className="w-4 h-4" />
                  <span>Unarchive Selected</span>
                </button>
              )}
              <button
                onClick={() => setSelectedProducts([])}
                className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg font-semibold hover:bg-amber-50 transition-colors duration-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table - Enhanced Design */}
      <div className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-linear-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === tableData.length && tableData.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Retail Price
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Buying Price
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  QR Code
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {loading ? (
                <tr>
                  <td colSpan="12" className="px-6 py-8 sm:py-12 text-center">
                    <div className="text-amber-500">
                      <FiPackage className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                      <p className="text-base sm:text-lg font-medium">Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : tableData.length > 0 ? (
                tableData.map((item, idx) => (
                  <tr 
                    key={item.id ?? idx}
                    className="hover:bg-amber-50 transition-colors duration-150"
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(item.id)}
                        onChange={() => toggleProductSelection(item.id)}
                        className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 bg-amber-100 px-2 sm:px-3 py-1 rounded-full">
                        {item.id}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-linear-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm mr-2 sm:mr-3">
                          <FiPackage className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {item.product_Name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-xs sm:text-sm text-gray-600">{item.product_Description}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-xs sm:text-sm font-semibold text-green-600">
                        ₱{parseFloat(item.product_RetailPrice || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-xs sm:text-sm font-semibold text-amber-600">
                        ₱{parseFloat(item.product_BuyingPrice || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-xs sm:text-sm text-gray-600">{item.product_Category}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-xs sm:text-sm text-gray-600">{item.product_Stock}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(item.product_Stock)}`}>
                        {getStatusText(item.product_Stock)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-xs sm:text-sm text-gray-600">
                        {item.product_Expiry ? new Date(item.product_Expiry).toISOString().split("T")[0] : 'N/A'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <QRCodeSVG
                        id={`qr-${item.id}`}
                        value={item.QrCodeValue || `${window.location.origin}/scan/${item.id}`}
                        size={48}
                      />
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1 sm:p-2 text-amber-600 hover:text-amber-500 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                          title="Edit Product"
                        >
                          <FiEdit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        {mode === "product" ? (
                          <>
                            <button
                              onClick={() => setShowArchiveConfirm(item.id)}
                              className="p-1 sm:p-2 text-amber-600 hover:text-amber-500 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                              title="Archive Product"
                            >
                              <FiArchive className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                           <button
  className="p-1 sm:p-2 text-red-600 hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
  onClick={() => handleDelete(item.id, item.product_Stock)}
  title="Delete Product"
>
  <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
</button>

                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setShowUnarchiveConfirm(item.id)}
                              className="p-1 sm:p-2 text-green-600 hover:text-green-500 hover:bg-green-100 rounded-lg transition-colors duration-200"
                              title="Unarchive Product"
                            >
                              <FiArchive className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button className="btn btn-sm btn-success" onClick={() => handleAddBack(item.id)}>
                              Add Back
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="px-6 py-8 sm:py-12 text-center">
                    <div className="text-amber-500">
                      <FiPackage className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                      <p className="text-base sm:text-lg font-medium">No {mode === "product" ? "products" : "archived products"} found</p>
                      <p className="text-xs sm:text-sm">Try adjusting your search terms or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && (
          <div className="flex justify-center items-center gap-4 mt-4 p-4 border-t border-amber-100">
            <button
              className="btn btn-sm"
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                refresh(Math.max(1, page - 1));
              }}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="text-sm text-amber-700">
              Page <strong>{page}</strong> of {totalPages}
            </span>
            <button
              className="btn btn-sm"
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                refresh(Math.min(totalPages, page + 1));
              }}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

{/* Product Form - Modal Popup */}
{showProductForm && !editing && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-amber-100 sticky top-0 bg-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-700 to-orange-800">
            Add New Product
          </h2>
          <button
            onClick={() => setShowProductForm(false)}
            className="p-2 hover:bg-amber-100 rounded-lg transition-colors duration-200"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              value={form.p_Name}
              onChange={(e) => setForm((f) => ({ ...f, p_Name: e.target.value }))}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
              required
            />
            {errors.product_Name && (
              <p className="text-red-500 text-sm mt-2">{errors.product_Name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              placeholder="Enter product description"
              value={form.p_Desc}
              onChange={(e) => setForm((f) => ({ ...f, p_Desc: e.target.value }))}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
              required
            />
            {errors.product_Description && (
              <p className="text-red-500 text-sm mt-2">{errors.product_Description}</p>
            )}
          </div>

          {/* Retail Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retail Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
              <input
                type="number"
                placeholder="0.00"
                value={form.p_Retail}
                onChange={(e) => setForm((f) => ({ ...f, p_Retail: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
                required
                step="0.01"
              />
            </div>
            {errors.product_RetailPrice && (
              <p className="text-red-500 text-sm mt-2">{errors.product_RetailPrice}</p>
            )}
          </div>

          {/* Buying Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buying Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
              <input
                type="number"
                placeholder="0.00"
                value={form.p_Buying}
                onChange={(e) => setForm((f) => ({ ...f, p_Buying: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
                required
                step="0.01"
              />
            </div>
            {errors.product_BuyingPrice && (
              <p className="text-red-500 text-sm mt-2">{errors.product_BuyingPrice}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity *
            </label>
            <input
              type="number"
              placeholder="Enter stock quantity"
              value={form.p_Stock}
              onChange={(e) => setForm((f) => ({ ...f, p_Stock: e.target.value }))}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
              required
            />
            {errors.product_Stock && (
              <p className="text-red-500 text-sm mt-2">{errors.product_Stock}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={form.p_Cat}
              onChange={(e) => setForm((f) => ({ ...f, p_Cat: e.target.value }))}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black"
              required
            >
              <option value="">Select Category</option>
              {[
                "Beverages",
                "Snacks",
                "Dairy",
                "Fruits & Vegetables",
                "Grains & Cereals",
                "Frozen Food",
                "Condiments & Sauces",
                "Cleaning Supplies",
                "Personal Care",
                "Household Essentials",
                "Others",
              ].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.product_Category && (
              <p className="text-red-500 text-sm mt-2">{errors.product_Category}</p>
            )}
          </div>

          {/* Expiry Date - Calendar with Black Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date *
            </label>
            <input
              type="date"
              value={form.p_Expiry}
              onChange={(e) => setForm((f) => ({ ...f, p_Expiry: e.target.value }))}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black [color-scheme:light]"
              required
            />
            {errors.product_Expiry && (
              <p className="text-red-500 text-sm mt-2">{errors.product_Expiry}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-3 pt-4 border-t border-amber-100">
          <button
            type="button"
            onClick={() => setShowProductForm(false)}
            className="flex-1 px-6 py-3 border border-amber-300 text-amber-700 rounded-xl font-semibold hover:bg-amber-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-linear-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <FiSave className="w-4 h-4" />
            <span>Create Product</span>
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* Edit Form - Modal Popup */}
{editing && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-amber-100 sticky top-0 bg-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-700 to-orange-800">
            Edit Product
          </h2>
          <button
            onClick={() => {
              setEditing(null);
              resetForm();
            }}
            className="p-2 hover:bg-amber-100 rounded-lg transition-colors duration-200"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              value={form.p_Name}
              onChange={(e) => setForm((f) => ({ ...f, p_Name: e.target.value }))}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
              required
            />
            {errors.product_Name && (
              <p className="text-red-500 text-sm mt-2">{errors.product_Name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              placeholder="Enter product description"
              value={form.p_Desc}
              onChange={(e) => setForm((f) => ({ ...f, p_Desc: e.target.value }))}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
              required
            />
            {errors.product_Description && (
              <p className="text-red-500 text-sm mt-2">{errors.product_Description}</p>
            )}
          </div>

          {/* Retail Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retail Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
              <input
                type="number"
                placeholder="0.00"
                value={form.p_Retail}
                onChange={(e) => setForm((f) => ({ ...f, p_Retail: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
                required
                step="0.01"
              />
            </div>
            {errors.product_RetailPrice && (
              <p className="text-red-500 text-sm mt-2">{errors.product_RetailPrice}</p>
            )}
          </div>

          {/* Buying Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buying Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
              <input
                type="number"
                placeholder="0.00"
                value={form.p_Buying}
                onChange={(e) => setForm((f) => ({ ...f, p_Buying: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
                required
                step="0.01"
              />
            </div>
            {errors.product_BuyingPrice && (
              <p className="text-red-500 text-sm mt-2">{errors.product_BuyingPrice}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity *
            </label>
            <input
              type="number"
              placeholder="Enter stock quantity"
              value={form.p_Stock}
              onChange={(e) => setForm((f) => ({ ...f, p_Stock: e.target.value }))}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black placeholder-gray-500"
              required
            />
            {errors.product_Stock && (
              <p className="text-red-500 text-sm mt-2">{errors.product_Stock}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={form.p_Cat}
              onChange={(e) => setForm((f) => ({ ...f, p_Cat: e.target.value }))}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black"
              required
            >
              <option value="">Select Category</option>
              {[
                "Beverages",
                "Snacks",
                "Dairy",
                "Fruits & Vegetables",
                "Grains & Cereals",
                "Frozen Food",
                "Condiments & Sauces",
                "Cleaning Supplies",
                "Personal Care",
                "Household Essentials",
                "Others",
              ].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.product_Category && (
              <p className="text-red-500 text-sm mt-2">{errors.product_Category}</p>
            )}
          </div>

          {/* Expiry Date - Calendar with Black Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date *
            </label>
            <input
              type="date"
              value={form.p_Expiry}
              onChange={(e) => setForm((f) => ({ ...f, p_Expiry: e.target.value }))}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white text-black [color-scheme:light]"
              required
            />
            {errors.product_Expiry && (
              <p className="text-red-500 text-sm mt-2">{errors.product_Expiry}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-3 pt-4 border-t border-amber-100">
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              resetForm();
            }}
            className="flex-1 px-6 py-3 border border-amber-300 text-amber-700 rounded-xl font-semibold hover:bg-amber-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-linear-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <FiSave className="w-4 h-4" />
            <span>Update Product</span>
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}