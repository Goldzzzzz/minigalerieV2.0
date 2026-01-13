import jwt from "jsonwebtoken";
const SECRET = "une_chaine_ultra_secrete"; // tu peux mettre ça dans .env plus tard
export function signToken(userId) {
    return jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
}
export function verifyToken(token) {
    return jwt.verify(token, SECRET);
}
