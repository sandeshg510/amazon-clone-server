import express, { json, response } from 'express';
import User from '../models/user.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { request } from 'http';
import auth from '../middlewares/auth.js';

const authRouter = express.Router();

authRouter.get('/api', (request, response) => {
	response.json({ msg: "API's are working fine!" });
});

authRouter.post('/api/signup', async (request, response) => {
	try {
		//Get the data from user
		const { name, email, password } = request.body;
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			return response
				.status(400)
				.json({ msg: 'User with same email already exists!' });
		}

		const hashedPassword = await bcryptjs.hash(password, 8);

		let user = new User({
			email,
			password: hashedPassword,
			name,
		});

		//Post the data to database
		user = await user.save();
		response.json({ user });
	} catch (e) {
		response.status(500).json({ error: e.message });
	}
});

// Create a Sign in route
authRouter.post('/api/signin', async (request, response) => {
	try {
		const { email, password } = request.body;

		const user = await User.findOne({ email });

		if (!user) {
			return response
				.status(400)
				.json({ msg: 'User with this email does not exist!' });
		}

		const isMatch = await bcryptjs.compare(password, user.password);

		if (!isMatch) {
			return response.status(400).json({ msg: 'Incorrect password!' });
		}

		const token = jwt.sign({ id: user._id }, 'passwordKey');
		response.json({ token, ...user._doc });
	} catch (e) {
		response.status(500).json({ error: e.message });
	}
});

authRouter.post('/tokenIsValid', async (request, response) => {
	try {
		const token = request.header('x-auth-token');
		if (!token) return json(false);

		const verified = jwt.verify(token, 'passwordKey');

		if (!verified) return json(false);

		const user = await User.findById(verified.id);
		if (!user) return json(false);
		response.json(true);
	} catch (e) {
		response.status(500).json({ error: e.message });
	}
});

//get User data
authRouter.get('/', auth, async (request, response) => {
	const user = await User.findById(request.user);
	response.json({ ...user._doc, token: request.token });
});

export default authRouter;
