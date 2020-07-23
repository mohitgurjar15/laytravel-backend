export interface JwtPayload {
    user_id: string;
    username:string,
    phone:string,
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    salt: string;
    profilePic: string;
    accessToken?: string;
    roleId?:number
}