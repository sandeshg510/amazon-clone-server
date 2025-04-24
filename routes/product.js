import express, { json, response } from 'express';
import auth from '../middlewares/auth.js';
import { request } from 'http';
// import productModule from '../models/product.js';

// const { Product } = productModule;

import Product from '../models/product.js';

const productRouter = express.Router();

// Get category products
productRouter.get('/api/products', auth, async (request, response) => {
	try {
		const products = await Product.find({
			category: request.query.category,
		});

		response.json(products);
	} catch (e) {
		response.status(500).json({ error: e.message });
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
		let product = await Product.findById(id);

		for (let i = 0; i < product.ratings.length; i++) {
			if (product.ratings[i].userId == req.user) {
				product.ratings.splice(i, 1);
				break;
			}
		}

		const ratingSchema = {
			userId: req.user,
			rating,
		};

		product.ratings.push(ratingSchema);
		product = await product.save();
		res.json(product);
	} catch (e) {
		res.status(500).json({ error: e.message });
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

export default productRouter;
