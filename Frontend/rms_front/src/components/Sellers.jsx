import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SellersWithTable() {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    seller_FName: "",
    seller_MName: "",
    seller_LName: "",
    seller_Phone: "",
    seller_Email: ""
  });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [sellers, setSellers] = useState([]);
  const API_URL = "http://localhost:3000/sellers";

  useEffect(() => {
    loadSellers();
  }, []);

  async function loadSellers() {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setSellers(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      seller_FName: "",
      seller_MName: "",
      seller_LName: "",
      seller_Phone: "",
      seller_Email: ""
    });
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      if (!form.seller_FName?.trim() || !form.seller_LName?.trim()) {
        setError("First and last name are required");
        return;
      }

      const payload = {
        seller_FName: form.seller_FName.trim(),
        seller_MName: form.seller_MName.trim(),
        seller_LName: form.seller_LName.trim(),
        seller_Phone: form.seller_Phone?.trim() || null,
        seller_Email: form.seller_Email?.trim() || null,
      };

      await axios.post(`${API_URL}/create`, payload);
      resetForm();
      setShowForm(false);
      loadSellers();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Create failed");
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm("Delete this seller? This action cannot be undone.");
    if (!ok) return;
    try {
      await axios.post(`${API_URL}/delete`, { id });
      loadSellers();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Delete failed");
    }
  }

  function openEdit(seller) {
    setEditing(seller);
    setForm({
      seller_FName: seller.seller_FName || "",
      seller_MName: seller.seller_MName || "",
      seller_LName: seller.seller_LName || "",
      seller_Phone: seller.seller_Phone || "",
      seller_Email: seller.seller_Email || ""
    });
    setShowForm(false);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      if (!editing) return;
      const payload = {
        id: editing.id,
        seller_FName: form.seller_FName.trim(),
        seller_MName: form.seller_MName.trim(),
        seller_LName: form.seller_LName.trim(),
        seller_Phone: form.seller_Phone?.trim() || null,
        seller_Email: form.seller_Email?.trim() || null,
      };
      await axios.post(`${API_URL}/update`, payload);
      setEditing(null);
      resetForm();
      loadSellers();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Update failed");
    }
  }

  return (
    <div data-theme="autumn" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Sellers</h2>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            setShowForm(s => !s);
            resetForm();
            setEditing(null);
            setError(null);
          }}
        >
          {showForm ? "Close" : "Add Seller"}
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Create form */}
      {showForm && !editing && (
        <div className="card bg-base-200 p-4 mb-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                name="seller_FName"
                value={form.seller_FName}
                onChange={e => setForm(f => ({ ...f, seller_FName: e.target.value }))}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Middle Name</span>
              </label>
              <input
                type="text"
                name="seller_MName"
                value={form.seller_MName}
                onChange={e => setForm(f => ({ ...f, seller_MName: e.target.value }))}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>
              <input
                type="text"
                name="seller_LName"
                value={form.seller_LName}
                onChange={e => setForm(f => ({ ...f, seller_LName: e.target.value }))}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Phone</span>
              </label>
              <input
                type="tel"
                name="seller_Phone"
                value={form.seller_Phone}
                onChange={e => setForm(f => ({ ...f, seller_Phone: e.target.value }))}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="seller_Email"
                value={form.seller_Email}
                onChange={e => setForm(f => ({ ...f, seller_Email: e.target.value }))}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <button type="submit" className="btn btn-success w-full">
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <div className="card bg-base-200 p-4 mb-6">
          <h3 className="font-medium mb-2">Edit Seller</h3>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                name="seller_FName"
                value={form.seller_FName}
                onChange={e => setForm(f => ({ ...f, seller_FName: e.target.value }))}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Middle Name</span>
              </label>
              <input
                type="text"
                name="seller_MName"
                value={form.seller_MName}
                onChange={e => setForm(f => ({ ...f, seller_MName: e.target.value }))}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>
              <input
                type="text"
                name="seller_LName"
                value={form.seller_LName}
                onChange={e => setForm(f => ({ ...f, seller_LName: e.target.value }))}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Phone</span>
              </label>
              <input
                type="tel"
                name="seller_Phone"
                value={form.seller_Phone}
                onChange={e => setForm(f => ({ ...f, seller_Phone: e.target.value }))}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="seller_Email"
                value={form.seller_Email}
                onChange={e => setForm(f => ({ ...f, seller_Email: e.target.value }))}
                className="input input-bordered w-full"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn" onClick={() => { setEditing(null); resetForm(); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto bg-base-100 p-4 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Last Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Loading...</td>
              </tr>
            ) : sellers.length === 0 ? (
              <tr>
                <td colSpan="7">No sellers found</td>
              </tr>
            ) : (
              sellers.map((s, idx) => (
                <tr key={s.id ?? idx}>
                  <th>{idx + 1}</th>
                  <td>{s.seller_FName}</td>
                  <td>{s.seller_MName}</td>
                  <td>{s.seller_LName}</td>
                  <td>{s.seller_Phone}</td>
                  <td>{s.seller_Email}</td>
                  <td className="flex gap-2">
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn btn-sm btn-error" onClick={() => handleDelete(s.id)}>Delete</button>
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
