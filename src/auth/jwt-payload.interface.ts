export interface JwtPayload {
    user_id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    salt: string;
    profilePic: string;
    /* gender: string;
    country: string;
    state: string;
    city: string;
    address: string; */
    zipCode: string;
}