const express = require("express");
const router = express.Router();
const passport = require("passport");
const Playlist = require("../Models/Playlist");
const User = require("../Models/User");
const Song = require("../Models/Song");

router.post("/create", passport.authenticate("jwt", {session: false}), async (req, res)=>{
    const currentUser = req.user;
    const {name, thumbnail, songs} = req.body;

    if(!name || !thumbnail || !songs){
        return res.status(301).json({err: "Insufficient Data"});
    }

    const playlistData = {
        name,
        thumbnail,
        songs,
        owner: currentUser._id,
        collaborators: [],
    };
    const playlist = await Playlist.create(playlistData);
    return res.status(200).json(playlist);

});

//route 2 : Get playlist by ID
// We will get the playlist ID as a route parameter and we will return the playlist having that id

router.get("/get/playlist/:playlistId", passport.authenticate("jwt", {session: false}), async(req, res) => {
    //This concept is called req.params
    const playlistId = req.params.playlistId;
    //I need to find a playlist with _id = playlisId
    const playlist = await Playlist.findOne({_id: playlistId});
    if(!playlist){
        return res.status(301).json({err: "Invalid ID"});
    }

    return res.status(200).json(playlist);

});

//Get all playlist made by an artist
router.get("/get/artist/:artistId", passport.authenticate("jwt", {session: false}), async (req, res) =>{
    const artistId = req.params.artistId;
    
    const artist = await User.findOne({_id: artistId});

    if(!artist){
        return res.status(304).json({err: "Invalid artist Id"});
    }


    const playlists = await Playlist.find({owner: artistId});
    return res.status(200).json({data: playlists});
});


// Add a song to a playlist
router.post("/add/song", passport.authenticate("jwt", { session: false }), async (req, res) => {
    const currentUser = req.user;
    const { playlistId, songId } = req.body;
  
    const playlist = await Playlist.findOne({ _id: playlistId });
    // Check if playlist is valid or not
    if (!playlist) {
      return res.status(404).json({ err: "Playlist does not exist" });
    }
  
    // Convert owner and currentUser._id to strings for comparison
    const ownerString = playlist.owner.toString();
    const currentUserString = currentUser._id.toString();
  
    // Check if currentUser owns the playlist or is a collaborator
    if (ownerString !== currentUserString && !playlist.collaborators.includes(currentUserString)) {
      return res.status(403).json({ err: "Not Allowed" });
    }
  
    // Check if the song is a valid song (assuming you have a 'Song' model)
    const song = await Song.findOne({ _id: songId }); // Assuming you have a 'Song' model
    if (!song) {
      return res.status(404).json({ err: "Song does not exist" });
    }
  
    // Now we can simply add the song to the playlist
    playlist.songs.push(songId);
    await playlist.save();
  
    return res.status(200).json(playlist);
});

  

module.exports = router;