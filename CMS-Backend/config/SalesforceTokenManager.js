
const {getAccessToken} = require("../Services/Salesforce");

let cachedToken = null;
let instanceUrl = null;
let tokenExpiry = null;

const getValidToken = async ()=>{
  if(cachedToken && Date.now()<tokenExpiry){
    return {accessToken:cachedToken,instanceUrl};
  }
  const data = await getAccessToken();
  cachedToken = data.access_token ;
  instanceUrl = data.instance_url;

  tokenExpiry =Date.now() +(1000*60*60*2);
  return{accessToken : cachedToken,instanceUrl};
};

module.exports ={getValidToken};
