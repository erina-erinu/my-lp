const admin = require("firebase-admin");
const functions = require("@netlify/functions");

// Firebase Admin SDK の初期化
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
}

const db = admin.firestore();

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const data = JSON.parse(event.body);
        const productRef = await db.collection("products").add(data);

        return {
            statusCode: 200,
            body: JSON.stringify({ id: productRef.id, message: "Product added successfully!" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
