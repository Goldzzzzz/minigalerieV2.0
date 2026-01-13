import { verifyToken } from "./auth";
export function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ error: "Token manquant" });
    }
    const token = header.split(" ")[1];
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Token invalide" });
    }
}
