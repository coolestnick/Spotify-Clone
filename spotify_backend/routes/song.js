const express = require("express");
const router = express.Router();
const passport = require("passport");
const Song = require("../Models/Song"); 
const User = require("../Models/User");

router.post("/create", passport.authenticate("jwt", {session: false}), async (req, res) => {
    //req.user gets the user because of passport.authenticate
    const { name, thumbnail, track } = req.body;

    if(!name || !thumbnail || !track){
        return res.statusCode(301).json({error: "Insufficient details to create Song"});
    }

    const artist = req.user._id;
    const songDetails = {name, thumbnail, track, artist};
    const createdSong = await Song.create(songDetails);
    return res.status(200).json(createdSong);
});

//Get route to get all songs I have published.

router.get("/get/mysongs", passport.authenticate("jwt", {session: false}),async (req, res)=>{
    const currentUser = req.user;
    const songs = await Song.find({artist: req.user._id});
    return res.status(200).json({data: songs});

});

//Get route to get all songgs any artist has published
//I will send the artist id and I want ti seee all songs that artist has published.

router.get("/get/artist/:artistId", passport.authenticate("jwt", {session: false}), async (req,res) => {
    const {artistId} = req.params;
    const artist = await User.findOne({_id: artistId});

    if(!artist){
        return res.status(301).json({err: "Artist does not exist"});
    }

    const songs = await Song.find({artist: artistId});
    return res.status(200).json({data: songs});

});

//Get route to get a single song by name

// router.get("/get/songname/:songname",passport.authenticate("jwt", {session: false}), async (req, res) => {
//     const {songName} = req.params;

//     const songs = await Song.find({name: songName});
//     return res.status(200).json({data: songs});

// });

router.get("/get/songname/:songname", passport.authenticate("jwt", { session: false }), async (req, res) => {
    const { songname } = req.params;

    const songs = await Song.find({ name: { $regex: new RegExp(songname, "i") } });
    return res.status(200).json({ data: songs });
});


module.exports = router;
