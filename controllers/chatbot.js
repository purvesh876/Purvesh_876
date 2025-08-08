const Listing = require('../models/listing');

module.exports.initChatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('✅ New client connected to chatbot');

        socket.on('userMessage', async (msg) => {
            try {
                const userMsg = msg.toLowerCase();
                let query = {};

                if (userMsg.includes('beach')) {
                    query.category = 'Beach';
                } else if (userMsg.includes('mountain')) {
                    query.category = 'Mountain';
                } else if (userMsg.includes('City')) {
                    query.location = 'City';
                } else if (userMsg.includes('budget') || userMsg.includes('cheap')) {
                    query.price = { $lt: 3000 };
                } else if (userMsg.includes('luxury') || userMsg.includes('expensive')) {
                    query.price = { $gt: 10000 };
                }

                const listings = await Listing.find(query).limit(3);

                if (listings.length > 0) {
                    for (const listing of listings) {
                        socket.emit('botReply', {
                            type: 'listing',
                            listing: {
                                _id: listing._id,
                                title: listing.title,
                                description: listing.description.slice(0, 100) + "...",
                                image: listing.image
                            }
                        });
                    }

                    socket.emit('botReply', {
                        type: 'text',
                        message: `✅ Found ${listings.length} matching listings.`
                    });
                } else {
                    socket.emit('botReply', {
                        type: 'text',
                        message: "❌ No matching listings found. Try words like 'beach', 'delhi', or 'budget'."
                    });
                }
            } catch (err) {
                console.error(err);
                socket.emit('botReply', {
                    type: 'text',
                    message: "⚠️ Something went wrong while searching listings."
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('❎ Client disconnected from chatbot');
        });
    });
};
