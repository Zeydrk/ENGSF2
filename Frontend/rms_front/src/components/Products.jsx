import React, { useEffect, useState } from "react";
import { useProduct } from "../hooks/useProduct";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";

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

  // Pagination & mode
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(7);
  const [mode, setMode] = useState("product");

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
  const input = e.target.value.toLowerCase();

  // clear old timer
  clearTimeout(debounceRef.current);

  debounceRef.current = setTimeout(() => {
    runSearch(input);
  }, 300);
}

async function runSearch(input) {
  if (input.trim() === '') {
    setFilteredResults(null);
    refresh();
    return;
  }

  setLoading(true);
  try {
    if (mode === "product") {
      await productApi.searchProduct(input);
    } else {
      await productApi.searchArchivedProduct(input);
    }

    setPage(1);
    setTotalPages(1);
    setFilteredResults(null);
  } catch (err) {
    setError(err?.message || "Search failed");
  } finally {
    setLoading(false);
  }
}

  // --- Category dropdown handler ---
  async function handleDropDown(option) {
    setLoading(true);
    setFilteredResults(null);
    try {
      if (mode === "product") await productApi.categorySort(option);
      else await productApi.categoryArchiveSort(option);
      setPage(1);
      setTotalPages(1);
    } catch (err) {
      setError("Dropdown failed: " + ((err && err.message) || ""));
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
  setErrors(validationErrors);

  if (Object.keys(validationErrors).length > 0) {
    // Stop submission
    return;
  }

  try {
    await productApi.createProduct(payload);
    resetForm();
    setShowProductForm(false);
    refresh();
  } catch (err) {
    setError(err.message || "Create failed");
  }
}


  async function handleDelete(id, stock) {
    if (!window.confirm("Delete this product? This action cannot be undone.")) return;
    if (stock > 0) {
      alert("Cannot delete a product with stock");
      return;
    }
    try {
      await productApi.deleteProduct({ id });
      refresh();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  async function handleArchive(id) {
    if (!window.confirm("Archive this product?")) return;
    try {
      await productApi.archiveProduct({ id });
      refresh();
    } catch (err) {
      setError(err.message || "Archive failed");
    }
  }

  async function handleAddBack(id) {
    try {
      await productApi.archiveAddBack({ id });
      refresh();
    } catch (err) {
      setError(err.message || "Add back failed");
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
    try {
      await productApi.updateProduct(payload);
      setEditing(null);
      resetForm();
      refresh();
    } catch (err) {
      setError(err.message || "Update failed");
    }
  }

  // --- Table data ---
  const tableData = filteredResults ?? (mode === "archive" ? archived : products);
  const showPagination = filteredResults === null;

  return (
    <div data-theme="autumn" className="p-6 min-h-screen bg-base-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">
          {mode === "product" ? "Products" : "Archived Products"}
        </h2>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-primary" onClick={() => setShowProductForm((s) => !s)}>
            {showProductForm ? "Close" : "Add Product"}
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setMode((prev) => (prev === "product" ? "archive" : "product"));
              setEditing(null);
              setShowProductForm(false);
              setShowCategoryForm(false);
              setPage(1);
              setFilteredResults(null);
            }}
          >
            {mode === "product" ? "Show Archives" : "Show Products"}
          </button>
          <button className="btn btn-sm" onClick={() => refresh()}>
            Refresh
          </button>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="search"
          placeholder={mode === "product" ? "Search Product" : "Search Archived"}
          onChange={handleSearch}
          className="input grow"
        />
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn m-1">
            Sort by
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
          >
            {[
              "Beverages",
              "Snacks",
              "Dairy",
              "Meat & Poultry",
              "Seafood",
              "Fruits & Vegetables",
              "Grains & Cereals",
              "Frozen Food",
              "Condiments & Sauces",
              "Cleaning Supplies",
              "Personal Care",
              "Household Essentials",
              "Others",
            ].map((cat) => (
              <li key={cat} onClick={() => handleDropDown(cat)}>
                <a>{cat}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* Product Form */}
 {showProductForm && !editing && (
  <div className="card bg-base-200 p-4 mb-6">
    <form
      onSubmit={handleCreate}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
    >
      {/* NAME */}
      <div>
        <input
          type="text"
          placeholder="Name"
          value={form.p_Name}
          onChange={(e) => setForm((f) => ({ ...f, p_Name: e.target.value }))}
          className="input input-bordered w-full"
          required
        />
        {errors.product_Name && (
          <p className="text-red-500 text-sm">{errors.product_Name}</p>
        )}
      </div>

      {/* DESCRIPTION */}
      <div>
        <input
          type="text"
          placeholder="Description"
          value={form.p_Desc}
          onChange={(e) => setForm((f) => ({ ...f, p_Desc: e.target.value }))}
          className="input input-bordered w-full"
          required
        />
        {errors.product_Description && (
          <p className="text-red-500 text-sm">{errors.product_Description}</p>
        )}
      </div>

      {/* RETAIL PRICE */}
      <div>
        <input
          type="number"
          placeholder="Retail Price"
          value={form.p_Retail}
          onChange={(e) =>
            setForm((f) => ({ ...f, p_Retail: e.target.value }))
          }
          className="input input-bordered w-full"
          required
        />
        {errors.product_RetailPrice && (
          <p className="text-red-500 text-sm">{errors.product_RetailPrice}</p>
        )}
      </div>

      {/* BUYING PRICE */}
      <div>
        <input
          type="number"
          placeholder="Buying Price"
          value={form.p_Buying}
          onChange={(e) =>
            setForm((f) => ({ ...f, p_Buying: e.target.value }))
          }
          className="input input-bordered w-full"
          required
        />
        {errors.product_BuyingPrice && (
          <p className="text-red-500 text-sm">{errors.product_BuyingPrice}</p>
        )}
      </div>

      {/* STOCK */}
      <div>
        <input
          type="number"
          placeholder="Stock"
          value={form.p_Stock}
          onChange={(e) =>
            setForm((f) => ({ ...f, p_Stock: e.target.value }))
          }
          className="input input-bordered w-full"
          required
        />
        {errors.product_Stock && (
          <p className="text-red-500 text-sm">{errors.product_Stock}</p>
        )}
      </div>

      {/* EXPIRY DATE */}
      <div>
        <input
          type="date"
          value={form.p_Expiry}
          onChange={(e) =>
            setForm((f) => ({ ...f, p_Expiry: e.target.value }))
          }
          className="input input-bordered w-full"
          required
        />
        {errors.product_Expiry && (
          <p className="text-red-500 text-sm">{errors.product_Expiry}</p>
        )}
      </div>

      {/* CATEGORY */}
      <div>
        <select
          value={form.p_Cat}
          onChange={(e) => setForm((f) => ({ ...f, p_Cat: e.target.value }))}
          className="select select-bordered w-full"
          required
        >
          <option value="">-- Select Category --</option>
          {[
            "Beverages",
            "Snacks",
            "Dairy",
            "Meat & Poultry",
            "Seafood",
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
          <p className="text-red-500 text-sm">{errors.product_Category}</p>
        )}
      </div>

      {/* SUBMIT */}
      <button type="submit" className="btn btn-success w-full">
        Create
      </button>
    </form>
  </div>
)}

      {/* Edit Form */}
     {editing && (
  <div className="card bg-base-200 p-4 mb-6">
    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">

      {/* Product Name */}
      <div>
        <label className="label">
          <span className="label-text">Product Name</span>
        </label>
        <input  
          type="text"
          value={form.p_Name}
          onChange={(e) => setForm((f) => ({ ...f, p_Name: e.target.value }))}
          className="input input-bordered w-full"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <input
          type="text"
          value={form.p_Desc}
          onChange={(e) => setForm((f) => ({ ...f, p_Desc: e.target.value }))}
          className="input input-bordered w-full"
          required
        />
      </div>

      {/* Retail Price */}
      <div>
        <label className="label">
          <span className="label-text">Retail Price</span>
        </label>
        <input
          type="number"
          value={form.p_Retail}
          onChange={(e) => setForm((f) => ({ ...f, p_Retail: e.target.value }))}
          className="input input-bordered w-full"
          required
        />
      </div>

      {/* Buying Price */}
      <div>
        <label className="label">
          <span className="label-text">Buying Price</span>
        </label>
        <input
          type="number"
          value={form.p_Buying}
          onChange={(e) => setForm((f) => ({ ...f, p_Buying: e.target.value }))}
          className="input input-bordered w-full"
          required
        />
      </div>

      {/* Stock */}
      <div>
        <label className="label">
          <span className="label-text">Stock</span>
        </label>
        <input
          type="number"
          value={form.p_Stock}
          onChange={(e) => setForm((f) => ({ ...f, p_Stock: e.target.value }))}
          className="input input-bordered w-full"
          required
        />
      </div>

      {/* Expiry Date */}
      <div>
        <label className="label">
          <span className="label-text">Expiry Date</span>
        </label>
        <input
          type="date"
          value={form.p_Expiry}
          onChange={(e) => setForm((f) => ({ ...f, p_Expiry: e.target.value }))}
          className="input input-bordered w-full"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="label">
          <span className="label-text">Category</span>
        </label>
        <select
          value={form.p_Cat}
          onChange={(e) => setForm((f) => ({ ...f, p_Cat: e.target.value }))}
          className="select select-bordered w-full"
          required
        >
          <option value="">-- Select Category --</option>
          {[
            "Beverages",
            "Snacks",
            "Dairy",
            "Meat & Poultry",
            "Seafood",
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
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-6">
        <button type="submit" className="btn btn-primary">Save</button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEditing(null);
            resetForm();
          }}
        >
          Cancel
        </button>
      </div>

    </form>
  </div>
)}

      {/* Products Table */}
      <div className="overflow-x-auto bg-base-100 p-4 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Description</th>
              <th>Retail Price</th>
              <th>Buying Price</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Expiry</th>
              <th>QR Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center text-gray-500 py-4">
                  Loading...
                </td>
              </tr>
            ) : tableData.length > 0 ? (
              tableData.map((item, idx) => (
                <tr key={item.id ?? idx}>
                  <th>{idx + 1}</th>
                  <td>{item.product_Name}</td>
                  <td>{item.product_Description}</td>
                  <td>₱{parseFloat(item.product_RetailPrice || 0).toFixed(2)}</td>
                  <td>₱{parseFloat(item.product_BuyingPrice || 0).toFixed(2)}</td>
                  <td>{item.product_Category}</td>
                  <td>{item.product_Stock}</td>
                  <td>{new Date(item.product_Expiry).toISOString().split("T")[0]}</td>
                  <td>
                    <QRCodeSVG
                      id={`qr-${item.id}`}
                      value={item.qrCodeValue || `${window.location.origin}/product/${item.id || ""}`}
                      size={64}
                    />
                  </td>
                  <td className="flex gap-2">
                    {mode === "product" ? (
                      <>
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(item)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDelete(item.id, item.product_Stock)}
                        >
                          Delete
                        </button>
                        <button className="btn btn-sm btn-warning" onClick={() => handleArchive(item.id)}>
                          Archive
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(item)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDelete(item.id, item.product_Stock)}
                        >
                          Delete
                        </button>
                        <button className="btn btn-sm btn-success" onClick={() => handleAddBack(item.id)}>
                          Add Back
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center text-gray-500 py-4">
                  No {mode === "product" ? "products" : "archived products"} found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {showPagination && (
          <div className="flex justify-center items-center gap-4 mt-4">
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
            <span>
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
    </div>
  );
}
