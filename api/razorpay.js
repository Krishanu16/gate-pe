import Razorpay from "razorpay";
import shortid from "shortid";

export default async function handler(req, res) {
  // 1. Setup CORS Headers (Required for browser requests)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Handle Preflight Request (Browser asks: "Can I POST?")
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Reject anything that isn't POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID, 
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Use the amount from the frontend (safe because we are trusting the client for now)
    // Or default to 2499
    const amount = req.body.amount ? (req.body.amount / 100) : 2499; 

    const options = {
      amount: (amount * 100).toString(),
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