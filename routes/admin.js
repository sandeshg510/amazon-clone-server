import express, { json, response } from 'express';
import admin from '../middlewares/admin.js';
import Product from '../models/product.js';
import Order from '../models/order.js';
import { request } from 'http';
// import productModule from './product.js';

// const { Product } = productModule;

const adminRouter = express.Router();

adminRouter.post('/admin/add-product', admin, async (request, response) => {
	try {
		const { name, description, images, quantity, price, category } =
			request.body;
		let product = Product({
			name,
			description,
			images,
			quantity,
			price,
			category,
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
		const orders = await Order.find({});
		response.json(orders);
	} catch (e) {
		response.status(500).json(e.message);
	}
});

adminRouter.post(
	'/admin/change-order-status',
	// admin,
	async (request, response) => {
		try {
			const { id, status } = request.body;
			let order = await Order.findById(id);

			order.status = status;
			order = await order.save();

			response.json(order);
		} catch (e) {
			response.status(500).json({ error: e.message });
		}
	}
);

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
		// CATEGORY WISE ORDER FETCHING
		let mobileEarnings = await fetchCategoryWiseProduct('Mobiles');
		let essentialEarnings = await fetchCategoryWiseProduct('Essentials');
		let applianceEarnings = await fetchCategoryWiseProduct('Appliances');
		let booksEarnings = await fetchCategoryWiseProduct('Books');
		let fashionEarnings = await fetchCategoryWiseProduct('Fashion');

		let earnings = {
			totalEarnings,
			mobileEarnings,
			essentialEarnings,
			applianceEarnings,
			booksEarnings,
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
