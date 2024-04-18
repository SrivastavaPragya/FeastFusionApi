import express, { Request, Response, NextFunction } from 'express';
import { FoodDoc, Vandor } from '../models';


export const GetFoodAvailability = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode;
    
    const result = await Vandor.find({ pincode: pincode, serviceAvailable: true}).sort([['rating', 'descending']]).populate('foods')

    if(result.length > 0){
        return res.status(200).json(result);
    }

    return res.status(404).json({ msg: 'data Not found!'});


}

export const GetTopRestaurants = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode;
    
    const result = await Vandor.find({ pincode: pincode, serviceAvailable: true}).sort([['rating', 'descending']]).limit(1)

    if(result.length > 0){
        return res.status(200).json(result);
    }

    return res.status(404).json({ msg: 'data Not found!'});
   
}

export const GetFoodsIn30Min = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;
    
    const result = await Vandor.find({ pincode: pincode, serviceAvailable: true}).sort([['rating', 'descending']]).populate('foods');
    if(result.length > 0){
        let foodResult: any = [];
        result.map(vandor => {
            const foods = vandor.foods as [FoodDoc];
            foodResult.push(...foods.filter(food => food.readyTime = 30));
        })
        return res.status(200).json(foodResult);
    }
    
    return res.status(404).json({ msg: 'data Not found!'});
}

export const SearchFoods = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode;
    
    const result = await Vandor.find({ pincode: pincode, serviceAvailable: true}).populate('foods')

    if(result.length > 0){
        return res.status(200).json(result);
    }

    return res.status(404).json({ msg: 'data Not found!'});

}

export const RestaurantById = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    
    const result = await Vandor.findById(id).populate('foods')
    
    if(result){
        return res.status(200).json(result);
    }

    return res.status(404).json({ msg: 'data Not found!'});
   
}


