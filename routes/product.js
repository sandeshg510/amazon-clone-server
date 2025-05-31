import express, { json, response } from 'express';
import auth from '../middlewares/auth.js';
import { request } from 'http';

import Product from '../models/product.js';

const productRouter = express.Router();

// Get category products
productRouter.get('/api/products', async (req, res) => {
	try {
		let query = {};

		// Handle both "category" (legacy) and "categories" (new) parameters
		if (req.query.categories) {
			const categories = req.query.categories.split(',');

			// Map category parts to your schema fields
			if (categories.length >= 1) query.category = categories[0];
			if (categories.length >= 2) query.subCategory = categories[1];
			if (categories.length >= 3) query.subClassification = categories[2];
		} else if (req.query.category) {
			// Legacy support for single category
			query.category = req.query.category;
		} else {
			return res.status(400).json({
				error: "Provide a category filter using 'category' or 'categories'.",
			});
		}

		const products = await Product.find(query);
		res.json(products);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// Get searched products
productRouter.get(
	'/api/products/search/:name',
	auth,
	async (request, response) => {
		try {
			const products = await Product.find({
				name: { $regex: request.params.name, $options: 'i' },
			});

			response.json(products);
		} catch (e) {
			response.status(500).json({ error: e.message });
		}
	}
);

// create a post request route to rate the product.
productRouter.post('/api/rate-product', auth, async (req, res) => {
	try {
		const { id, rating } = req.body;
		const userId = req.user; // From auth middleware

		// Validation
		if (!id || rating === undefined || rating === null) {
			return res.status(400).json({
				error: 'Product ID and rating are required',
			});
		}

		if (rating < 0 || rating > 5) {
			return res.status(400).json({
				error: 'Rating must be between 0 and 5',
			});
		}

		// Find the product
		const product = await Product.findById(id);
		if (!product) {
			return res.status(404).json({
				error: 'Product not found',
			});
		}

		// Check if user has already rated this product
		const existingRatingIndex = product.ratings.findIndex(
			(r) => r.userId.toString() === userId.toString()
		);

		if (existingRatingIndex !== -1) {
			// Update existing rating
			product.ratings[existingRatingIndex].rating = rating;
		} else {
			// Add new rating
			product.ratings.push({
				userId: userId,
				rating: rating,
			});
		}

		// Save the updated product
		const updatedProduct = await product.save();

		// Populate userId field to get user details if needed
		await updatedProduct.populate('ratings.userId', 'name email');

		// Return the updated product in the format your Dart model expects
		const responseProduct = {
			_id: updatedProduct._id,
			name: updatedProduct.name,
			brand: updatedProduct.brand,
			description: updatedProduct.description,
			quantity: updatedProduct.quantity,
			price: updatedProduct.price,
			images: updatedProduct.images,
			category: updatedProduct.category,
			subCategory: updatedProduct.subCategory,
			subClassification: updatedProduct.subClassification,
			colour: updatedProduct.colour,
			about: updatedProduct.about,
			inTheBox: updatedProduct.inTheBox,
			sizes: updatedProduct.sizes || [],
			ratings: updatedProduct.ratings.map((r) => ({
				userId: r.userId._id || r.userId,
				rating: r.rating,
			})),
		};

		res.status(200).json(responseProduct);
	} catch (error) {
		console.error('Error rating product:', error);
		res.status(500).json({
			error: 'Internal server error',
			details: error.message,
		});
	}
});
// Deal of the day

productRouter.get(
	'/api/deal-of-the-day',
	// auth,
	async (request, response) => {
		try {
			let products = await Product.find({});

			products = products.sort((a, b) => {
				let aSum = 0;
				let bSum = 0;

				for (let rating of a.ratings) {
					aSum += rating.rating;
				}
				for (let rating of b.ratings) {
					bSum += rating.rating;
				}
				return bSum - aSum; // Sort in descending order
			});

			response.json(products[0]);
		} catch (e) {
			response.status(500).json({ error: e.message });
		}
	}
);

productRouter.get(
	'/api/best-deal-for-you',
	// auth,
	async (request, response) => {
		try {
			let products = await Product.find({});

			products = products.sort((a, b) => {
				let aSum = 0;
				let bSum = 0;

				for (let rating of a.ratings) {
					aSum += rating.rating;
				}
				for (let rating of b.ratings) {
					bSum += rating.rating;
				}
				return bSum - aSum; // Sort in descending order
			});

			response.json(products);
		} catch (e) {
			response.status(500).json({ error: e.message });
		}
	}
);

export default productRouter;
