const express = require("express");
const mongoose = require("mongoose");
const app = express();
const passport = require("passport");
const User = require("./Models/User");
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/song");
const playlistRoutes = require("./routes/playlist");
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
require('dotenv').config();
app.use(express.json());


const port = 8000;

let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "secret";
// passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
//     try {
//       const user = await User.findOne({ id: jwt_payload.sub });
//       if (user) {
//         return done(null, user);
//       } else {
//         return done(null, false);
//         // or you could create a new account
//       }
//     } catch (err) {
//       return done(err, false);
//     }
//   }));
  

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({id: jwt_payload.sub}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });
}));

mongoose.
    connect(
        "mongodb+srv://nickk:" + 
        process.env.MONGO_PASSWORD + 
        "@cluster0.ooqlzx3.mongodb.net/?retryWrites=true&w=majority",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then((x) => {
        console.log("Connection is successful!")
    })
    .catch((err)=>{
        console.log("Failed to connect");
    });

app.get("/",(req,res)=>{
    res.send("hello world");
});

app.use("/auth", authRoutes);
app.use("/song", songRoutes);
app.use("/playlist", playlistRoutes);

app.listen(port,()=>{
    console.log("App is runnung on port " + port);
});
