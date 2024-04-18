import { Request,Response,NextFunction } from "express";
import { CreateFoodInput, EditVandorInputs, VandorLoginInputs } from "../dto";
import { FindVendor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utility";
import e from "cors";
import { Food } from "../models";


export const VandorLogin=async(req:Request,res:Response,next:NextFunction)=>{
    const {
    
        email,
        password
    }=<VandorLoginInputs>req.body;
    
    
    //checking if vendor laready exsists if not then create
    const existingVandor = await FindVendor('', email);

    if(existingVandor!==null){
        // we eill have to check whether the password and mail is same or not
        const validation=await ValidatePassword(password,existingVandor.password,existingVandor.salt)
       if(validation){

        const signature = await GenerateSignature({
            _id: existingVandor.id,
            email: existingVandor.email,
            foodTypes:existingVandor.foodType,
            name: existingVandor.name
        })
return res.json(signature)
       }
       else{
        return res.json({"message": "password is not valid"})
       }
    }

    return res.json({"message": "login credentials not valid"})
    
    
} 

export const GetVandorProfile=async(req:Request,res:Response,next:NextFunction)=>{
    const user=req.user;
    if(user){
        const existingVandor=await FindVendor(user._id)
        return res.json(existingVandor);
    }
    return res.json({"message":"Vandor info not found"})
}



export const UpdateVandorProfile=async(req:Request,res:Response,next:NextFunction)=>{
    const {foodTypes,name,addresss,phone}=<EditVandorInputs>req.body;
    const user=req.user;
    if(user){
        const existingVandor=await FindVendor(user._id)

        if(existingVandor !== null){

            existingVandor.name = name;
            existingVandor.address;
            existingVandor.phone = phone;
            existingVandor.foodType = foodTypes;
            const saveResult = await existingVandor.save();

            return res.json(saveResult);
       }

    
    return res.json({"message":"Vandor info not found"})
}
}


export const UpdateVandorservices=async(req:Request,res:Response,next:NextFunction)=>{

    const user=req.user;
    if(user){
        const existingVandor=await FindVendor(user._id)

        if(existingVandor !== null){

existingVandor.serviceAvailable=!existingVandor.serviceAvailable;
const saveResult=await existingVandor.save()

            return res.json(saveResult);
       }

       return res.json(existingVandor);
  
}
return res.json({"message":"Vandor info not found"})
}



export const Addfood=async(req:Request,res:Response,next:NextFunction)=>{

    const user=req.user;

    if(user){

    

    const vandor = await FindVendor(user._id);

    const { name, description, category, foodType, readyTime, price } = <CreateFoodInput>req.body;
     
   

       if(vandor !== null){

           
            
            const createdfood = await Food.create({
                vandorId: vandor._id,
                name: name,
                description: description,
                category: category,
                price: price,
                rating: 0,
                readyTime: readyTime,
                foodType: foodType,
                images: ['mock.jpg']
            })
            
            vandor.foods.push(createdfood);
            const result = await vandor.save();
            return res.json(result);
       }

    }
    return res.json({'message': 'Unable to Update vendor profile '})

}
        
  




export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
 
    if(user){

       const foods = await Food.find({ vandorId: user._id});

       if(foods !== null){
            return res.json(foods);
       }

    }
    return res.json({'message': 'Foods not found!'})
}