export interface CreateVandorInput{
    name:string;
    ownerName:string;
    foodType:[string];
    pincode: string;
    address:string;
    phone:string;
    email:string;
    password:string;
}


export interface EditVandorInputs{
    addresss:string;
    name:string;
    phone:string,
    foodTypes:[string];
}

export interface VandorLoginInputs{
    email:string;
    password:string;
}


export interface VandorPayload{
    _id:string;
    email:string;
    name:string;
    foodTypes:[string];
}