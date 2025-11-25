import React, { useEffect, useState } from "react";
import { usePackage } from "../hooks/usePackage";

export default function PackageManager() {
  const packgApi = usePackage();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    seller_Name: "",
    package_Name: "",
    buyer_Name: "",
    dropOff_Date: "",
    package_Size: "",
    price: "",
    handling_Fee: "",
    payment_Method: "",
    payment_Status: "unpaid",
    package_Status: "unclaimed",
  });

  function resetForm() {
    setForm({
      seller_Name: "",
      package_Name: "",
      buyer_Name: "",
      dropOff_Date: "",
      package_Size: "",
      price: "",
      handling_Fee: "",
      payment_Method: "",
      payment_Status: "unpaid",
      package_Status: "unclaimed",
    });
  }

  useEffect(() => {
    load();
    packgApi.getAllSellers();
  }, []);

  async function load() {
    setLoading(true);
    await packgApi.getAllPackage();
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const priceNumber = parseFloat(form.price) || 0;
    await packgApi.createPackage({ ...form, price: priceNumber });
    resetForm();
    setShowForm(false);
    load();
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const priceNumber = parseFloat(form.price) || 0;
    await packgApi.updatePackage({ id: editing.id, ...form, price: priceNumber });
    resetForm();
    setEditing(null);
    setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this package?")) return;
    await packgApi.deletePackage({ id });
    load();
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      seller_Name: p.seller_Name,
      package_Name: p.package_Name,
      buyer_Name: p.buyer_Name,
      dropOff_Date: p.dropOff_Date,
      package_Size: p.package_Size,
      price: p.price,
      handling_Fee: p.handling_Fee,
      payment_Method: p.payment_Method,
      payment_Status: p.payment_Status,
      package_Status: p.package_Status,
    });
    setShowForm(true);
  }

  const packages = packgApi.packages || [];
  const sellers = packgApi.sellers || [];

  const filteredPackages = packages.filter((p) => {
    const seller = p.seller_Name?.toLowerCase() || "";
    const buyer = p.buyer_Name?.toLowerCase() || "";
    const term = search.toLowerCase();

    return seller.includes(term) || buyer.includes(term);
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Package List</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setEditing(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Close Form" : "Add Package"}
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Seller or Customer Name"
          className="input input-bordered w-full md:w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="card bg-base-200 p-4 mb-6">
          <form
            onSubmit={editing ? handleUpdate : handleCreate}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <select
              className="input input-bordered"
              value={form.seller_Name}
              onChange={(e) => setForm({ ...form, seller_Name: e.target.value })}
              required
            >
              <option value="">Select Seller</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.seller_Name}>{s.seller_Name}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Package Name"
              className="input input-bordered"
              value={form.package_Name}
              onChange={(e) => setForm({ ...form, package_Name: e.target.value })}
              required
            />

            <input
              type="text"
              placeholder="Buyer Name"
              className="input input-bordered"
              value={form.buyer_Name}
              onChange={(e) => setForm({ ...form, buyer_Name: e.target.value })}
              required
            />

            <input
              type="date"
              className="input input-bordered"
              value={form.dropOff_Date}
              onChange={(e) => setForm({ ...form, dropOff_Date: e.target.value })}
              required
            />

            <div className="flex flex-col">
              <label className="mb-1">Package Size</label>
              <div className="flex gap-2">
                {["S", "M", "L"].map((size) => (
                  <button
                    type="button"
                    key={size}
                    className={`btn btn-sm ${form.package_Size === size ? "btn-success" : "btn-outline"}`}
                    onClick={() => setForm({ ...form, package_Size: size })}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="number"
              placeholder="Price"
              className="input input-bordered"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />

            <input
              type="number"
              placeholder="Handling Fee"
              className="input input-bordered"
              value={form.handling_Fee}
              onChange={(e) => setForm({ ...form, handling_Fee: e.target.value })}
              required
            />

            <div className="flex flex-col">
              <label className="mb-1">Payment Method</label>
              <div className="flex gap-2">
                {["cash", "gcash"].map((m) => (
                  <button
                    type="button"
                    key={m}
                    className={`btn btn-sm ${form.payment_Method === m ? "btn-success" : "btn-outline"}`}
                    onClick={() => setForm({ ...form, payment_Method: m })}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {editing && (
              <div className="flex flex-col">
                <label className="mb-1">Payment Status</label>
                <div className="flex gap-2">
                  {["paid", "unpaid"].map((s) => (
                    <button
                      type="button"
                      key={s}
                      className={`btn btn-sm ${form.payment_Status === s ? "btn-success" : "btn-outline"}`}
                      onClick={() => setForm({ ...form, payment_Status: s })}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {editing && (
              <div className="flex flex-col">
                <label className="mb-1">Package Status</label>
                <div className="flex gap-2">
                  {["claimed", "unclaimed"].map((s) => (
                    <button
                      type="button"
                      key={s}
                      className={`btn btn-sm ${form.package_Status === s ? "btn-success" : "btn-outline"}`}
                      onClick={() => setForm({ ...form, package_Status: s })}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary mt-4">
              {editing ? "Save Changes" : "Create Package"}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto bg-base-100 p-4 rounded-lg shadow">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Seller</th>
              <th>Package</th>
              <th>Buyer</th>
              <th>Drop Off</th>
              <th>Size</th>
              <th>Price</th>
              <th>Handling Fee</th>
              <th>Pay Method</th>
              <th>Payment Status</th>
              <th>Package Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="12">Loading...</td></tr>
            ) : filteredPackages.length === 0 ? (
              <tr><td colSpan="12">No packages found</td></tr>
            ) : (
              filteredPackages.map((p, idx) => (
                <tr key={p.id}>
                  <td>{idx + 1}</td>
                  <td>{p.seller_Name}</td>
                  <td>{p.package_Name}</td>
                  <td>{p.buyer_Name}</td>
                  <td>{p.dropOff_Date}</td>
                  <td>{p.package_Size}</td>
                  <td>{p.price}</td>
                  <td>{p.handling_Fee}</td>
                  <td>{p.payment_Method}</td>
                  <td>{p.payment_Status}</td>
                  <td>{p.package_Status}</td>
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
