import mongoose from 'mongoose';
import ratingSchema from './rating.js';

const productSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	brand: {
		type: String,
		required: false,
	},
	description: {
		type: String,
		required: false,
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
	subCategory: {
		type: String,
		required: false,
	},
	subClassification: {
		type: String,
		required: false,
	},
	colour: {
		type: String,
		required: false,
	},
	about: {
		type: String,
		required: false,
	},
	inTheBox: {
		type: String,
		required: false,
	},
	sizes: {
		type: [String],
		default: [],
	},
	ratings: [
		{
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				required: true,
			},
			rating: { type: Number, required: true, min: 0, max: 5 },
		},
	],
	address: { type: String, default: '' },
	type: { type: String, default: 'user' },
});

const Product = mongoose.model('Product', productSchema);

export { productSchema };
export default Product;
