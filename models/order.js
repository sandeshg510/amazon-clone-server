import mongoose, { Mongoose } from 'mongoose';
import Product, { productSchema } from './product.js';

const orderSchema = new mongoose.Schema(
	{
		products: [
			{
				product: productSchema,

				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
			},
		],
		totalPrice: {
			type: Number,
			required: true,
			min: 0,
		},
		address: {
			type: String,
			required: true,
			trim: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		status: {
			type: String,
			enum: [
				'pending',
				'processing',
				'shipped',
				'delivered',
				'cancelled',
			],
			default: 'pending',
		},
	},
	{
		timestamps: true,
		toJSON: {
			virtuals: true,
			transform: function (doc, ret) {
				ret.id = ret._id;
				delete ret._id;
				delete ret.__v;
				return ret;
			},
		},
	}
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
