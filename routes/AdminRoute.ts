import express,{Request ,Response,NextFunction } from 'express';
import { CreateVandor,GetVandors,GetVandorByID } from '../controllers';

const router=express.Router();

// here we will create a route to handle create route function in controller



router.post('/vandor',CreateVandor);
 router.get('/vandors',GetVandors)

router.get('/vandors/:id',GetVandorByID)



router.get('/',(req:Request,res:Response,next:NextFunction)=>{
    res.json({message:"hello form Admin  Routes"})

})

export {router as AdminRoute}
