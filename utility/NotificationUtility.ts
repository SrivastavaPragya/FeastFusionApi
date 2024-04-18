

//Otp
//simpliy generating six digit otp and adding 30 minutes extra on expiry date 
// and finaaly returning an object with otp and expiry 
export const GenerateOtp=()=>{
    const otp=Math.floor(100000+Math.random()*900000)
    let expiry=new Date();
    expiry.setTime(new Date().getTime()+(30*60*1000))
    return{otp,expiry};
}




export const onRequestOTP = async(otp: number, toPhoneNumber: string) => {
    console.log(toPhoneNumber);
    try {
        const accountSid =  process.env.Twillio_APPID;
        const authToken = process.env.TWILLLIO_SECRET;
        const client = require("twilio")(accountSid, authToken);
      
        const response = await client.messages.create({
          body: `Your OTP is ${otp}`,
          from: "+12549463309",
          to: `+91${toPhoneNumber}`,
        });
      
        return response;
    } catch (error){
        return false
    }
    
}