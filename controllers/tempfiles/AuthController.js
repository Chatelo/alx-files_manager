const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');
// const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const findUserByEmailandPassword = require('./finduser');
const getUserByTokenId = require('./findtoken');

class AuthController {
  static async getConnect(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorised' });
      }

      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [email, password] = credentials.split(':');

      const user = await findUserByEmailandPassword(email, sha1(password));
      if (!user) {
        return res.status(401).json({ error: 'unauthorised' });
      }

      const token = uuidv4();

      if (!redisClient) {
        console.error('redisClient is not defined.');
        return res.status(500).json({ error: 'Internal server error' });
      }
      const key = `auth_${token}`;
      const value = user._id.toString();
      const duration = 86400;

      await redisClient.set(key, value, duration);

      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error signing in:', error);
      return res.status(500).json({ error: 'Internal server Error' });
    }
  }

  static async getDisconnect(req, res) {
    try {
      const token = req.headers['x-token'];

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized - invalid token' });
      }
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await getUserByTokenId(userId);

      if (!user) {
        return res.status(401).json({ error: 'Unauthorised' });
      }

      const key = `auth_${token}`;
      const deleted = await redisClient.del(key);

      if (deleted) {
        return res.status(204).send();
      }
      return res.status(500).json({ error: 'Internal server error' });
    } catch (error) {
      console.error('Error disconnecting user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;
