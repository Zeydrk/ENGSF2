import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function PackagePage() {
  const { id } = useParams();
  const [packages, setPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  [error, setError] = useState(null);

  useEffect(() => {
    // Fetch packages details from backend
    fetch(`http://localhost:3000/packages/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch packages");
        return res.json();
      })
      .then(data => {
        setPackage(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading packages...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!packages) return <p>Package not found</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{packages.package_Name}</h2>
      <p><strong>Seller ID:</strong> {packages.seller_Id}</p>
      <p><strong>Recipient Name:</strong> {packages.recipient_Name}</p>
      <p><strong>Description:</strong> {packages.descrtion}</p> {/* Fixed field name */}

      {packages.qrCodePath && (
        <img
          src={`http://localhost:3000/${packages.qrCodePath.replace(/^\//, "")}`}
          alt="Package QR"
          style={{ width: "150px", marginTop: "1rem" }}
        />
      )}
    </div>
  );
}

export default PackagePage;