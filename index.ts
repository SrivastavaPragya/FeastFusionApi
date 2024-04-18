import express from 'express';
import App from './services/ExpressApp';
import dbConnection from './services/Database';
import dotenv from 'dotenv';



const StartServer = async () => {

    dotenv.config()

    const app = express();

    await dbConnection()

    await App(app);

    app.listen(8000, () => {
        console.log("Listening to port 8000 ");
    })
}

StartServer();