import express,{Request ,Response,NextFunction } from 'express';
import { Addfood, GetFoods, GetVandorProfile, UpdateVandorProfile, UpdateVandorservices, VandorLogin } from '../controllers';
import { Authenticate } from '../middlewares/CommonAuth';
import multer from 'multer'
const router=express.Router();
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "images");
    },
    filename: function (req, file, cb) {
      cb(null, new Date().toISOString() + "_" + file.originalname);
    },
  });
  
  const images = multer({ storage: imageStorage }).array("images", 10);

router.post('/login',VandorLogin);
router.use(Authenticate)
router.get('/profile',GetVandorProfile)
router.patch('/profile',UpdateVandorProfile)
router.patch('/service',UpdateVandorservices)
router.post('/food', images,Addfood);
router.get('/foods',GetFoods)

router.get('/',(req:Request,res:Response,next:NextFunction)=>{
    res.json({message:"hello form Vnador Routes"})

})

export {router as VandorRoute};