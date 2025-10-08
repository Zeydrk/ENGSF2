import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch product details from backend
    fetch(`http://localhost:3000/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading product...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{product.product_Name}</h2>
      <p><strong>Price:</strong> ₱{product.product_Price}</p>
      <p><strong>Stock:</strong> {product.product_Stock}</p>
      <p><strong>Expiry:</strong> {new Date(product.product_Expiry).toISOString().split('T')[0]}</p>

      {product.product_QrCodePath && (
        <img
          src={`http://localhost:3000/${product.product_QrCodePath.replace(/^\//, "")}`}
          alt="Product QR"
          style={{ width: "150px", marginTop: "1rem" }}
        />
      )}
    </div>
  );
}

export default ProductPage;
