const jwt = require('jsonwebtoken');

function customerAuth(req, res, next) {
  const token =
    req.cookies?.customerToken ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Please log in to continue' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'customer') {
      return res.status(401).json({ error: 'Please log in with your customer account' });
    }
    req.customer = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

module.exports = customerAuth;
