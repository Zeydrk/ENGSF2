import React, { useEffect, useState } from "react";
import { usePackage } from "../hooks/usePackage";
import {QRCodeSVG} from 'qrcode.react';

export default function PackageWithTable() {
  const packgApi = usePackage();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ s_Id: "", pk_Name: "", r_Name: "", dSc: "" });
  const [editing, setEditing] = useState(null); // store package being edited
  const [error, setError] = useState(null);

  // load package on mount
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
    setForm({ s_Id: "", pk_Name: "" , r_Name: "", dSc: ""});
  }

  async function handleCreate(e) {
      e.preventDefault();
      try {
        // Fixed validation - removed date check for description
        if (!form.s_Id || !form.pk_Name?.trim() || !form.r_Name?.trim() || !form.dSc?.trim()) {
          setError("ID, Name, Route Name, and Description are required");
          return;
        }
    
        const payload = {
          seller_Id: parseInt(form.s_Id) || 0,
          package_Name: form.pk_Name?.trim() || "",
          recipient_Name: form.r_Name?.trim() || "", 
          description: form.dSc?.trim() || ""
        };
    
        if (isNaN(payload.seller_Id)) {
          setError("ID must be a valid number");
          return;
        }
    
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
    const ok = window.confirm("Delete this packg? This action cannot be undone.");
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
        s_Id: packg.seller_Id || "", 
        pk_Name: packg.package_Name?.trim() || "", 
        r_Name: packg.recipient_Name?.trim() || "", 
        dSc: packg.description || "" 
      });
    }

  async function handleUpdate(e) {
     e.preventDefault();
     try {
       if (!editing) return;
       
       const payload = {
         id: editing.id,
         seller_Id: form.s_Id,  
         package_Name: form.pk_Name?.trim(),  
         recipient_Name: form.r_Name?.trim(), 
         description: form.dSc?.trim() 
       };

       if (!payload.seller_Id || !payload.package_Name || !payload.recipient_Name || !payload.description) {
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

  return (
    <div data-theme="autumn" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">packages</h2>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-primary" onClick={() => { setShowForm(s => !s); resetForm(); setEditing(null); setError(null); }}>
            {showForm ? "Close" : "Add package"}
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
                <span className="label-text">Seller ID</span>
              </label>
              <input 
                type="text" 
                name="s_Id" 
                value={form.s_Id} 
                onChange={e => setForm(f => ({ ...f, s_Id: e.target.value }))} 
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
                onChange={e => setForm(f => ({ ...f, pk_Name: e.target.value }))} 
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
                onChange={e => setForm(f => ({ ...f, r_Name: e.target.value }))} 
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
                onChange={e => setForm(f => ({ ...f, dSc: e.target.value }))} 
                className="input input-bordered w-full" 
              />
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
            <h3 className="font-medium mb-2">Edit Packages</h3>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="label">
                  <span className="label-text">Seller ID</span>
                </label>
                <input 
                  type="text" 
                  name="s_Id" 
                  value={form.s_Id} 
                  onChange={e => setForm(f => ({ ...f, s_Id: e.target.value }))} 
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
                  onChange={e => setForm(f => ({ ...f, pk_Name: e.target.value }))} 
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
                  onChange={e => setForm(f => ({ ...f, r_Name: e.target.value }))} 
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
                  onChange={e => setForm(f => ({ ...f, dSc: e.target.value }))} 
                  className="input input-bordered w-full" 
                />
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
        <th>Seller's Id</th>
        <th>Package Name</th>
        <th>Receipt Name</th>
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
      ) : packages.length === 0 ? (
        <tr>
          <td colSpan="7">No packages found</td>
        </tr>
      ) : (
        packages.map((p, idx) => {
          const qrValue =
            p.qrCodeValue ||
            `${window.location.origin}/package/${p.id || ""}`;

          // download helper for QR
          const downloadQR = () => {
            const svgElement = document.getElementById(`qr-${p.id}`);
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${p.seller_Id || "packg"}_QR.svg`;
            link.click();
            URL.revokeObjectURL(url);
          };

          return (
              <tr key={p.id ?? idx}>
                <th>{idx + 1}</th>
                <td>{p.seller_Id}</td>
                <td>{p.package_Name}</td>
                <td>{p.recipient_Name}</td>
                <td>{p.description}</td>
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
