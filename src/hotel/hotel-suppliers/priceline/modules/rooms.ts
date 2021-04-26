import {
    BadRequestException,
    HttpService,
    NotFoundException,
} from "@nestjs/common";
import { RoomHelper } from "../helpers/room.helper";
import { errorMessage } from "src/config/common.config";
import { CommonHelper } from "../helpers/common.helper";
import { catchError } from "rxjs/operators";
import { DetailHelper } from "../helpers/detail.helper";

export class Rooms {
    private roomHelper: RoomHelper;
    private httpsService: HttpService;

    private detailHelper: DetailHelper;

    constructor() {
        this.roomHelper = new RoomHelper();
        this.httpsService = new HttpService();
        this.detailHelper = new DetailHelper();
    }

    async processRoomsResult(res, roomsReqDto) {
        let results = res.data["getHotelExpress.MultiContract"];

        if (results.error) {
            throw new NotFoundException(
                "No result found &&&rooms&&&" + errorMessage
            );
        }

        if (results.results.status && results.results.status === "Success") {
            let hotel = results.results.hotel_data[0];
            //console.log("hotel",hotel)
            let inputData = results.results.input_data;
            // return hotel;
            let rooms: any = this.roomHelper.processRoom(
                hotel,
                roomsReqDto,
                inputData
            );

            let details = this.detailHelper.getHotelDetails(hotel);
            /* let roomPhotos = await this.getRoomPhotos(hotel.id);
            console.log(rooms.items.length,"rooms.length")
            for(let i=0; i <rooms.items.length; i++){
                let roomPhoto = roomPhotos.find(room=>room.roomid_ppn==rooms.items[i].room_id)
                if(roomPhoto){
                    rooms.items[i].photos= roomPhoto;
                }
                else{
                    rooms.items[i].photos=[];
                }
            }
            console.log("rooms",rooms) */
            return { rooms, details };
        }
    }

    async getRoomPhotos(hotel_ids) {
        let urlparameters = {
            function_type: "get",
            hotel_ids: hotel_ids,
            photos: 1,
            resume_key:
                "cv_eMz3g1CmmRquMd3h5crKyqvs128Acx-euiiLc44f_Z-aKZgwH4QPI38uTh9yA8F86tJjQvWrK-IgbJ9fGhQ",
        };

        let url = await CommonHelper.generateUrl(
            "shared/getBOF2.Downloads.Hotel.Rooms",
            urlparameters
        );

        console.log("url", url);
        url = url.replace("/api/hotel/", "/api/");

        let photos = await this.httpsService
            .get(url)
            .pipe(
                catchError((err) => {
                    throw new BadRequestException(
                        err + " &&&term&&&" + errorMessage
                    );
                })
            )
            .toPromise();
        //console.log("photos.data['getSharedBOF2.Downloads.Hotel.Rooms']",photos.data['getSharedBOF2.Downloads.Hotel.Rooms'])
        if (
            typeof photos.data["getSharedBOF2.Downloads.Hotel.Rooms"] !==
            "undefined"
        ) {
            if (
                typeof photos.data["getSharedBOF2.Downloads.Hotel.Rooms"]
                    .results !== "undefined"
            ) {
                return photos.data["getSharedBOF2.Downloads.Hotel.Rooms"]
                    .results.rooms;
            } else {
                return [];
            }
        } else {
            return [];
        }
    }
}
