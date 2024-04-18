import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { CreateCustomerInput } from '../dto';
import {  validate } from 'class-validator';
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, onRequestOTP } from '../utility';
import { Customer } from '../models/Customer';

export  const CustomerSignUp=async(req:Request,res:Response,next:NextFunction)=>{
const customerInputs=plainToClass(CreateCustomerInput,req.body)

const inputErrors=await validate(customerInputs,{validationError:{target:true}});

if(inputErrors.length>0){
    return res.status(400).json(inputErrors);
}

const{email,phone,password}=customerInputs;
const salt = await GenerateSalt();
const userPassword = await GeneratePassword(password, salt);


const {otp,expiry}=GenerateOtp();

const existingCustomer=await Customer.findOne({email:email});

if(existingCustomer){
    return res.status(409).json({"message":"Customer already exsists"})

}


const result=await Customer.create({
    email: email,
    password: userPassword,
    salt: salt,
    phone: phone,
    otp: otp,
    otp_expiry: expiry,
    firstName: '',
    lastName: '',
    address: '',
    verified: false,
    lat: 0,
    lng: 0,
})


if (result){
    //send the otp to customer

    await onRequestOTP(otp,phone)

  

   //Generate the Signature
   const signature = await GenerateSignature({
    _id: result._id,
    email: result.email,
    verified: result.verified
})
// Send the result
return res.status(201).json({signature, verified: result.verified, email: result.email})

}

return res.status(400).json({ msg: 'Error while creating user'});


   
}



export  const CustomerLogin=async(req:Request,res:Response,next:NextFunction)=>{
    
}



export  const CustomerVerify=async(req:Request,res:Response,next:NextFunction)=>{
    const { otp } = req.body;
    const customer = req.user;

    if(customer){
        const profile = await Customer.findById(customer._id);
        if(profile){
            if(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()){
                profile.verified = true;

                const updatedCustomerResponse = await profile.save();

                const signature = GenerateSignature({
                    _id: updatedCustomerResponse._id,
                    email: updatedCustomerResponse.email,
                    verified: updatedCustomerResponse.verified
                })

                return res.status(200).json({
                    signature,
                    email: updatedCustomerResponse.email,
                    verified: updatedCustomerResponse.verified
                })
            }
            
        }

    }

    return res.status(400).json({ msg: 'Unable to verify Customer'});
}


export  const RequestOtp=async(req:Request,res:Response,next:NextFunction)=>{
    
}


export  const GetCustomerProfile=async(req:Request,res:Response,next:NextFunction)=>{
    
}

export  const EditCustomerProfile=async(req:Request,res:Response,next:NextFunction)=>{
    
}