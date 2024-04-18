import express, {Application} from  'express';
import {AdminRoute,CustomerRoute,ShoppingRoute,VandorRoute} from "../routes"
import bodyParser from 'body-parser';
import path from 'path'


export default async(app:Application)=>{
   

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}))
    //helps us to aceess the image files form the server
    app.use('/images',express.static(path.join(__dirname,'images')))
    
    app.use('/admin',AdminRoute);
    app.use('/vandor',VandorRoute);
    app.use('/customer',CustomerRoute)
    app.use(ShoppingRoute);

    return app;
}




