# 🛍️ ShopEase – E-Commerce Website

ShopEase is a full-stack e-commerce web application built using the MERN stack. Users can browse products, add items to their cart, sign in, and place orders. Admins can manage products through admin-only functionality.

## 🌐 Live Demo

- **Frontend:** https://e-commerce-website-1-0bbs.onrender.com/
- **Backend API:** https://e-commerce-website-lz7y.onrender.com/
- **Products API:** https://e-commerce-website-lz7y.onrender.com/api/products

## ✨ Features

### 🛒 Customer Features
- Browse products and view product details
- View product prices and stock availability
- Add products to the shopping cart
- Increase or decrease product quantities
- User registration and login
- Place orders after authentication
- View order history, if implemented
- Responsive user interface

### 👨‍💼 Admin Features
- Secure admin login with role-based access
- Admin dashboard for product management
- **Add new products**
- Enter product name and description
- Set product price and category
- Add stock quantity
- Upload product images using Cloudinary
- Save product information in MongoDB
- Update or delete products, if implemented in the admin interface

## 💻 Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- CORS
- Cloudinary

## 📂 Project Structure

```text
E-Commerce-Website/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── models/
│       └── routes/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/bittu90060/E-Commerce-Website.git
cd E-Commerce-Website
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret
FRONTEND_URL=http://localhost:5173
```

Add the required Cloudinary environment variables if your backend uses image uploads.

Start the backend using the script configured in `backend/package.json`. For example:

```bash
npm run dev
```

If no development script exists, use the configured start command, such as:

```bash
node server.js
```

### 3. Install Frontend Dependencies

Open a new terminal from the project root:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL shown by Vite, usually:

http://localhost:5173

## ➕ Admin: Add a Product

1. Sign in using an account with the `admin` role.
2. Open the admin product-management page.
3. Enter the product details in the form.
4. Add the product name, description, price, category, stock quantity, and image as supported by the form.
5. Submit the product form.
6. The backend should validate the request and save the product to MongoDB.
7. Check the product list to confirm the product appears.

**Important:** Adding a product requires a working frontend form, backend product-creation route, admin authorization, and database connection.

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Backend health check |
| GET | `/api/products` | Retrieve products |
| `/api/auth` | Authentication routes | Registration and login |
| `/api/orders` | Order routes | Order management |
| `/api/uploads` | Upload routes | Image uploads |

The exact methods and protected routes depend on the backend route implementation.

## 🚀 Deployment on Render

### Backend Environment Variables

Configure these in the Render backend service:

- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- Required Cloudinary environment variables

### Frontend Environment Variable

Configure this in the Render frontend Static Site:

```env
VITE_API_URL=https://e-commerce-website-lz7y.onrender.com/api
```

For a typical Vite deployment, use:

- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

Ensure the backend CORS configuration allows the exact deployed frontend URL.

After changing frontend environment variables, redeploy the frontend.

## 🛠️ Troubleshooting

- **Preview products appear:** Check `VITE_API_URL` and verify that the products API returns database products.
- **CORS error:** Allow the exact frontend URL in backend CORS settings.
- **Login fails:** Check the API URL, credentials, and authentication route.
- **Admin cannot add products:** Verify the admin role, authentication token, product-creation API, and MongoDB connection.
- **Orders fail:** Check authentication, product IDs, stock availability, browser console errors, and backend logs.
- **GitHub changes do not appear:** Check Git status, commit the changes, push to `main`, and verify the latest commit.

## 🔒 Security

- Never upload `.env` files or credentials to GitHub.
- Keep MongoDB and Cloudinary credentials private.
- Use a strong, unique JWT secret.
- Rotate credentials if they have been exposed.
- Enforce admin authorization on the backend.

## 👨‍💻 Author

**Bittu Kumar**

- **GitHub:** https://github.com/bittu90060
- **Repository:** https://github.com/bittu90060/E-Commerce-Website
- **Live Project:** https://e-commerce-website-1-0bbs.onrender.com/

---

⭐ If you like this project, consider giving the repository a star!
