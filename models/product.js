import mongoose from 'mongoose';
import ratingSchema from './rating.js';

const productSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	description: {
		type: String,
		required: true,
		trim: true,
	},
	images: [{ type: String, required: true }],

	quantity: {
		type: Number,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	category: {
		type: String,
		required: true,
	},
	ratings: [ratingSchema],

	address: { type: String, default: '' },
	type: { type: String, default: 'user' },
});

const Product = mongoose.model('Product', productSchema);

export { productSchema };
export default Product;
