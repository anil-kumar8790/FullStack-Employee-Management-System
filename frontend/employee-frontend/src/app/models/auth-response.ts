export interface LoginResponse{
    success : boolean;
    message : string;
    data : {
        token : string;
        user : {
            id : number;
            name : string;
            email : string;
            role : string;
        }
    }
}