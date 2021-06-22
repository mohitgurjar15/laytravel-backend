export const LANDING_PAGE={
    'AS-410' : {
        applicable : true,
        slides : [
            { 
              src: "https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_banner/miami.png",
              location:{
                from : {
                  airport_code : 'NYC'
                },
                to : {
                  airport_code : 'MIA',
                  hotel_option:{
                    title: "Miami Beach, Florida, United States",
                    city: "Miami Beach",
                    banner: "Miami",
                    state: "Florida",
                    country: "United States",
                    type: "city",
                    hotel_id: "",
                    city_id: "800047419",
                    geo_codes: {
                      lat: "25.7903",
                      long: "-80.1303"
                    }
                  }
                }
              }
            },
            { 
              src: "https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_banner/lasvegas.png",
              location:{
                from : {
                  airport_code : 'NYC'
                },
                to : {
                  airport_code : 'LAS',
                  hotel_option:{
                    title: "Las Vegas, Nevada, United States",
                    city: "Las Vegas",
                    banner: "Las Vegas",
                    state: "Nevada",
                    country: "United States",
                    type: "city",
                    hotel_id: "",
                    city_id: "800049030",
                    geo_codes: {
                      lat: "36.1190",
                      long: "-115.1680"
                    }
                  }
                }
              }
            },
            { 
              src: "http://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_banner/cancun.png",
              location:{
                from : {
                  airport_code : 'NYC'
                },
                to : {
                  airport_code : 'CUN',
                  hotel_option:{
                    title: "Cancún, Mexico",
                    city: "Cancún",
                    banner: "Cancun",
                    state: "",
                    country: "Mexico",
                    type: "city",
                    hotel_id: "",
                    city_id: "800026864",
                    geo_codes: {
                      lat: "21.1613",
                      long: "-86.8341"
                    }
                  }
                }
              }
            }
          ],
        deals :{
          flight : [
              {
                from :{ "code":"NYC","name":"All Airports","city":"New York","country":"USA","key":"N"},
                to :  { "code": "DEN","name": "Punta Cana Intl.","city": "Punta Cana","country": "Dominican Republic","image": "https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/puntacana.png","key": "P"}
              },
              {
                from :{ "code":"NYC","name":"All Airports","city":"New York","country":"USA","key":"N"},
                to :  { "code": "TPA","name": "Tampa Intl.","city": "Tampa","country": "USA","key": "T","image": "https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/puntacana.png"}
              },
              {
                from :{ "code":"NYC","name":"All Airports","city":"New York","country":"USA","key":"N"},
                to :  {"code":"CUN","name":"Cancun Intl.","city":"Cancun","country":"Mexico","image":"https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/cancun.png","key":"C"}
              },
              {
                from :{ "code":"NYC","name":"All Airports","city":"New York","country":"USA","key":"N"},
                to :  {"code":"MCO","name":"Orlando Intl.","city":"Orlando","country":"USA","key":"O","image":"https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/orlando.png"}
              },
              {
                from :{ "code":"NYC","name":"All Airports","city":"New York","country":"USA","key":"N"},
                to : {"code":"LAS","name":"Mc Carran Intl","city":"Las Vegas","country":"USA","key":"L","image":"https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/lasvegas.png"}
              },
              {
                from :{ "code":"NYC","name":"All Airports","city":"New York","country":"USA","key":"N"},
                to :  {"code":"DEN","name":"Denver Intl.","city":"Denver","country":"USA","key":"D","image":"https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/denver.png"}
              },
              {
                from :{ "code":"NYC","name":"All Airports","city":"New York","country":"USA","key":"N"},
                to :  {"code":"MIA","name":"Miami Intl. Arpt.","city":"Miami","country":"USA","image":"https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/miami.png","key":"M"},
              },
              {
                from :{ "code":"NYC","name":"All Airports","city":"New York","country":"USA","key":"N"},
                to :  {"code":"TUY","name":"Tulum","city":"Tulum","country":"Mexico","image":"https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/tulum.png","key":"C"}
              },
          ],
          hotel : [
            {
              location : {"title":"Punta Cana, Dominican Republic","city":"Punta Cana","state":"","country":"Dominican Republic","type":"city","hotel_id":"","city_id":"800013751","lat":"18.6149","long":"-68.3884","image":"https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/puntacana.png"}
            },
            {
              location : {"title":"Tampa, Florida, United States","city":"Tampa","state":"Florida","country":"United States","type":"city","hotel_id":"","city_id":"800047518","lat":"27.9472","long":"-82.4586","image":"https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/tampa.png"}
            },
            {
              location : {"title":"Cancún, Mexico","city":"Cancún","city_id":"800026864","state":"","country":"Mexico","type":"city","hotel_id":"","lat":"21.1613","long":"-86.8341","image":"https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/cancun.png"}
            },
            {
              location : {"title":"Orlando, Florida, United States","city":"Orlando","state":"Florida","country":"United States","type":"city","hotel_id":"","city_id":"800047448","lat":"28.5353","long":"-81.3833","image":"https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/orlando.png"}
            },
            {
              location : {"title":"Las Vegas, Nevada, United States","city":"Las Vegas","state":"Nevada","country":"United States","type":"city","hotel_id":"","city_id":"800049030","lat":"36.1190","long":"-115.1680","image":"https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/lasvegas.png"}
            },
            {
              location : {"title":"Denver City, Texas, United States","city":"Denver","state":"Texas","country":"United States","type":"city","hotel_id":"","city_id":"800098479","lat":"32.9644","long":"-102.8290","image":"https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/denver.png"}
            },
            {
              location : {"title":"Miami Beach, Florida, United States","city":"Miami Beach","city_id":"800047419","state":"","country":"United States","type":"city","hotel_id":"","lat":"25.7903","long":"-80.1303","image":"https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/miami.png"}
            },
            {
              location : {"title":"Tulum, Quintana Roo, Mexico","city":"Tulum","state":"Quintana Roo","country":"Mexico","type":"city","hotel_id":"","city_id":"800026663","lat":"20.2107","long":"-87.4630","image":"https://d2q1prebf1m2s9.cloudfront.net/assets/images/lp_deals/tulum.png"}
            }
          ]
        },
        promotional : {
          min_promotional_day : 91,
          max_promotional_day : 365,
        },
        payment_frequency_options:{
            weekly : { applicable : true, visibilty : 'yes' },
            biweekly : { applicable : false, visibilty : 'gray_out' },
            monthly : { applicable : false, visibilty : 'gray_out' }
        },
        down_payment_options:{
            0 : { applicable : true, visibilty : 'yes',   amount : 9.99 },
            1 : { applicable : false, visibilty : 'none', amount : 0 },
            2 : { applicable : false, visibilty : 'none', amount : 0 }
        },
        discount : {
            applicable : true,
            type : 'flat', // [percentage,flat]
            amount : 20
        }
    }
}



