import React, { useEffect, useState } from "react";
import { useProduct } from "../hooks/useProduct";
import {QRCodeSVG} from 'qrcode.react';

export default function ProductsWithTable() {
  const productApi = useProduct();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ p_Name: "", p_Price: "", p_Stock: "", p_Expiry: "" });
  const [editing, setEditing] = useState(null); // store product being edited
  const [error, setError] = useState(null);

  // load products on mount
  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      await productApi.getAllProducts(); 
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ p_Name: "", p_Price: "" , p_Stock: "", p_Expiry: ""});
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      // basic validation
      if (!form.p_Name?.trim() || form.p_Price === "" || form.p_Stock === "" || !form.p_Expiry || isNaN(new Date(form.p_Expiry).getTime())) {
        setError("Name and price are required");
        return;
      }

      const payload = {
        product_Name: form.p_Name.trim(),
        product_Price: parseFloat(form.p_Price),
        product_Stock: parseFloat(form.p_Stock),
        product_Expiry: new Date(form.p_Expiry).toISOString().split('T')[0]
      };

      if (isNaN(payload.product_Price)) {
        setError("Price must be a valid number");
        return;
      }
      if (isNaN(payload.product_Stock)){
        setError("Stock must be a valid number")
      }

      await productApi.createProducts(payload);
      resetForm();
      setShowForm(false);
      refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "Create failed");
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm("Delete this product? This action cannot be undone.");
    if (!ok) return;
    try {
      await productApi.deleteProduct({ id });
      refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "Delete failed");
    }
  }

  function openEdit(product) {
    setEditing(product);
    setForm({ p_Name: product.product_Name || "", p_Price: String(product.product_Price ?? "") || "", p_Stock: String(product.product_Stock ?? "") || "", p_Expiry:product.product_Expiry });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      if (!editing) return;
      const payload = {
        id: editing.id,
        product_Name: form.p_Name.trim(),
        product_Price: parseFloat(form.p_Price),
        product_Stock: parseFloat(form.p_Stock),
        product_Expiry: form.p_Date
      };

      if (isNaN(payload.product_Price)) {
        setError("Price must be a valid number");
        return;
      }

      await productApi.updateProduct(payload);
      setEditing(null);
      resetForm();
      refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "Update failed");
    }
  }

  const products = productApi.products || [];

  return (
    <div data-theme="autumn" className="p-6 min-h-screen bg-base-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Products</h2>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-primary" onClick={() => { setShowForm(s => !s); resetForm(); setEditing(null); setError(null); }}>
            {showForm ? "Close" : "Add Product"}
          </button>
          <button className="btn btn-sm" onClick={refresh}>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}

      {showForm && !editing && (
        <div className="card bg-base-200 p-4 mb-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="label">
                <span className="label-text">Product Name</span>
              </label>
              <input type="text" name="p_Name" value={form.p_Name} onChange={e => setForm(f => ({ ...f, p_Name: e.target.value }))} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Product Price</span>
              </label>
              <input type="number" step="0.01" name="p_Price" value={form.p_Price} onChange={e => setForm(f => ({ ...f, p_Price: e.target.value }))} className="input input-bordered w-full" />
            </div>
             <div>
              <label className="label">
                <span className="label-text">Product Stock</span>
              </label>
              <input type="number" step="0.01" name="p_Stock" value={form.p_Stock} onChange={e => setForm(f => ({ ...f, p_Stock: e.target.value }))} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Product Expiry</span>
              </label>
              <input type="date" name="p_Expiry" value={form.p_Expiry} onChange={e => setForm(f => ({ ...f, p_Expiry: e.target.value }))} className="input input-bordered w-full" />
            </div>
            <div>
              <button type="submit" className="btn btn-success w-full">Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit modal / inline editor */}
      {editing && (
        <div className="card bg-base-200 p-4 mb-6">
          <h3 className="font-medium mb-2">Edit Product</h3>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="label">
                <span className="label-text">Product Name</span>
              </label>
              <input type="text" name="p_Name" value={form.p_Name} onChange={e => setForm(f => ({ ...f, p_Name: e.target.value }))} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Product Price</span>
              </label>
              <input type="number" step="0.01" name="p_Price" value={form.p_Price} onChange={e => setForm(f => ({ ...f, p_Price: e.target.value }))} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Product Stock</span>
              </label>
              <input type="number" step="0.01" name="p_Stock" value={form.p_Stock} onChange={e => setForm(f => ({ ...f, p_Stock: e.target.value }))} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Product Expiry</span>
              </label>
              <input type="date" name="p_Expiry" value={form.p_Expiry} onChange={e => setForm(f => ({ ...f, p_Expiry: e.target.value }))} className="input input-bordered w-full" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn" onClick={() => { setEditing(null); resetForm(); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

     <div className="overflow-x-auto bg-base-100 p-4 rounded-lg shadow">
  <table className="table w-full">
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Price</th>
        <th>Stock</th>
        <th>Expiry</th>
        <th>QR Code</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr>
          <td colSpan="7">Loading...</td>
        </tr>
      ) : products.length === 0 ? (
        <tr>
          <td colSpan="7">No products found</td>
        </tr>
      ) : (
        products.map((p, idx) => {
          const qrValue =
            p.qrCodeValue ||
            `${window.location.origin}/product/${p.id || ""}`;

          // download helper for QR
          const downloadQR = () => {
            const svgElement = document.getElementById(`qr-${p.id}`);
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${p.product_Name || "product"}_QR.svg`;
            link.click();
            URL.revokeObjectURL(url);
          };

          return (
            <tr key={p.id ?? idx}>
              <th>{idx + 1}</th>
              <td>{p.product_Name}</td>
              <td>₱{typeof p.product_Price === "number"? p.product_Price.toFixed(2): parseFloat(p.product_Price || 0).toFixed(2)}</td>
              <td>{typeof p.product_Stock === "number"? p.product_Stock.toFixed(2): parseFloat(p.product_Stock || 0).toFixed(2)}</td>
              <td>{new Date(p.product_Expiry).toISOString().split("T")[0]}</td>
              <td>
                <div className="flex flex-col items-center gap-1">
                  <QRCodeSVG
                    id={`qr-${p.id}`}
                    value={qrValue}
                    size={64}
                  />
                  <button
                    className="btn btn-xs btn-outline btn-info"
                    onClick={downloadQR}
                  >
                    Download
                  </button>
                </div>
              </td>

              <td className="flex gap-2">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => openEdit(p)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          );
        })
      )}
    </tbody>
  </table>
</div>

    </div>
  );
}
