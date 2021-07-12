export interface StrategyAirline {
    oneWaySearch(params1, params2, param3);

    oneWaySearchZip(params1, params2, param3, param4, param5, param6);

    oneWaySearchZipWithFilter(params1, params2, param3, param4, param5, param6, param7);

    baggageDetails(params);

    cancelBooking(param1);

    roundTripSearch(params1, params2, param3);

    roundTripSearchZip(params1, params2, param3, param4, param5, param6);

    roundTripSearchZipWithFilter(
        params1,
        params2,
        param3,
        param4,
        param5,
        param6,
        param7
    );

    airRevalidate(params1, params2, param3);

    bookFlight(params1, params2, param3);

    cancellationPolicy(param1);

    ticketFlight(param1);

    tripDetails(param1);

    getMystiflyCredential();

    startSession();
}