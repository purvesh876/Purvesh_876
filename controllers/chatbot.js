// const Listing = require('../models/listing');

// module.exports.initChatSocket = (io) => {
//     io.on('connection', (socket) => {
//         console.log('✅ New client connected to chatbot');

//         socket.on('userMessage', async (msg) => {
//             try {
//                 const userMsg = msg.toLowerCase();
//                 let query = {};

//                 if (userMsg.includes('Beach')) {
//                     query.category = 'Beach';
//                 } else if (userMsg.includes('mountain')) {
//                     query.category = 'Mountain';
//                 } else if (userMsg.includes('City')) {
//                     query.location = 'City';
//                 } else if (userMsg.includes('budget') || userMsg.includes('cheap')) {
//                     query.price = { $lt: 3000 };
//                 } else if (userMsg.includes('luxury') || userMsg.includes('expensive')) {
//                     query.price = { $gt: 10000 };
//                 }

//                 const listings = await Listing.find(query).limit(3);

//                 if (listings.length > 0) {
//                     for (const listing of listings) {
//                         socket.emit('botReply', {
//                             type: 'listing',
//                             listing: {
//                                 _id: listing._id,
//                                 title: listing.title,
//                                 description: listing.description.slice(0, 100) + "...",
//                                 image: listing.image
//                             }
//                         });
//                     }

//                     socket.emit('botReply', {
//                         type: 'text',
//                         message: `✅ Found ${listings.length} matching listings.`
//                     });
//                 } else {
//                     socket.emit('botReply', {
//                         type: 'text',
//                         message: "❌ No matching listings found. Try words like 'beach', 'delhi', or 'budget'."
//                     });
//                 }
//             } catch (err) {
//                 console.error(err);
//                 socket.emit('botReply', {
//                     type: 'text',
//                     message: "⚠️ Something went wrong while searching listings."
//                 });
//             }
//         });

//         socket.on('disconnect', () => {
//             console.log('❎ Client disconnected from chatbot');
//         });
//     });
// };

// const Listing = require('../models/listing');

// module.exports.initChatSocket = (io) => {
//     io.on('connection', (socket) => {
//         console.log('✅ New client connected to chatbot');

//         socket.on('userMessage', async (msg) => {
//             try {
//                 const userMsg = msg.toLowerCase();
//                 let query = {};

//                 // Extract category
//                 if (userMsg.includes('beach')) {
//                     query.category = 'Beach';
//                 } else if (userMsg.includes('mountain')) {
//                     query.category = 'Mountain';
//                 } else if (userMsg.includes('village')) {
//                     query.category = 'Village';
//                 }

//                 // Extract price
//                 if (userMsg.includes('under') || userMsg.includes('below') || userMsg.includes('less than')) {
//                     const priceMatch = userMsg.match(/under (\d+)/) || userMsg.match(/below (\d+)/) || userMsg.match(/less than (\d+)/);
//                     if (priceMatch && priceMatch[1]) {
//                         query.price = { $lt: parseInt(priceMatch[1]) };
//                     }
//                 } else if (userMsg.includes('above') || userMsg.includes('more than') || userMsg.includes('over')) {
//                     const priceMatch = userMsg.match(/(above|over|more than) (\d+)/);
//                     if (priceMatch && priceMatch[2]) {
//                         query.price = { $gt: parseInt(priceMatch[2]) };
//                     }
//                 }

//                 // Extract location from DB (smart match)
//                 const allLocations = await Listing.distinct("location");
//                 const matchedLocation = allLocations.find(loc => userMsg.includes(loc.toLowerCase()));
//                 if (matchedLocation) {
//                     query.location = matchedLocation;
//                 }

//                 // Fetch filtered listings
//                 const listings = await Listing.find(query).limit(3);

//                 if (listings.length > 0) {
//                     for (const listing of listings) {
//                         socket.emit('botReply', {
//                             type: 'listing',
//                             listing: {
//                                 _id: listing._id,
//                                 title: listing.title,
//                                 description: listing.description.slice(0, 100) + "...",
//                                 price: listing.price,
//                                 image: listing.image.url || listing.image // handle both cases
//                             }
//                         });
//                     }

//                     socket.emit('botReply', {
//                         type: 'text',
//                         message: `✅ Found ${listings.length} matching listings.`
//                     });
//                 } else {
//                     socket.emit('botReply', {
//                         type: 'text',
//                         message: "❌ No matching listings found. Try using keywords like 'Goa', 'beach', or 'under 2000'."
//                     });
//                 }
//             } catch (err) {
//                 console.error(err);
//                 socket.emit('botReply', {
//                     type: 'text',
//                     message: "⚠️ Something went wrong while searching listings."
//                 });
//             }
//         });

//         socket.on('disconnect', () => {
//             console.log('❎ Client disconnected from chatbot');
//         });
//     });
// };

const Listing = require('../models/listing');

module.exports.initChatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('✅ New client connected to chatbot');

        socket.on('userMessage', async (msg) => {
            try {
                const userMsg = msg.toLowerCase();
                let query = {};

               
const allCategories = await Listing.distinct("category"); 
const userMsgLower = msg.toLowerCase();

const matchedCategory = allCategories.find(cat => userMsgLower.includes(cat.toLowerCase()));

if (matchedCategory) {
    query.category = matchedCategory; 
}


                // --- Price Matching ---
                const underMatch = userMsg.match(/(?:under|below|less than)\s*(\d+)/);
                const overMatch = userMsg.match(/(?:over|above|more than)\s*(\d+)/);
                if (underMatch) {
                    query.price = { $lt: parseInt(underMatch[1]) };
                } else if (overMatch) {
                    query.price = { $gt: parseInt(overMatch[1]) };
                }

                // --- Location Matching ---
                const allLocations = await Listing.distinct("location");
                for (let loc of allLocations) {
                    if (userMsg.includes(loc.toLowerCase())) {
                        query.location = loc;
                        break;
                    }
                }

                // --- Fetch Listings ---
                const listings = await Listing.find(query).limit(3);

                if (listings.length > 0) {
                    for (const listing of listings) {
                        socket.emit('botReply', {
                            type: 'listing',
                            listing: {
                                _id: listing._id,
                                title: listing.title,
                                description: listing.description.slice(0, 100) + "...",
                                price: listing.price,
                                image: listing.image.url || listing.image
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
                        message: "❌ No matching listings found. Try keywords like 'village', 'under 3000', or 'goa'."
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
