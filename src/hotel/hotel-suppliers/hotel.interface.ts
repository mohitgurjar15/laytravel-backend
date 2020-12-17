export interface HotelInterface{

    autoComplete(term);
    
    search(request);

    detail(request);
    
    rooms(request);
    
    availability(request);
}