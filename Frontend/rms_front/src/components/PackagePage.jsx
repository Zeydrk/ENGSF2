import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function PackagePage() {
  const { id } = useParams();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/packages/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch package");
        return res.json();
      })
      .then(data => {
        setPackageData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading package...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!packageData) return <p>Package not found</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{packageData.package_Name}</h2>
      <p><strong>Seller Name:</strong> {packageData.seller_Name}</p>
      <p><strong>Recipient Name:</strong> {packageData.recipient_Name}</p>
      <p><strong>Description:</strong> {packageData.descrtion}</p>

      {packageData.qrCodePath && (
        <img
          src={`http://localhost:3000/${packageData.qrCodePath.replace(/^\//, "")}`}
          alt="Package QR"
          style={{ width: "150px", marginTop: "1rem" }}
        />
      )}
    </div>
  );
}

export default PackagePage;