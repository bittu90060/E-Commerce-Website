import { useState } from "react";
import axios from "axios";
import { ArrowLeft, ImagePlus, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./AddProduct.css";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const token = localStorage.getItem("shopease-token") || "";

  function updateField(event) {
    setForm((old) => ({ ...old, [event.target.name]: event.target.value }));
  }

  function selectImage(event) {
    const file = event.target.files?.[0] || null;
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : "");
    setMessage("");
  }

  async function submitProduct(event) {
    event.preventDefault();
    setMessage("");
    setError(false);

    if (!token) {
      setError(true);
      setMessage("Please sign in with your admin account first.");
      return;
    }
    if (!image) {
      setError(true);
      setMessage("Please select a product image.");
      return;
    }
    if (Number(form.price) < 0 || Number(form.stock) < 0 || !Number.isInteger(Number(form.stock))) {
      setError(true);
      setMessage("Price must be 0 or more and stock must be a whole number.");
      return;
    }

    setSaving(true);
    const api = axios.create({
      baseURL: API,
      timeout: 30000,
      headers: { Authorization: `Bearer ${token}` },
    });

    try {
      const uploadData = new FormData();
      uploadData.append("image", image);

      const uploadResponse = await api.post("/uploads", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = uploadResponse.data?.imageUrl || uploadResponse.data?.url;
      if (!imageUrl) throw new Error("Image upload response did not include imageUrl.");

      await api.post("/products", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        image: imageUrl,
      });

      setMessage("Product created successfully!");
      setForm({ name: "", category: "", description: "", price: "", stock: "" });
      setImage(null);
      setPreview("");
    } catch (err) {
      console.error("Add product error:", err.response?.data || err.message);
      setError(true);
      setMessage(
        err.response?.data?.message ||
          (err.response?.status === 401
            ? "Session expired. Please sign in again."
            : err.response?.status === 403
              ? "This account is not an admin."
              : err.message || "Could not create product. Check the backend upload and product routes.")
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="add-product-page">
      <header className="add-product-topbar">
        <Link to="/" className="back-link"><ArrowLeft size={18} /> Back to store</Link>
        <span className="admin-tag">SHOPEASE · ADMIN</span>
      </header>

      <section className="add-product-wrap">
        <div className="add-product-heading">
          <span className="eyebrow">PRODUCT MANAGEMENT</span>
          <h1>Add a new product<span>.</span></h1>
          <p>Add product details and upload an image to your store.</p>
        </div>

        {message && (
          <div className={`product-message ${error ? "is-error" : "is-success"}`} role="status">
            {error ? <AlertCircle size={19} /> : <CheckCircle2 size={19} />}
            <span>{message}</span>
          </div>
        )}

        <form className="add-product-card" onSubmit={submitProduct}>
          <div className="add-product-fields">
            <label>Product name
              <input name="name" value={form.name} onChange={updateField} placeholder="e.g. Wireless Headphones" required maxLength={120} />
            </label>
            <label>Category
              <input name="category" value={form.category} onChange={updateField} placeholder="e.g. Electronics" required maxLength={60} />
            </label>
            <label className="field-full">Description
              <textarea name="description" value={form.description} onChange={updateField} placeholder="Describe the product..." rows={4} />
            </label>
            <label>Price (₹)
              <input name="price" value={form.price} onChange={updateField} type="number" min="0" step="0.01" placeholder="2499" required />
            </label>
            <label>Stock quantity
              <input name="stock" value={form.stock} onChange={updateField} type="number" min="0" step="1" placeholder="10" required />
            </label>
          </div>

          <div className="upload-section">
            <div>
              <h2>Product image</h2>
              <p>Choose a JPG, PNG or WebP image (maximum 5 MB).</p>
            </div>
            <label className="image-dropzone">
              {preview ? (
                <img src={preview} alt="Product preview" />
              ) : (
                <span className="upload-placeholder"><ImagePlus size={32} /><b>Select product image</b><small>Click to browse your computer</small></span>
              )}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={selectImage} hidden />
            </label>
            {image && <p className="selected-file">{image.name}</p>}
          </div>

          <div className="add-product-actions">
            <button type="button" className="secondary-button" onClick={() => navigate("/")}>Cancel</button>
            <button type="submit" className="submit-product-button" disabled={saving}>
              <UploadCloud size={18} /> {saving ? "Uploading…" : "Upload image & add product"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
