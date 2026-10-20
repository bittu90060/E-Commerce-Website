import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  LogIn,
  LogOut,
  Package,
  X,
  CheckCircle2,
  RefreshCw,
  ImagePlus,
  Upload,
} from "lucide-react";
import "./styles.css";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");
const FALLBACK_IMAGE = "https://placehold.co/600x600?text=Product";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

const demoProducts = [
  {
    _id: "demo-1",
    name: "Everyday Backpack",
    category: "Accessories",
    price: 1299,
    stock: 12,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
    description: "A lightweight everyday backpack.",
  },
  {
    _id: "demo-2",
    name: "Wireless Headphones",
    category: "Electronics",
    price: 2499,
    stock: 8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    description: "Comfortable headphones for work and travel.",
  },
  {
    _id: "demo-3",
    name: "Classic Watch",
    category: "Accessories",
    price: 1899,
    stock: 10,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800",
    description: "A clean, classic everyday watch.",
  },
  {
    _id: "demo-4",
    name: "Running Sneakers",
    category: "Fashion",
    price: 2999,
    stock: 6,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    description: "Lightweight sneakers for active days.",
  },
  {
    _id: "demo-5",
    name: "Ceramic Coffee Mug",
    category: "Home",
    price: 399,
    stock: 20,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558f9f933?w=800",
    description: "A simple mug for your daily coffee.",
  },
  {
    _id: "demo-6",
    name: "Desk Lamp",
    category: "Home",
    price: 999,
    stock: 9,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800",
    description: "Warm light for your desk or bedside.",
  },
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = readStorage("shopease-cart", []);
    return Array.isArray(saved) ? saved : [];
  });
  const [user, setUser] = useState(() => readStorage("shopease-user", null));
  const [token, setToken] = useState(
    () => localStorage.getItem("shopease-token") || "",
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [notice, setNotice] = useState("");
  const [panel, setPanel] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [shippingAddress, setShippingAddress] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [usingDemo, setUsingDemo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const api = useMemo(
    () =>
      axios.create({
        baseURL: API,
        timeout: 20000,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
    [token],
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/products`, { timeout: 15000 });
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.products;
      if (!Array.isArray(data))
        throw new Error(
          "Products API must return an array or { products: [] }.",
        );
      const uniqueProducts = [
        ...new Map(
          data.map((product, index) => [
            product._id || `product-${index}`,
            product,
          ]),
        ).values(),
      ];
      setProducts(uniqueProducts);
      setApiOnline(true);
      setUsingDemo(false);
    } catch (error) {
      console.error(
        "Product loading error:",
        error.response?.data || error.message,
      );
      setProducts(demoProducts);
      setApiOnline(false);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);
  useEffect(() => {
    localStorage.setItem("shopease-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    if (user) localStorage.setItem("shopease-user", JSON.stringify(user));
    else localStorage.removeItem("shopease-user");
  }, [user]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );

  const categories = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];
  const visible = products.filter((product) => {
    const text =
      `${product.name || ""} ${product.description || ""}`.toLowerCase();
    return (
      text.includes(search.trim().toLowerCase()) &&
      (category === "All" || product.category === category)
    );
  });
  const cartCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  function addToCart(product) {
    if (Number(product.stock) < 1)
      return setNotice("This product is out of stock.");
    setCart((oldCart) => {
      const existing = oldCart.find((item) => item._id === product._id);
      if (existing) {
        return oldCart.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, Number(product.stock)),
              }
            : item,
        );
      }
      return [
        ...oldCart,
        {
          _id: product._id,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.image || FALLBACK_IMAGE,
          stock: Number(product.stock) || 0,
          quantity: 1,
        },
      ];
    });
    setNotice(`${product.name} added to cart.`);
  }

  function changeQty(id, delta) {
    setCart((oldCart) =>
      oldCart
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0 && item.quantity <= item.stock),
    );
  }

  function logout() {
    setToken("");
    setUser(null);
    localStorage.removeItem("shopease-token");
    localStorage.removeItem("shopease-user");
    setOrders([]);
    setPanel("");
    setNotice("You have logged out.");
  }

  async function submitAuth(event) {
    event.preventDefault();
    try {
      const path = authMode === "login" ? "login" : "register";
      const response = await axios.post(`${API}/auth/${path}`, authForm, {
        timeout: 15000,
      });
      const receivedToken = response.data?.token;
      const receivedUser = response.data?.user;
      if (!receivedToken || !receivedUser)
        throw new Error("Login response must contain token and user.");
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem("shopease-token", receivedToken);
      localStorage.setItem("shopease-user", JSON.stringify(receivedUser));
      setAuthForm({ name: "", email: "", password: "" });
      setPanel("");
      setNotice(`Welcome${receivedUser.name ? `, ${receivedUser.name}` : ""}!`);
    } catch (error) {
      console.error(
        "Authentication error:",
        error.response?.data || error.message,
      );
      setNotice(
        error.response?.data?.message ||
          error.message ||
          "Could not sign in. Check your backend.",
      );
    }
  }

  async function checkout(event) {
    event.preventDefault();
    if (!cart.length) return setNotice("Your cart is empty.");
    if (!user || !token) {
      setAuthMode("login");
      setPanel("auth");
      return setNotice("Please sign in before checkout.");
    }
    if (
      !apiOnline ||
      usingDemo ||
      cart.some((item) => String(item._id).startsWith("demo-"))
    ) {
      return setNotice(
        "Preview products cannot be ordered. Connect the backend and use database products.",
      );
    }
    try {
      await api.post("/orders", {
        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        shippingAddress,
      });
      setCart([]);
      setShippingAddress("");
      setPanel("");
      setNotice("Order placed successfully!");
      await loadProducts();
    } catch (error) {
      console.error("Checkout error:", error.response?.data || error.message);
      setNotice(
        error.response?.data?.message ||
          "Could not place order. Please try again.",
      );
    }
  }

  async function loadOrders() {
    if (!token) {
      setAuthMode("login");
      setPanel("auth");
      return setNotice("Please sign in to view your orders.");
    }
    try {
      const response = await api.get("/orders/my");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.orders;
      setOrders(Array.isArray(data) ? data : []);
      setPanel("orders");
    } catch (error) {
      console.error("Orders error:", error.response?.data || error.message);
      setNotice(
        error.response?.data?.message ||
          "Could not load your orders. Please sign in again.",
      );
    }
  }

  function onChooseImage(event) {
    const file = event.target.files?.[0] || null;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  }

  async function adminCreateProduct(event) {
    event.preventDefault();
    if (!user || user.role !== "admin" || !token)
      return setNotice("Please sign in with an admin account.");
    const form = new FormData(event.currentTarget);
    const data = {
      name: String(form.get("name") || "").trim(),
      category: String(form.get("category") || "").trim(),
      description: String(form.get("description") || "").trim(),
      price: Number(form.get("price")),
      stock: Number(form.get("stock")),
    };
    if (
      !data.name ||
      !data.category ||
      !Number.isFinite(data.price) ||
      data.price < 0 ||
      !Number.isInteger(data.stock) ||
      data.stock < 0
    ) {
      return setNotice("Please enter valid product details.");
    }
    if (!selectedImage) return setNotice("Please select a product image.");
    if (!apiOnline || usingDemo)
      return setNotice("Backend is offline. Please start the backend first.");

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("image", selectedImage);
      const uploadResponse = await api.post("/uploads", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl =
        uploadResponse.data?.imageUrl || uploadResponse.data?.url;
      if (!imageUrl)
        throw new Error("Upload response did not include imageUrl.");
      await api.post("/products", { ...data, image: imageUrl });
      setSelectedImage(null);
      setImagePreview("");
      event.currentTarget.reset();
      await loadProducts();
      setPanel("");
      setNotice("Product and image uploaded successfully.");
    } catch (error) {
      console.error(
        "Create product/upload error:",
        error.response?.data || error.message,
      );
      setNotice(
        error.response?.data?.message ||
          error.message ||
          "Could not create product. Check admin permissions and upload route.",
      );
    } finally {
      setUploading(false);
    }
  }

  function handleImageError(event) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_IMAGE;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPanel("");
            setSearch("");
            setCategory("All");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="brand-mark">
            <ShoppingBag size={21} />
          </span>
          <span>
            shop<span className="brand-accent">ease</span>
            <small>YOUR EVERYDAY STORE</small>
          </span>
        </a>
        <div className="searchbox">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, brands..."
            aria-label="Search products"
          />
          {search && (
            <button
              className="icon-btn"
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="top-actions">
          {user ? (
            <>
              <button className="text-btn" onClick={loadOrders}>
                <Package size={18} /> Orders
              </button>
              <span className="hello">
                Hi, {String(user.name || "User").split(" ")[0]}
              </span>
              <button className="icon-btn" title="Log out" onClick={logout}>
                <LogOut size={19} />
              </button>
            </>
          ) : (
            <button
              className="text-btn"
              onClick={() => {
                setAuthMode("login");
                setPanel("auth");
              }}
            >
              <LogIn size={18} /> Sign in
            </button>
          )}
          <button className="cart-btn" onClick={() => setPanel("cart")}>
            <ShoppingBag size={19} /> Cart <b>{cartCount}</b>
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">THE EVERYDAY EDIT</span>
            <h1>
              Good finds.
              <br />
              <em>Better living.</em>
            </h1>
            <p>
              Thoughtful essentials for your everyday life. Discover something
              you'll love.
            </p>
            <button
              className="primary-btn"
              onClick={() =>
                document
                  .getElementById("catalog")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore collection <span>↗</span>
            </button>
          </div>
          <div className="hero-art">
            <div className="sun" />
            <div className="hero-card card-back" />
            <div className="hero-card card-front">
              <span>NEW SEASON</span>
              <strong>
                Little things.
                <br />
                Big joy.
              </strong>
              <div className="orb" />
            </div>
            <div className="floating-tag">CURATED FOR YOU ✳</div>
          </div>
        </section>

        <section className="benefits">
          <div>
            <span>✳</span>
            <p>
              <b>Curated essentials</b>
              <small>Products picked for daily life</small>
            </p>
          </div>
          <div>
            <span>↗</span>
            <p>
              <b>Easy shopping</b>
              <small>Simple, clear checkout</small>
            </p>
          </div>
          <div>
            <span>♡</span>
            <p>
              <b>Made for you</b>
              <small>Find your next favourite</small>
            </p>
          </div>
        </section>

        <section id="catalog" className="catalog">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE COLLECTION</span>
              <h2>
                Shop the essentials<span>.</span>
              </h2>
            </div>
            <span className="product-count">{visible.length} PRODUCTS</span>
          </div>
          <div className="category-row">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "category active" : "category"}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="empty">
              <RefreshCw size={20} />
              <p>Loading your collection…</p>
            </div>
          ) : visible.length ? (
            <div className="product-grid">
              {visible.map((product, index) => (
                <article className="product-card" key={product._id}>
                  <div className={`product-image tone-${index % 4}`}>
                    <img
                      src={product.image || FALLBACK_IMAGE}
                      alt={product.name || "Product"}
                      loading="lazy"
                      onError={handleImageError}
                    />
                    <span className="product-label">
                      {Number(product.stock) > 0
                        ? index % 2
                          ? "EVERYDAY PICK"
                          : "BESTSELLER"
                        : "SOLD OUT"}
                    </span>
                    <button
                      className="quick-add"
                      onClick={() => addToCart(product)}
                      disabled={Number(product.stock) < 1}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      +
                    </button>
                  </div>
                  <div className="product-info">
                    <span className="product-category">
                      {product.category || "Essentials"}
                    </span>
                    <h3>{product.name || "Unnamed product"}</h3>
                    <div className="product-bottom">
                      <strong>{money(product.price)}</strong>
                      <span>
                        {Number(product.stock) > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">
              {products.length === 0 && !usingDemo
                ? "No products in the database yet."
                : "No products found. Try another search."}
              <p>
                {search
                  ? "Try clearing the search or selecting All categories."
                  : "Add products to your database to display them here."}
              </p>
              <button
                className="primary-btn"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  loadProducts();
                }}
              >
                <RefreshCw size={16} /> Refresh products
              </button>
            </div>
          )}
        </section>

        <section className="newsletter">
          <div>
            <span className="eyebrow">A LITTLE SOMETHING GOOD</span>
            <h2>
              Make room for
              <br />
              <em>the good stuff.</em>
            </h2>
            <p>Browse the collection and find your next everyday favourite.</p>
          </div>
          <button
            className="light-btn"
            onClick={() => {
              setSearch("");
              setCategory("All");
              document
                .getElementById("catalog")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Browse all products ↗
          </button>
        </section>
      </main>

      <footer>
        <a
          className="brand footer-brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="brand-mark">
            <ShoppingBag size={18} />
          </span>
          <span>
            shopease<small>YOUR EVERYDAY STORE</small>
          </span>
        </a>
        <span>Thoughtfully chosen. Everyday loved.</span>
        <span>© {new Date().getFullYear()} ShopEase</span>
      </footer>

      {!apiOnline && (
        <div className="demo-note">
          Preview mode · Backend unavailable. Demo products are displayed; login
          and real orders require a working API.
        </div>
      )}
      {notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {panel && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPanel("");
          }}
        >
          <aside className="drawer">
            <div className="drawer-head">
              <div>
                <span className="eyebrow">SHOPEASE</span>
                <h2>
                  {panel === "cart"
                    ? "Your cart"
                    : panel === "auth"
                      ? authMode === "login"
                        ? "Welcome back"
                        : "Create account"
                      : panel === "orders"
                        ? "Your orders"
                        : "Add a product"}
                </h2>
              </div>
              <button
                className="icon-btn"
                onClick={() => setPanel("")}
                aria-label="Close panel"
              >
                <X />
              </button>
            </div>

            {panel === "cart" && (
              <>
                <div className="cart-items">
                  {cart.length ? (
                    cart.map((item) => (
                      <div className="cart-item" key={item._id}>
                        <div className="cart-thumb">
                          <img
                            src={item.image || FALLBACK_IMAGE}
                            alt={item.name}
                            onError={handleImageError}
                          />
                        </div>
                        <div className="cart-item-info">
                          <b>{item.name}</b>
                          <strong>{money(item.price)}</strong>
                          <div className="quantity">
                            <button
                              onClick={() => changeQty(item._id, -1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => changeQty(item._id, 1)}
                              disabled={item.quantity >= item.stock}
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              className="remove"
                              onClick={() =>
                                setCart((old) =>
                                  old.filter((p) => p._id !== item._id),
                                )
                              }
                              aria-label="Remove product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty">
                      Your cart is waiting for something lovely.
                    </div>
                  )}
                </div>
                <div className="cart-summary">
                  <div className="subtotal">
                    <span>Subtotal</span>
                    <strong>{money(total)}</strong>
                  </div>
                  <p>Shipping and taxes are calculated at checkout.</p>
                  <form onSubmit={checkout}>
                    <label htmlFor="shipping-address">Delivery address</label>
                    <textarea
                      id="shipping-address"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="House no., street, city, PIN code"
                      rows={3}
                    />
                    <button
                      type="submit"
                      className="primary-btn full"
                      disabled={!cart.length}
                    >
                      Place order · {money(total)}
                    </button>
                  </form>
                  {!user && (
                    <small className="muted">
                      You'll be asked to sign in before placing your order.
                    </small>
                  )}
                </div>
              </>
            )}

            {panel === "auth" && (
              <form className="drawer-form" onSubmit={submitAuth}>
                {authMode === "register" && (
                  <>
                    <label htmlFor="auth-name">Full name</label>
                    <input
                      id="auth-name"
                      required
                      value={authForm.name}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, name: e.target.value })
                      }
                      placeholder="Your name"
                    />
                  </>
                )}
                <label htmlFor="auth-email">Email address</label>
                <input
                  id="auth-email"
                  required
                  type="email"
                  autoComplete="email"
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, email: e.target.value })
                  }
                  placeholder="you@example.com"
                />
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  required
                  minLength={6}
                  type="password"
                  autoComplete={
                    authMode === "login" ? "current-password" : "new-password"
                  }
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, password: e.target.value })
                  }
                  placeholder="At least 6 characters"
                />
                <button type="submit" className="primary-btn full">
                  {authMode === "login" ? "Sign in" : "Create account"} ↗
                </button>
                <p className="switch-auth">
                  {authMode === "login"
                    ? "New to ShopEase?"
                    : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() =>
                      setAuthMode((current) =>
                        current === "login" ? "register" : "login",
                      )
                    }
                  >
                    {authMode === "login" ? "Create account" : "Sign in"}
                  </button>
                </p>
              </form>
            )}

            {panel === "orders" && (
              <div className="orders-list">
                {orders.length ? (
                  orders.map((order) => (
                    <article className="order-card" key={order._id}>
                      <div>
                        <b>
                          Order #
                          {String(order._id || "")
                            .slice(-6)
                            .toUpperCase()}
                        </b>
                        <span className="status">
                          {order.status || "Processing"}
                        </span>
                      </div>
                      <p>
                        {(order.items || [])
                          .map(
                            (item) =>
                              `${item.name || "Product"} × ${item.quantity}`,
                          )
                          .join(", ")}
                      </p>
                      <strong>{money(order.total)}</strong>
                      <small>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                            )
                          : ""}
                      </small>
                    </article>
                  ))
                ) : (
                  <div className="empty">No orders yet.</div>
                )}
              </div>
            )}

            {panel === "admin" && user?.role === "admin" && (
              <form className="drawer-form" onSubmit={adminCreateProduct}>
                <label htmlFor="product-name">Product name</label>
                <input id="product-name" name="name" required />
                <label htmlFor="product-category">Category</label>
                <input id="product-category" name="category" required />
                <label htmlFor="product-description">Description</label>
                <textarea
                  id="product-description"
                  name="description"
                  rows={3}
                />
                <label htmlFor="product-price">Price (₹)</label>
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
                <label htmlFor="product-stock">Stock</label>
                <input
                  id="product-stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                />
                <label htmlFor="product-image-file">Product image</label>
                <label className="image-upload" htmlFor="product-image-file">
                  <ImagePlus size={20} />
                  <span>
                    {selectedImage
                      ? selectedImage.name
                      : "Choose an image (max 5 MB)"}
                  </span>
                  <Upload size={17} />
                </label>
                <input
                  id="product-image-file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={onChooseImage}
                  hidden
                />
                {imagePreview && (
                  <img
                    className="upload-preview"
                    src={imagePreview}
                    alt="Selected product preview"
                  />
                )}
                <button
                  type="submit"
                  className="primary-btn full"
                  disabled={uploading}
                >
                  {uploading
                    ? "Uploading image…"
                    : "Upload image & create product"}
                </button>
              </form>
            )}
          </aside>
        </div>
      )}

      {user?.role === "admin" && (
        <button
          className="admin-fab"
          onClick={() => {
            setSelectedImage(null);
            setImagePreview("");
            setPanel("admin");
          }}
        >
          <Plus size={18} /> Add product
        </button>
      )}
    </div>
  );
}
