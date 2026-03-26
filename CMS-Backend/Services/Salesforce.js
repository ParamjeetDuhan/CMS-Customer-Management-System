const axios = require('axios');
require("dotenv").config();
const{SF_LOGIN_URL_Admin,SF_USERNAME_Admin,SF_PASSWORD_Admin,SF_TOKEN_Admin,SF_CLIENT_ID_Admin,SF_CLIENT_SECRET_Admin,SF_REDIRECT_URL_Admin} = process.env;

const getAccessToken = async ()=>{
     try {
        const response = await axios.post(
            `${SF_LOGIN_URL_Admin}/services/oauth2/token?`,null,{
         params:{
            grant_type:"password",
            client_id:SF_CLIENT_ID_Admin,
            client_secret:SF_CLIENT_SECRET_Admin,
            username: SF_USERNAME_Admin,
            password: SF_PASSWORD_Admin+SF_TOKEN_Admin,
            redirect_url:SF_REDIRECT_URL_Admin
         }
            }
    );
    console.log(response.data);
    return response.data;
     } catch (error) {
        console.log("Salesfoce Auth Error",error.response?.data || error.message);
        throw error
     }
};

module.exports = {getAccessToken};