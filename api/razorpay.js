import Razorpay from "razorpay";

export default async function handler(req, res) {
  // 1. Allow CORS (If needed for cross-origin)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request (Preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 2. DEBUG: Log keys (masked) to Vercel Logs to ensure they exist
    const keyId = process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    console.log("Initializing Razorpay...");
    console.log("Key ID Exists?", !!keyId);
    console.log("Key Secret Exists?", !!keySecret);

    if (!keyId || !keySecret) {
      throw new Error("Missing Environment Variables. key_id or key_secret is undefined.");
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // 3. Get Amount
    const { amount = 149900 } = req.body; 

    // 4. Create Order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      payment_capture: 1,
    });

    console.log("Order Created:", order.id);

    // 5. Success Response
    res.status(200).json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });

  } catch (error) {
    console.error("CRITICAL BACKEND ERROR:", error);
    // Return JSON error so frontend doesn't crash
    res.status(500).json({ 
      error: "Backend Error", 
      details: error.message 
    });
  }
}