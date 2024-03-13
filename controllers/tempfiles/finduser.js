const dbClient = require('../utils/db');

async function findUserByEmailandPassword(email, password) {
    try {
	const usersCollection = dbClient.client.db().collection('users');

	const user = await usersCollection.findOne({ email, password });

	return user;
    } catch (error) {
	console.error('Error finding user:', error);
	throw error;
    }
}

module.exports = findUserByEmailandPassword;
