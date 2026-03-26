const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const{JWT_SECERT } = process.env
const {CustomerSignUp, CustomerLogin} = require('../Services/SalesforceCustomerAuthServices');

const SignUp = async(req,res)=>{
    try {
        const {Name,Email,Phone,Password,UserType} = req.body;
        const hassedPassword = await bcrypt.hash(Password,10);
        const data = {
            Name,
            Email,
            Phone,
            UserType,
            Password :hassedPassword
        }
        const result = await CustomerSignUp(data);
        res.status(201).json({
            data: result
        });
    } catch (error) {
        res.status(500).json({
            error:error.message
        })
    }
};

const Login = async(req,res)=>{
    try {
        const {Email,Password,Name} = req.body;
        const result = await CustomerLogin({Email,Name});
        const parsed = typeof result === "string" ? JSON.parse(result) : result;
        if(!parsed || parsed.status !== "Success"){
           return  res.status(404).json({
            message:"User Not Found"
        })
        }
        const user = parsed.data;
        const isMatch = await bcrypt.compare(Password,user.Password);
        if(!isMatch){
           return res.status(400).json({
            message:"Invalid Credentails"
        })
        }
        const Token = jwt.sign(
            {id :user.Accout_ID,email:user.Email},
            JWT_SECERT,
            {expiresIn:"7d"}
        );
       return res.status(201).json({
            data: result,
            Token
        });
    } catch (error) {
       return res.status(500).json({
            error:error.message
        })
    }
};

module.exports = {SignUp,Login};