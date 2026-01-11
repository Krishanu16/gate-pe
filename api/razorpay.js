import Razorpay from "razorpay";

export default async function handler(req, res) {
  // 1. Add CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Handle Preflight (Browser Check)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Check for POST Method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 4. Initialize Razorpay
    if (!process.env.VITE_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay Keys are missing in Environment Variables.");
    }

    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // 5. Create Order
    const { amount } = req.body;
    const paymentAmount = amount || 249900; 

    // Generate a Receipt ID using native Math.random (No 'shortid' needed)
    const receiptId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const options = {
      amount: paymentAmount.toString(),
      currency: "INR",
      receipt: receiptId,
      payment_capture: 1,
    };

    const response = await razorpay.orders.create(options);

    res.status(200).json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });

  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ error: error.message });
  }
}