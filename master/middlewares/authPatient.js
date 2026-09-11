const jwt = require('jsonwebtoken');

const authPatient = async (req, res, next) => {
    try {
        // Safely extract token from headers, body, or query params
        let token = req.headers?.token || 
                    req.headers?.authorization || 
                    req.body?.token || 
                    req.query?.token;

        // console.log("Incoming Request:", req.method, req.url);
        // console.log("Token Found:", token ? "Yes" : "No");

        if (!token) {
            return res.status(401).json({ success: false, message: "Not Authorized. Token Missing" });
        }

        // Handle 'Bearer <token>' format
        if (token.startsWith('Bearer ')) {
            token = token.split(' ')[1];
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // Set req.userId and req.user to ensure compatibility across controllers
        req.userId = token_decode.id;
        req.user = typeof token_decode === 'object' ? { ...token_decode, id: token_decode.id } : { id: token_decode.id };
        if (req.body) {
            req.body.userId = token_decode.id; 
        }
        
        next();

    } catch (error) {
        console.log("JWT Error:", error.message);
        const msg = error.name === 'JsonWebTokenError' ? "Invalid Token (Malformed)" : error.message;
        res.status(500).json({ success: false, message: msg });
    }
}

module.exports = authPatient;
