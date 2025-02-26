const admin = require("firebase-admin");

// Firebaseの認証情報を環境変数から取得
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Firebaseを初期化（すでに初期化されていない場合のみ）
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

exports.handler = async (event, context) => {
    try {
        // Firestore の `products` コレクションからデータを取得
        const snapshot = await db.collection("products").get();
        let products = [];

        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });

        return {
            statusCode: 200,
            body: JSON.stringify(products),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // CORS対応
            }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
