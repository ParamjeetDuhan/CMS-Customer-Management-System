const axios = require('axios');
const {getValidToken} =require("../config/SalesforceTokenManager");

const CustomerSignUp = async(SignupData)=>{
   
    const {accessToken,instanceUrl}=await getValidToken();
    const response = await axios.post(
        `${instanceUrl}/services/apexrest/SignUp`,
        SignupData,{
            headers:{
                Authorization :`Bearer ${accessToken}`,
                "Content-Type":"application/json"
            }
        }
    );
    return response.data;
};

const CustomerLogin = async(LoginData)=>{
    console.log(LoginData);
    const {accessToken,instanceUrl}=await getValidToken();
    const response = await axios.post(
        `${instanceUrl}/services/apexrest/login`,
        LoginData,{
            headers:{
                Authorization :`Bearer ${accessToken}`,
                "Content-Type":"application/json"
            }
        }
    );
    return response.data;
};

module.exports = {
    CustomerSignUp,
    CustomerLogin
};