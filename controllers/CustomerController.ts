import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { CreateCustomerInput,EditCustomerProfileInput,OrderInputs,UserLoginInput } from '../dto';
import {  validate } from 'class-validator';
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword, onRequestOTP } from '../utility';
import { Customer } from '../models/Customer';
import { Food } from '../models';
import { Order } from '../models/Order';

export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {
    const customerInputs = plainToClass(CreateCustomerInput, req.body);

    const inputErrors = await validate(customerInputs, { validationError: { target: true } });

    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }

    const { email, phone, password } = customerInputs;
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const { otp, expiry } = GenerateOtp();

    const existingCustomer = await Customer.findOne({ email: email });

    if (existingCustomer) {
        return res.status(409).json({ "message": "Customer already exists" });
    }

    const result = await Customer.create({
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
        orders:[]
    });

    if (result) {
        // Send the OTP to customer
        await onRequestOTP(otp, phone);

        // User created successfully, OTP sent
        return res.status(201).json({ verified: result.verified, email: result.email, message: "User created. Please verify with OTP." });
    }

    return res.status(400).json({ msg: 'Error while creating user' });
};



export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {
    const customerInputs = plainToClass(UserLoginInput, req.body);

    const validationError = await validate(customerInputs, { validationError: { target: true } });

    if (validationError.length > 0) {
        return res.status(400).json(validationError);
    }

    const { email, password } = customerInputs;
    const customer = await Customer.findOne({ email: email });
    if (customer) {
        const validation = await ValidatePassword(password, customer.password, customer.salt);

        if (validation) {
            // Generate the Signature asynchronously
            const signature = await GenerateSignature({
                _id: customer._id,
                email: customer.email,
                verified: customer.verified
            });

            // Send the response with the signature
            return res.status(200).json({
                signature,
                email: customer.email,
                verified: customer.verified
            });
        }
    }

    return res.json({ msg: 'Error with Login' });
};



export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {
    const { otp } = req.body;
    const customer = req.user; // Assuming req.user is populated from some middleware

    if (customer) {
        const profile = await Customer.findById(customer._id);
        if (profile) {
            if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
                profile.verified = true;

                const updatedCustomerResponse = await profile.save();

                // Generate the Signature asynchronously
                const signature = await GenerateSignature({
                    _id: updatedCustomerResponse._id,
                    email: updatedCustomerResponse.email,
                    verified: updatedCustomerResponse.verified
                });

                return res.status(200).json({
                    signature,
                    email: updatedCustomerResponse.email,
                    verified: updatedCustomerResponse.verified
                }); 
            } else {
                return res.status(400).json({ msg: 'OTP is invalid or has expired.' });
            }
        } else {
            return res.status(404).json({ msg: 'Customer profile not found.' });
        }
    } else {
        return res.status(401).json({ msg: 'Unauthorized access.' });
    }
};


export  const RequestOtp=async(req:Request,res:Response,next:NextFunction)=>{
    
}


export  const GetCustomerProfile=async(req:Request,res:Response,next:NextFunction)=>{
    const customer = req.user;
 
    if(customer){
        
        const profile =  await Customer.findById(customer._id);
        
        if(profile){
             
            return res.status(201).json(profile);
        }

    }
    return res.status(400).json({ msg: 'Error while Fetching Profile'});
    
}

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {


    const customer = req.user;

    const customerInputs = plainToClass(EditCustomerProfileInput, req.body);

    const validationError = await validate(customerInputs, {validationError: { target: true}})

    if(validationError.length > 0){
        return res.status(400).json(validationError);
    }

    const { firstName, lastName, address } = customerInputs;

    if(customer){
        
        const profile =  await Customer.findById(customer._id);
        
        if(profile){
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            const result = await profile.save()
            
            return res.status(201).json(result);
        }

    }
    return res.status(400).json({ msg: 'Error while Updating Profile'});

}

//order rutes

 export const CreateOrder=async(req:Request,res:Response,next:NextFunction)=>{


    // grab current login customer
    const customer=req.user


    if(customer){
        //create a oreder id
        const orderId = `${Math.floor(Math.random() * 89999)+ 1000}`;
        const profile = await Customer.findById(customer._id);

        


        if (!profile) {
            return res.status(404).json({ msg: 'Profile not found' });
        }

        const cart = <[OrderInputs]>req.body;//[{id:XX,unit:XX}]

        let cartItems = Array();

        let netAmount = 0.0;
      // calculate the order amount
      const foods = await Food.find().where('_id').in(cart.map(item => item._id)).exec();
      foods.map(food => {
        cart.map(({ _id, unit}) => {
            if(food._id == _id){
               
                netAmount += (food.price * unit);
                cartItems.push({ food, unit})
            }
        })
    })

    

    // create order  with  item descriptions

    if(cartItems){
        //create order
        const currentOrder = await Order.create({
            orderId: orderId,
          
            items: cartItems,
            totalAmount: netAmount,
        
            orderDate: new Date(),
            paidThrough:"COD",
            paymentResponse:" ",

            orderStatus: 'Waiting',
           
        })

        if(currentOrder){
           profile.orders.push(currentOrder);
           const profileResponse= await profile.save();

           return res.status(200).json(profileResponse)

        }

    }
    }

    return res.status(400).json({ msg: 'Orders not found'});

}



export const GetOrders=async(req:Request,res:Response,next:NextFunction)=>{
    const customer = req.user;
    
    if(customer){

 
        const profile = await Customer.findById(customer._id).populate("orders");
        if(profile){
            return res.status(200).json(profile.orders);
        }

    }

    return res.status(400).json({ msg: 'Orders not found'});
}



export const GetOrderById=async(req:Request,res:Response,next:NextFunction)=>{
    const orderId = req.params.id;
    
    
    if(orderId){

 
        const order = await Customer.findById(orderId).populate("items.food");
        
        if(order){
            return res.status(200).json(order);
        }

    }

    return res.status(400).json({ msg: 'Order not found'});
}


