const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: { type: Number, min: 1, required: true },
      },
    ],
    total: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    paymentMethod: { type: String, default: "cash_on_delivery" },
    status: {
      type: String,
      enum: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Placed",
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Order", orderSchema);
