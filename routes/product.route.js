const { Router } = require("express");
const { ProductModel } = require("../model/product.model");

const productRouter = Router();

productRouter.post("/", async (req, res) => {
  try {
    req.body.created_at = new Date();
    req.body.updated_at = new Date(); 
    let product = new ProductModel(req.body);
    await product.save();
    res.status(201).json({ message: "product added successfully", product });
  } catch (error) {
    res
      .status(400)
      .json({ error: error.message, err: "this is the catch error" });
  }
});

// productRouter.get("/", async (req, res) => {
//   try {
//     const products = await ProductModel.find();
//     if (products.length === 0 || !products) {
//       res.status(200).json({ error: "no products found" });
//     }
//     res.status(200).send(products);
//   } catch (error) {
//     res
//       .status(401)
//       .json({ error: error.message, err: "this is the catch error" });
//   }
// });

productRouter.get("/", async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid page or limit value" });
    }
    // Filter by Gender and Category
    const genderFilter = req.query.gender ? { gender: req.query.gender } : {};
    const categoryFilter = req.query.category ? { category: req.query.category } : {};

    // Sort by Price
    const sortOption = req.query.sort === 'asc' ? { price: 1 } : req.query.sort === 'desc' ? { price: -1 } : {};

    // Search by Product Name
    const searchQuery = req.query.search ? { name: { $regex: new RegExp(req.query.search, 'i') } } : {};

    const products = await ProductModel.find({
      ...genderFilter,
      ...categoryFilter,
      ...searchQuery,
    })
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    if (products.length === 0 || !products) {
      return res.status(200).json({ error: "No products found" });
    }

    // Count total number of products for pagination
    const totalProducts = await ProductModel.countDocuments({
      ...genderFilter,
      ...categoryFilter,
      ...searchQuery,
    });

    res.status(200).json({
      products,
      pageInfo: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalItems: totalProducts,
      },
    });
  } catch (error) {
    res.status(401).json({ error: error.message, err: "Catch error occurred" });
  }
});

productRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await ProductModel.findById(id);
    if (!product) {
      res.status(200).json({ error: "no products found" });
    } else {
      res.status(200).send(product);
    }
  } catch (error) {
    res
      .status(401)
      .json({ error: error.message, err: "this is the catch error" });
  }
});

// patch request to update the data  , updated_at:new Date 
productRouter.patch("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id)
  try {
    const { name, price, description,picture, gender,category } = req.body;
    // const updatedProduct = await ProductModel.findById(id)
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { name, price, description, picture, gender,category},
      { new: true }
    );
    if (!updatedProduct) {
      res.status(204).json({ error: "no products found" });
    } else {
      console.log("Updated")
      res
        .status(200)
        .send({ updatedProduct, message: "product updated successfully" });
    }
  } catch (error) {
    res
      .status(401)
      .json({ error: error.message, err: "this is the catch error" });
  }
});

//delete request
productRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      res.status(202).json({ error: "no products found" });
    } else {
      res
        .status(202)
        .send({ product, message: "product deleted successfully" });
    }
  } catch (error) {
    res
      .status(401)
      .json({ error: error.message, err: "this is the catch error" });
  }
});

module.exports = {
  productRouter,
};
