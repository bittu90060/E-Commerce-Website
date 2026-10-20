const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General" },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Product", productSchema);
