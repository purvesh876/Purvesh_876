const OpenAI = require("openai");
const Listing = require("../models/listing");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports.chatBotHandler = async (req, res) => {
  const userMsg = req.body.message;

  const prompt = `
You are a helpful assistant for a travel listing website. 
Extract the "category", "location", and "maxPrice" (in rupees) from the user's message if mentioned.

Examples:
User: Show me beach resorts in Goa under ₹2000
→ { "category": "beach resort", "location": "Goa", "maxPrice": 2000 }

User: Looking for something in Manali
→ { "category": null, "location": "Manali", "maxPrice": null }

Now extract from: "${userMsg}"
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content.trim();

    let extracted;
    try {
      extracted = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON:", content);
      return res.json({ reply: "Sorry, I didn't understand your request." });
    }

    const { category, location, maxPrice } = extracted;

    let query = {};
    if (category) query.category = new RegExp(category, "i");
    if (location) query.location = new RegExp(location, "i");
    if (maxPrice) query.price = { $lte: maxPrice };

    const listings = await Listing.find(query).limit(5);

    if (!listings.length) {
      return res.json({ reply: "Sorry, no listings matched your search." });
    }

    // Respond with structured listing cards
    const reply = listings.map(l => ({
      id: l._id,
      title: l.title,
      price: l.price,
      location: l.location,
      image: l.image.url || "", // Fallback if image is stored in Cloudinary
    }));

    res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ reply: "Oops! Something went wrong." });
  }
};
