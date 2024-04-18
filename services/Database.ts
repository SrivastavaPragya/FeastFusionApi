 
import mongoose from 'mongoose'; 
import { MONGO_URI } from '../config';

export default async() => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB successfully');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

  
  
 