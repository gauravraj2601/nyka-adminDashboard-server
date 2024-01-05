const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../model/user.model");

const userRouter = Router();

userRouter.post("/register", async (req, res) => {
  const { name, email, password, avatar } = req.body;
  try {
    if (!name || !email || !password) {
      res
        .status(422)
        .json({ error: "Please provide name, email and password." });
    }

    const newEmail = email.toLowerCase();
    const emailExists = await UserModel.findOne({ email: newEmail });

    if (emailExists) {
      res.status(422).json({ error: "Email already exists." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      name,
      email: newEmail,
      password: hashedPass,
      avatar,
      created_at: new Date(),
      updated_at:new Date()
    });
/*
 {
    name: {
      type: String,
      required: true,
      maxlength: 50,
    },
    avatar: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
    },
    updated_at: {
      type: Date,
    },
  },
*/

    res
      .status(201)
      .json(`New user:${newUser} and for this email ${newEmail} is created`);
  } catch (error) {
    res
      .status(422)
      .json({ error: error.message, err: "this is the catch error" });
  }
});

userRouter.post("/login", async(req, res)=>{
  const {email, password}= req.body;
  try {
      const user= await User_Model.findOne({email})
      if(!user){
          res.status(400).send({msg:"User Not found"})
      }
      if(user){
          bcrypt.compare(password, user.password, async(err, result)=> {
              // result == true
              if(err){
                  return res.status(400).send({error:"bcrypt compare error",err})
              }
              if(result){
                  res.status(200).send({msg:"Login Successful",
                  "token":jwt.sign({ userId:user._id,username:user.username }, process.env.JWT_KEY)
              })
              }
          });
      }
      else{
          return res.status(400).send({error:"Wrong Credentials"})
      }
  } catch (error) {
      return res.status(400).send({error:error.message})
  }
})


module.exports = { userRouter };
