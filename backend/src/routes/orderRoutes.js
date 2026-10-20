const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/", protect, async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;
    if (!Array.isArray(items) || !items.length || !shippingAddress?.trim()) {
      return res
        .status(400)
        .json({ message: "Cart items and shipping address are required" });
    }
    const orderItems = [];
    let total = 0;
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1)
        return res.status(400).json({ message: "Invalid quantity" });
      const product = await Product.findById(item.productId);
      if (!product)
        return res
          .status(400)
          .json({ message: "A product in your cart no longer exists" });
      if (product.stock < quantity)
        return res
          .status(400)
          .json({ message: `Not enough stock for ${product.name}` });
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
      });
      total += product.price * quantity;
    }
    // Re-check and decrement stock before saving the order.
    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true },
      );
      if (!updated)
        return res
          .status(409)
          .json({
            message: `Stock changed for ${item.name}; refresh your cart`,
          });
    }
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total,
      shippingAddress: shippingAddress.trim(),
      paymentMethod: "cash_on_delivery",
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

router.get("/my", protect, async (req, res, next) => {
  try {
    res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
});
router.get("/", protect, adminOnly, async (_req, res, next) => {
  try {
    res.json(
      await Order.find().populate("user", "name email").sort({ createdAt: -1 }),
    );
  } catch (err) {
    next(err);
  }
});
router.patch("/:id/status", protect, adminOnly, async (req, res, next) => {
  try {
    const allowed = [
      "Placed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    if (!allowed.includes(req.body.status))
      return res.status(400).json({ message: "Invalid order status" });
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
});
module.exports = router;
