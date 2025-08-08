if(process.env.NODE_ENV != "production"){
   require('dotenv').config();
}


console.log(process.env.SECRET)

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const http = require('http').createServer(app);
const io = require('socket.io')(http);



const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

// const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;

main().then(()=>{
    console.log("connected to db");
})
.catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(dbUrl);
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));



const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,

});

store.on("error",(err) =>{
    console.log("Error in MONGO SESSION STORE",err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};

// app.get("/",(req,res) => {
//     res.send("Hi, I am root");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
   
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });





app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


// app.all("*", (req, res, next) => {
//   next(  new ExpressError(404, "Page Not Found!"));
// });
app.use((err, req, res, next) => {
  let { statusCode=500, message="Something went wrong" } = err;
  res.status(statusCode).render("error.ejs",{message});
//   res.status(statusCode).send(message);
});


app.get('/', (req, res) => {
  res.redirect('/listings');
});



// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log("⚡ New user connected");

    // Handle user message
   socket.on('userMessage', async (msg) => {
    try {
        console.log("User:", msg);
        const reply = await generateBotReply(msg); 
        socket.emit('botReply', reply);
    } catch (err) {
        console.error("⚠️ Error generating bot reply:", err.message);
        socket.emit('botReply', "Sorry! Something went wrong. Please try again.");
    }
});

});


async function generateBotReply(message) {
    const lower = message.toLowerCase();

    // Simple keyword filters
    if (lower.includes("cheap") || lower.includes("budget")) {
        const cheapListings = await Listing.find({ price: { $lte: 1000 } }).limit(3);
        if (cheapListings.length) {
            return `Here are some budget stays:\n${cheapListings.map(l => `• ${l.title} in ${l.location} for ₹${l.price}`).join("\n")}`;
        } else {
            return "Couldn't find listings under ₹1000. Try again later!";
        }
    }

    // Search by location
    const locationMatch = await Listing.find({ location: { $regex: message, $options: "i" } }).limit(3);
    if (locationMatch.length) {
        return `Here are stays in ${locationMatch[0].location}:\n${locationMatch.map(l => `• ${l.title} – ₹${l.price}`).join("\n")}`;
    }

    // Default fallback
    return "Hi! I'm WanderBot 🤖. Ask me about locations, prices, or categories.";
}


http.listen(8080, () => {
    console.log("⚡ Server with Socket.IO running on port 8080");
});

// POST Route




// app.get("/testListing", async(req, res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });




