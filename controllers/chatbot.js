const OpenAI = require("openai");
const Listing = require("../models/listing");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports.chatBotHandler = async (req, res) => {
  const userMsg = req.body.message;

  const prompt = `
Extract the category, location, and price if available from this message: "${userMsg}"
Return JSON like this:
{ "category": "...", "location": "...", "maxPrice": ... }
If anything is missing, use null.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  let extracted;
  try {
    extracted = JSON.parse(response.choices[0].message.content);
  } catch (e) {
    return res.json({ reply: "Sorry, I didn't understand that." });
  }

  const { category, location, maxPrice } = extracted;

  let query = {};
  if (category) query.category = category;
  if (location) query.location = new RegExp(location, "i");
  if (maxPrice) query.price = { $lte: maxPrice };

  const listings = await Listing.find(query).limit(3);

  if (listings.length === 0) {
    return res.json({ reply: "Sorry, no matching listings found." });
  }

  let reply = "Here are some listings:\n";
  for (let l of listings) {
    reply += `🏠 ${l.title} - ₹${l.price}/night - [View](/listings/${l._id})\n`;
  }

  res.json({ reply });
};
