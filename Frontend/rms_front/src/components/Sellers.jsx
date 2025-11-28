import React, { useEffect, useState } from "react";
import { useSeller } from "../hooks/useSeller";

export default function SellerManager() {
  const { sellers, getAllSellers, createSeller, updateSeller, deleteSeller, claimSeller } = useSeller();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    seller_Name: "",
    seller_Email: "",
    seller_Phone: "",
  });

  useEffect(() => {
    loadSellers();
  }, []);

  async function loadSellers() {
    setLoading(true);
    await getAllSellers();
    setLoading(false);
  }

  function resetForm() {
    setForm({ seller_Name: "", seller_Email: "", seller_Phone: "" });
  }

  async function handleCreate(e) {
    e.preventDefault();
    await createSeller(form);
    resetForm();
    setShowForm(false);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    await updateSeller({ id: editing.id, ...form });
    resetForm();
    setEditing(null);
    setShowForm(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this seller?")) return;
    await deleteSeller(id);
  }

  async function handleClaim(id) {
    if (!window.confirm("Confirm claim? This will reset balance and delete claimed packages.")) return;
    await claimSeller(id); // <-- NEW
  }

  function openEdit(s) {
    setEditing(s);
    setForm({
      seller_Name: s.seller_Name,
      seller_Email: s.seller_Email,
      seller_Phone: s.seller_Phone,
    });
    setShowForm(true);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Sellers</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => { resetForm(); setEditing(null); setShowForm(s => !s); }}
        >
          {showForm ? "Close Form" : "Add Seller"}
        </button>
      </div>

      {showForm && (
        <div className="card bg-base-200 p-4 mb-6">
          <form onSubmit={editing ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Seller Name"
              className="input input-bordered"
              value={form.seller_Name}
              onChange={e => setForm({ ...form, seller_Name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered"
              value={form.seller_Email}
              onChange={e => setForm({ ...form, seller_Email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone"
              className="input input-bordered"
              value={form.seller_Phone}
              onChange={e => setForm({ ...form, seller_Phone: e.target.value })}
            />
            <button type="submit" className="btn btn-success mt-2">
              {editing ? "Save Changes" : "Create Seller"}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto bg-base-100 p-4 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Seller Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Balance</th>
              <th>Actions</th>
              <th>Cashout</th> {/* NEW COLUMN */}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7">Loading...</td></tr>
            ) : sellers.length === 0 ? (
              <tr><td colSpan="7">No sellers found</td></tr>
            ) : (
              sellers.map((s, idx) => (
                <tr key={s.id}>
                  <td>{idx + 1}</td>
                  <td>{s.seller_Name}</td>
                  <td>{s.seller_Email}</td>
                  <td>{s.seller_Phone}</td>
                  <td>{s.balance}</td>
                  <td className="flex gap-2">
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn btn-sm btn-error" onClick={() => handleDelete(s.id)}>Delete</button>
                  </td>

                  {/* NEW CLAIM BUTTON */}
                  <td>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleClaim(s.id)}
                    >
                      Cashout
                    </button>
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
