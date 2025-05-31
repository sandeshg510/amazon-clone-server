import mongoose from 'mongoose';
import { productSchema } from '../models/product.js';

const userSchema = mongoose.Schema({
	name: {
		required: true,
		type: String,
		trim: true,
	},

	email: {
		required: true,
		type: String,
		trim: true,
		validate: {
			validator: (value) => {
				const re =
					/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
				return value.match(re);
			},
			message: 'Please enter a valid email address',
		},
	},
	password: {
		required: true,
		type: String,
		trim: true,
		validate: {
			validator: (value) => {
				return value.length > 6;
			},
			message: 'password length should be more than 6 characters',
		},
	},

	address: { type: String, default: '' },
	type: { type: String, default: 'user' },

	cart: [
		{
			product: productSchema,
			quantity: {
				required: true,
				type: Number,
			},
		},
	],
});

const User = mongoose.model('User', userSchema);

export default User;
