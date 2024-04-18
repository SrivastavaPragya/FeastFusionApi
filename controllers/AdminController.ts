import { Request, Response, NextFunction } from 'express';
import {CreateVandorInput} from '../dto'
import { Vandor } from '../models';
import { GenerateSalt,GeneratePassword} from '../utility';


// if email is present the find using mail otherwise find using id
export const FindVendor = async (id: String | undefined, email?: string) => {

    if(email){
        return await Vandor.findOne({ email: email})
    }else{
        return await Vandor.findById(id);
    }

}


// Kind of a post method

export const CreateVandor = async (req: Request, res: Response, next: NextFunction) => {

    // getting the request from the frontend
const { name,
    ownerName,
    foodType,
    address,
    phone,
    email,
    password,pincode
}=<CreateVandorInput>req.body;


//checking if vendor laready exsists if not then create
const existingVandor = await FindVendor('', email);

if(existingVandor!=null){
    return res.json({"message": "vandor already created"})
}

//generate a salt

const salt=await GenerateSalt()
const userPassword=await GeneratePassword(password,salt)
//encrypt the password using the password

    const createdVandor =  await Vandor.create({
        name: name,
        address: address,
        foodType: foodType,
        pincode:pincode,
        email: email,
        password:userPassword,
        salt:salt,
        ownerName: ownerName,
        phone: phone,
        rating: 0,
        serviceAvailable: false,
        coverImages: [],
        foods:[]
    })

    return res.json(createdVandor)
}

// Get request
export const GetVandors = async (req: Request, res: Response, next: NextFunction) => {
    const vandors=await Vandor.find();

    if(vandors!==null){
        return res.json(vandors)
    }
    return res.json({"message":"vandors not available"})
}

// Get request by Id
export const GetVandorByID = async (req: Request, res: Response, next: NextFunction) => {
    const vendorId = req.params.id;

    const vendors = await FindVendor(vendorId);

    if(vendors !== null){
        return res.json(vendors)
    }

    return res.json({"message": "Vendors data not available"})
}

