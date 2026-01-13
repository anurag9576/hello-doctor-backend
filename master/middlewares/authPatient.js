const jwt = require('jsonwebtoken');

const authPatient = async (req, res, next) => {
    try {
        // Safely extract token from headers, body, or query params
        let token = req.headers.token || 
                    req.headers.authorization || 
                    (req.body && req.body.token) || 
                    req.query.token;

        console.log("Incoming Request:", req.method, req.url);
        console.log("Token Found:", token ? "Yes" : "No");

        if (!token) {
            return res.status(401).json({ success: false, message: "Not Authorized. Token Missing" });
        }

        // Handle 'Bearer <token>' format
        if (token.startsWith('Bearer ')) {
            token = token.split(' ')[1];
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // Use req.userId to avoid conflicts with profile data in req.body
        req.userId = token_decode.id;
        req.body.userId = token_decode.id; 
        
        next();

    } catch (error) {
        console.log("JWT Error:", error.message);
        const msg = error.name === 'JsonWebTokenError' ? "Invalid Token (Malformed)" : error.message;
        res.status(500).json({ success: false, message: msg });
    }
}

module.exports = authPatient;
