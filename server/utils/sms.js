const sendSMS = async (phone, message) => {
  if (!process.env.AT_API_KEY || process.env.AT_API_KEY==='your_africastalking_key') {
    console.log(`[SMS MOCK] To:${phone} | ${message}`);
    return {success:true,mock:true};
  }
  try {
    const AT = require('africastalking')({apiKey:process.env.AT_API_KEY,username:process.env.AT_USERNAME||'sandbox'});
    const res = await AT.SMS.send({to:[phone],message,from:process.env.AT_SENDER_ID||'TakaLoop'});
    return {success:true,res};
  } catch(e) { return {success:false,error:e.message}; }
};
module.exports = {sendSMS};
