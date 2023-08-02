import { config } from 'dotenv';
config();
// Middleware to handle the API key
export function checkAPIKey (req, res, next) {
    const AUTH_KEY = process.env.AUTH_KEY;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized - no authorization header" });
    }
  
    const [authType, authToken] = authHeader.split(' ');
  
    if (authType !== 'Bearer' || authToken !== AUTH_KEY) {
      return res.status(401).json({ error: "Unauthorized - invalid token" });
    }
  
    next();
  };
  