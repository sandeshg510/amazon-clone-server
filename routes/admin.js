import express, { json, response } from 'express';
import admin from '../middlewares/admin.js';
import Product from '../models/product.js';
import Order from '../models/order.js';
import { request } from 'http';

const adminRouter = express.Router();

adminRouter.post('/admin/add-product', admin, async (request, response) => {
	try {
		const {
			name,
			brand,
			description,
			images,
			quantity,
			price,
			category,
			subCategory,
			subClassification,
			colour,
			about,
			sizes,
			inTheBox,
		} = request.body;

		let product = new Product({
			name,
			brand,
			description,
			images,
			quantity,
			price,
			category,
			subCategory,
			subClassification,
			colour,
			about,
			sizes,
			inTheBox,
		});

		product = await product.save();
		response.json(product);
	} catch (e) {
		response.status(500).json({ error: e.message });
	}
});

adminRouter.get('/admin/get-products', admin, async (request, response) => {
	try {
		const products = await Product.find({});
		response.json(products);
	} catch (e) {
		response.status(500).json({ error: e.message });
	}
});

adminRouter.post('/admin/delete-product', admin, async (request, response) => {
	try {
		const { id } = request.body;
		let product = await Product.findByIdAndDelete(id);
		response.json(product);
	} catch (e) {
		response.status(500).json(e.message);
	}
});

adminRouter.get('/admin/get-orders', admin, async (request, response) => {
	try {
		const orders = await Order.find({}).populate('products.product');

		response.json(orders);
	} catch (e) {
		response.status(500).json(e.message);
	}
});

adminRouter.post('/admin/change-order-status', admin, async (req, res) => {
	try {
		const { id, status } = req.body;
		if (status < 0 || status > 2) {
			return res.status(400).json({ message: 'Invalid status value' });
		}

		const order = await Order.findById(id);
		order.status = status;
		await order.save();

		res.json(order);
	} catch (e) {
		console.error('Error changing status:', e);
		res.status(500).json({ error: e.message });
	}
});

adminRouter.get('/admin/analytics', admin, async (req, res) => {
	try {
		const orders = await Order.find({});
		let totalEarnings = 0;

		for (let i = 0; i < orders.length; i++) {
			for (let j = 0; j < orders[i].products.length; j++) {
				totalEarnings +=
					orders[i].products[j].quantity *
					orders[i].products[j].product.price;
			}
		}
		let groceriesEarnings = await fetchCategoryWiseProduct('Groceries');
		let fashionEarnings = await fetchCategoryWiseProduct('Fashion');
		let mobileEarnings = await fetchCategoryWiseProduct('Mobiles');
		let electronicsEarnings = await fetchCategoryWiseProduct('Electronics');
		let applianceEarnings = await fetchCategoryWiseProduct('Appliances');

		let furnitureEarnings = await fetchCategoryWiseProduct('Furniture');
		let booksEarnings = await fetchCategoryWiseProduct('Books');

		let earnings = {
			groceriesEarnings,
			totalEarnings,
			mobileEarnings,
			electronicsEarnings,
			applianceEarnings,
			booksEarnings,
			furnitureEarnings,
			fashionEarnings,
		};

		res.json(earnings);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

async function fetchCategoryWiseProduct(category) {
	let earnings = 0;
	let categoryOrders = await Order.find({
		'products.product.category': category,
	});

	for (let i = 0; i < categoryOrders.length; i++) {
		for (let j = 0; j < categoryOrders[i].products.length; j++) {
			earnings +=
				categoryOrders[i].products[j].quantity *
				categoryOrders[i].products[j].product.price;
		}
	}
	return earnings;
}

export default adminRouter;
