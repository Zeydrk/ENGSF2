import React, { useEffect, useState } from "react";
import { usePackage } from "../hooks/usePackage";
import { QRCodeSVG } from "qrcode.react";

export default function PackageWithTable() {
  const packgApi = usePackage();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ seller_Name: "", pk_Name: "", r_Name: "", dSc: "" });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // load packages on mount
  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      await packgApi.getAllPackage();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ seller_Name: "", pk_Name: "", r_Name: "", dSc: "" });
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      if (!form.seller_Name?.trim() || !form.pk_Name?.trim() || !form.r_Name?.trim() || !form.dSc?.trim()) {
        setError("Seller Name, Package Name, Recipient Name, and Description are required");
        return;
      }

      const payload = {
        seller_Name: form.seller_Name?.trim() || "",
        package_Name: form.pk_Name?.trim() || "",
        recipient_Name: form.r_Name?.trim() || "",
        descrtion: form.dSc?.trim() || "",
      };

      await packgApi.createPackage(payload);
      resetForm();
      setShowForm(false);
      refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "Create failed");
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm("Delete this package? This action cannot be undone.");
    if (!ok) return;
    try {
      await packgApi.deletePackage({ id });
      refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "Delete failed");
    }
  }

  function openEdit(packg) {
    setEditing(packg);
    setForm({
      seller_Name: packg.seller_Name || "",
      pk_Name: packg.package_Name?.trim() || "",
      r_Name: packg.recipient_Name?.trim() || "",
      dSc: packg.descrtion || "",
    });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      if (!editing) return;

      const payload = {
        id: editing.id,
        seller_Name: form.seller_Name?.trim(),
        package_Name: form.pk_Name?.trim(),
        recipient_Name: form.r_Name?.trim(),
        descrtion: form.dSc?.trim(),
      };

      if (!payload.seller_Name || !payload.package_Name || !payload.recipient_Name || !payload.descrtion) {
        setError("All fields are required");
        return;
      }

      await packgApi.updatePackage(payload);
      setEditing(null);
      resetForm();
      refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "Update failed");
    }
  }

  const packages = packgApi.packages || [];

  // Filter suggestions for autocomplete
  const sellerSuggestions = Array.from(
    new Set(packages.map((p) => p.seller_Name).filter(Boolean))
  ).filter((name) =>
    name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Search logic
  function handleSearch() {
    if (!searchText.trim()) {
      setFilteredPackages(packages);
      return;
    }
    const result = packages.filter((p) =>
      p.seller_Name?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredPackages(result);
    setShowSuggestions(false);
  }

  useEffect(() => {
    setFilteredPackages(packages);
  }, [packages]);

  return (
    <div data-theme="autumn" className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-3">
        <h2 className="text-2xl font-semibold">Packages</h2>
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setShowForm((s) => !s);
              resetForm();
              setEditing(null);
              setError(null);
            }}
          >
            {showForm ? "Close" : "Add Package"}
          </button>
          <button className="btn btn-sm" onClick={refresh}>
            Refresh
          </button>
        </div>
      </div>

      {/* Search bar with suggestions */}
      <div className="relative mb-6">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search by seller name..."
            className="input input-bordered w-full"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          <button onClick={handleSearch} className="btn btn-primary">
            Search
          </button>
        </div>

        {showSuggestions && sellerSuggestions.length > 0 && (
          <ul className="absolute left-0 w-full bg-base-100 border rounded-md mt-1 max-h-40 overflow-y-auto z-10">
            {sellerSuggestions.map((name, idx) => (
              <li
                key={idx}
                className="p-2 hover:bg-base-200 cursor-pointer"
                onClick={() => {
                  setSearchText(name);
                  setShowSuggestions(false);
                  setFilteredPackages(
                    packages.filter(
                      (p) =>
                        p.seller_Name?.toLowerCase() === name.toLowerCase()
                    )
                  );
                }}
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert alert-error mb-4">
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Create / Edit form */}
      {showForm && !editing && (
        <div className="card bg-base-200 p-4 mb-6">
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          >
            <div>
              <label className="label">
                <span className="label-text">Seller Name</span>
              </label>
              <input
                type="text"
                name="seller_Name"
                value={form.seller_Name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, seller_Name: e.target.value }))
                }
                className="input input-bordered w-full"
                placeholder="Enter seller name"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Package Name</span>
              </label>
              <input
                type="text"
                name="pk_Name"
                value={form.pk_Name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pk_Name: e.target.value }))
                }
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Recipient Name</span>
              </label>
              <input
                type="text"
                name="r_Name"
                value={form.r_Name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, r_Name: e.target.value }))
                }
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <input
                type="text"
                name="dSc"
                value={form.dSc}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dSc: e.target.value }))
                }
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
          <h3 className="font-medium mb-2">Edit Package</h3>
          <form
            onSubmit={handleUpdate}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          >
            <div>
              <label className="label">
                <span className="label-text">Seller Name</span>
              </label>
              <input
                type="text"
                name="seller_Name"
                value={form.seller_Name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, seller_Name: e.target.value }))
                }
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Package Name</span>
              </label>
              <input
                type="text"
                name="pk_Name"
                value={form.pk_Name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pk_Name: e.target.value }))
                }
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Recipient Name</span>
              </label>
              <input
                type="text"
                name="r_Name"
                value={form.r_Name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, r_Name: e.target.value }))
                }
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <input
                type="text"
                name="dSc"
                value={form.dSc}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dSc: e.target.value }))
                }
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
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

      {/* Table */}
      <div className="overflow-x-auto bg-base-100 p-4 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Seller Name</th>
              <th>Package Name</th>
              <th>Recipient Name</th>
              <th>Description</th>
              <th>QR Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Loading...</td>
              </tr>
            ) : filteredPackages.length === 0 ? (
              <tr>
                <td colSpan="7">No packages found</td>
              </tr>
            ) : (
              filteredPackages.map((p, idx) => {
                const qrValue =
                  p.qrCodeValue || `${window.location.origin}/package/${p.id || ""}`;

                const downloadQR = () => {
                  const svgElement = document.getElementById(`qr-${p.id}`);
                  const svgData = new XMLSerializer().serializeToString(svgElement);
                  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${p.seller_Name || "package"}_QR.svg`;
                  link.click();
                  URL.revokeObjectURL(url);
                };

                return (
                  <tr key={p.id ?? idx}>
                    <th>{idx + 1}</th>
                    <td>{p.seller_Name}</td>
                    <td>{p.package_Name}</td>
                    <td>{p.recipient_Name}</td>
                    <td>{p.descrtion}</td>
                    <td>
                      <div className="flex flex-col items-center gap-1">
                        <QRCodeSVG id={`qr-${p.id}`} value={qrValue} size={64} />
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
