const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("Authorization");
  
  if (!token) return res.status(401).json({ msg: "No token, access denied" });

  // Check if token starts with 'Bearer ' and extract the actual token
  const tokenWithoutBearer = token.split(" ")[1];

  if (!tokenWithoutBearer) {
    return res.status(401).json({ msg: "Token format is incorrect" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info from the token to the request
    next(); // Move to the next middleware
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};



module.exports = auth;
