const dbClient = require('../utils/db');
const { ObjectId } = require('mongodb');

async function getUserByTokenId(userId) {
    try {
	const usersCollection = dbClient.client.db().collection('users');

	const userIdObject = ObjectId(userId);
	
	const user = await usersCollection.findOne({ _id: userIdObject });

	return user;
    } catch (error) {
	console.error('Error finding user by userID', error);
	throw error;
    }
}

module.exports = getUserByTokenId;
