const axios = require('axios');
const getToken = async () => {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const base = process.env.MPESA_ENV==='production'?'https://api.safaricom.co.ke':'https://sandbox.safaricom.co.ke';
  const {data} = await axios.get(`${base}/oauth/v1/generate?grant_type=client_credentials`,{headers:{Authorization:`Basic ${auth}`}});
  return data.access_token;
};
exports.stkPush = async ({phone,amount,reference,description}) => {
  const token = await getToken();
  const sc = process.env.MPESA_SHORTCODE||'174379';
  const pk = process.env.MPESA_PASSKEY||'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
  const ts = new Date().toISOString().replace(/[^0-9]/g,'').slice(0,14);
  const pw = Buffer.from(`${sc}${pk}${ts}`).toString('base64');
  const base = process.env.MPESA_ENV==='production'?'https://api.safaricom.co.ke':'https://sandbox.safaricom.co.ke';
  const {data} = await axios.post(`${base}/mpesa/stkpush/v1/processrequest`,{
    BusinessShortCode:sc,Password:pw,Timestamp:ts,TransactionType:'CustomerPayBillOnline',
    Amount:Math.ceil(amount),PartyA:phone.replace('+',''),PartyB:sc,PhoneNumber:phone.replace('+',''),
    CallBackURL:process.env.MPESA_CALLBACK_URL,AccountReference:reference,TransactionDesc:description
  },{headers:{Authorization:`Bearer ${token}`}});
  return data;
};
