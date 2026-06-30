const jwt = require('jsonwebtoken');
module.exports = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'takaloop_secret', { expiresIn: '7d' });
