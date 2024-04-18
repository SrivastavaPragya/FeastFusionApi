import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Request } from 'express';
import { VandorPayload } from '../dto'
import { APP_SECRET } from '../config'
import { AuthPayload } from '../dto/Auth.dto'


export const GenerateSalt=async()=>{
    return await bcrypt.genSalt()
}



export const GeneratePassword=async(password:string,salt:string)=>{

    console.log(`Password: ${password}, Salt: ${salt}`); // Debug log
    return await bcrypt.hash(password,salt)
}


// checking whether the provided passwors is same or not

export const ValidatePassword = async (enteredPassword: string, savedPassword: string, salt: string) => {

    return await GeneratePassword(enteredPassword, salt) === savedPassword;
}

// to check whether the vandor is authenticate user or not we are using jsonwebtoken

export const GenerateSignature = async (payload: AuthPayload) => {

   const signature=jwt.sign(payload,APP_SECRET,{expiresIn:'1d'})
   
   return signature
 
 }


 // function to validate the signature
 export const ValidateSignature  = async(req: Request & { user?:AuthPayload }) => {

    const signature = req.get('Authorization');
    if(signature){
        const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET) as AuthPayload; 
        req.user = payload;
        return true;
    }
    return false
};