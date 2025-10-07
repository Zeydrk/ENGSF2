import React, { useEffect, useState } from "react";
import { useProduct } from "../hooks/Products/useProduct";

<<<<<<< Updated upstream
export default function  Products(){
    const [showForm, setShowForm] = useState(false);
    const productServices = useProducts();
=======
export default function ProductsWithTable() {
  const productApi = useProduct();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ p_Name: "", p_Price: "" });
  const [editing, setEditing] = useState(null); // store product being edited
  const [error, setError] = useState(null);
>>>>>>> Stashed changes

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
    setForm({ p_Name: "", p_Price: "" });
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      // basic validation
      if (!form.p_Name?.trim() || form.p_Price === "") {
        setError("Name and price are required");
        return;
      }

      const payload = {
        product_Name: form.p_Name.trim(),
        product_Price: parseFloat(form.p_Price)
      };

      if (isNaN(payload.product_Price)) {
        setError("Price must be a valid number");
        return;
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
    setForm({ p_Name: product.product_Name || "", p_Price: String(product.product_Price ?? "") });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      if (!editing) return;
      const payload = {
        id: editing.id,
        product_Name: form.p_Name.trim(),
        product_Price: parseFloat(form.p_Price)
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
<<<<<<< Updated upstream
   <div className='products'>
    <div className='viewProduct'>
      {productServices.products.map(product => (
        <div className='mt-6'>
          <div>
            <span className='mb-2'>ID:</span>
            {product.id}
          </div>
          <div>
            <span className='mb-2'>Product Name:</span>
            {product.product_Name}
          </div>
          <div>
            <span className='mb-2'>Product Price:</span>
            {product.product_Price}
          </div>
        </div>
      ))
        
      }      
    </div>
   
    <div className='createProduct'>
        <button  onClick={handleForm}>Add Product </button>
        {showForm && <FormComponent/>}
    </div>
    </div>
  )
}
=======
    <div data-theme="autumn" className="p-6">
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
>>>>>>> Stashed changes

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4">Loading...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="4">No products found</td>
              </tr>
            ) : (
              products.map((p, idx) => (
                <tr key={p.id ?? idx}>
                  <th>{idx + 1}</th>
                  <td>{p.product_Name}</td>
                  <td>{typeof p.product_Price === 'number' ? `₱${p.product_Price.toFixed(2)}` : `₱${parseFloat(p.product_Price || 0).toFixed(2)}`}</td>
                  <td className="flex gap-2">
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-sm btn-error" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
