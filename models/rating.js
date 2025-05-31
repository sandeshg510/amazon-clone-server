import mongoose from 'mongoose';

const ratingSchema = mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	rating: {
		type: Number,
		required: true,
	},
});

export default ratingSchema;
