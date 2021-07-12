export interface HotelInterface {
    autoComplete(term);

    search(request,refferal);

    detail(request);

    rooms(request, user_id, referralId);

    availability(request, user_id, referralId);

    book(request, user_id);
}