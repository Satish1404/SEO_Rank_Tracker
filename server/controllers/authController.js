import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

//generate token
const generateToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "40d"})
}

// register user

export const register = async(req, res)=>{
    try{
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({success: false, message: "All fields are required"})
        }
        //check if user is exists
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({success: false, message:"User alredy exists"})
        }

        //has password
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

        //create user
        const user = await User.create({name, email, password: hashedPassword});

        const token = generateToken(user._id);

        res.status(201).json({success: true, user, token})

    }catch(error){
      console.error("Register error:", error.message)
      res.status(500).json({success: false, message:"server error"})
    }
}

//login user

export const login = async(req, res)=>{
    try{
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({success: false, message:"All fields are required"})
    }

     //find user
    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({success: false, message:"Invalid Credentials" })
    }

     //check password
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(400).json({success: false, message: "Invalid Credentials"})
    }

    const token = generateToken(user._id)
    
    res.status(200).json({success: true, user, token})


    }catch(error){
      console.error("login error:", error.message)
      res.status(500).json({success: false, message: "Server Error"})
    }
}

//get current user 
export const getUser = async(req, res)=>{
try{
    const user = await User.findById(req.userId).select("-password");
    console.log(user)
    if(!user){
        return res.status(400).json({success: false, message: "User Not Found"})
    }
    res.json({success: true, user})

}catch(error){
  console.error("Get user error", error.message);
  return res.status(500).json({success: false, message: "server error"})
}
}