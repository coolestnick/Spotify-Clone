const express = require("express");
const router = express.Router();
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const {getToken} = require("../utils/helper");

//POST route will help to register a user
router.post("/register", async (req,res)=>{
    const { email, password, firstName, lastName, username } = req.body
    //does a user with this email already exists? If yes, we throw an error.
    const user = await User.findOne({email: email});

    if(user){
        return res
        //status code by default is 200
        .status(403)
        .json({error: "A user with email already exists"});
    }


    // We will convert the plain text password to a hash, coz we do not store passwords in plain text.
    const hashedPassword = bcrypt.hash(password, 10);
    //This is a valid request then Create a new user in DB
    const newUserData = {
        email, 
        password: hashedPassword, 
        firstName, 
        lastName, 
        username
    };
    const newUser = await User.create(newUserData);
    
    //We want to create a token to return to the user
    const token = await getToken(email, newUser);


    //Create token to Return the result to the user
    const userToReturn = {...newUser.toJSON(), token};
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
});

router.post("/login",async (req, res)=>{
    //Get email and password by user from req.body
    const {email, password} = req.body;
    // Check if a user with the given email exists.
    const user = await User.findOne({email: email});

    if(!user){
        return res.status(403).json({error: "Invalid Credentials"});
    }
    //If user exists, check if the password is correct. If not, the credeentials are invalid.
    //We cannot do : if(password === user.password) coz the password is now hashed password.
    //bcrypt.compare allow us to compare 1 password in plaintex(password from req.body) to user.password

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(403).json({error: "Invalid Credentials"})
    }

    const token = await getToken(user.email, user);
    const userToReturn ={...user.toJSON, token};
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
});

module.exports = router;