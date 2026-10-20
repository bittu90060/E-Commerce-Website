const router = require("express").Router();
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.search)
      filter.name = { $regex: req.query.search, $options: "i" };
    if (req.query.category && req.query.category !== "All")
      filter.category = req.query.category;
    res.json(await Product.find(filter).sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined || Number(price) < 0)
      return res
        .status(400)
        .json({ message: "Valid name and price are required" });
    res.status(201).json(await Product.create(req.body));
  } catch (err) {
    next(err);
  }
});
router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
