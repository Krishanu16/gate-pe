const Razorpay = require("razorpay");
const shortid = require("shortid");

module.exports = async (req, res) => {
  if (req.method === "POST") {
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID, 
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const payment_capture = 1;
    const amount = 2499; // Amount in Rupees
    const currency = "INR";

    const options = {
      amount: (amount * 100).toString(),
      currency,
      receipt: shortid.generate(),
      payment_capture,
    };

    try {
      const response = await razorpay.orders.create(options);
      res.status(200).json({
        id: response.id,
        currency: response.currency,
        amount: response.amount,
      });
    } catch (error) {
      console.error("Razorpay Error:", error);
      res.status(500).send("Server Error: " + error.message);
    }
  } else {
    res.status(405).end("Method Not Allowed");
  }
};