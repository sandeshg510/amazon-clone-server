import { response } from 'express';
import jwt from 'jsonwebtoken';

const auth = async (request, response, next) => {
	try {
		const token = request.header('x-auth-token');
		if (!token)
			return response
				.status(401)
				.json({ msg: 'No auth token, Access denied!' });

		const verified = jwt.verify(token, 'passwordKey');
		if (!verified)
			return response.status(401).json({
				msg: 'token verification failed, Authorization denied!',
			});

		request.user = verified.id;
		request.token = token;
		next();
	} catch (e) {
		response.status(500).json({ error: e.message });
	}
};

export default auth;
