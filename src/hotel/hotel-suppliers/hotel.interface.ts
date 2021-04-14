export interface HotelInterface {
    autoComplete(term);

    search(request);

    detail(request);

    rooms(request, user_id);

    availability(request);

    book(request, user_id);
}