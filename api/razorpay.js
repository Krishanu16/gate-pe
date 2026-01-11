import Razorpay from "razorpay";
import shortid from "shortid";

export default async function handler(req, res) {
  // 1. Add CORS Headers (Crucial for Vercel/Live Site)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Handle the Preflight Request (Browser asks: "Can I connect?")
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Only then check for POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 4. Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID, 
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // 5. Secure Price Logic: Use frontend amount or fallback
    const { amount } = req.body;
    const paymentAmount = amount ? amount : 249900; // Default to ₹2499 if missing

    const options = {
      amount: paymentAmount.toString(),
      currency: "INR",
      receipt: shortid.generate(),
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