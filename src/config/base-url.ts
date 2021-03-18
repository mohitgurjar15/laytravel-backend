var path = require("path");
import * as config from 'config'
const conf = config.get('env');

const env = process.env.NODE_ENV || conf.name;
export const BaseUrl = "http://d2q1prebf1m2s9.cloudfront.net/";
export const NewEmailAssets =
    "http://d2q1prebf1m2s9.cloudfront.net/assets/email";
export const FrontEndUrl =
    env == "prod" ? "https://laytrip.com/" : "https://alpha.laytrip.com/";
export const InstagramSocialLink = `https://www.instagram.com/laytrip_travel/`;
export const FacebookSocialLink = `https://www.facebook.com/LaytripTravel`;
export const LinkedInSocialLink = `https://www.linkedin.com/company/laytrip/mycompany/?viewAsMember=true`;
export const PintrestSocialLink = `https://www.pinterest.com/Laytrip/`;
export const TwitterSocialLink = `https://twitter.com/Laytrip_travel`;
export const BookingLink =
    env == "prod"
        ? `https://laytrip.com/account/bookings`
        : `https://alpha.laytrip.com/account/bookings`;
export const TermsConditonLink =
    env == "prod"
        ? `https://laytrip.com/terms`
        : `https://alpha.laytrip.com/terms`;
export const covidLink =
    env == "prod"
        ? `https://laytrip.com/covid-19`
        : `https://alpha.laytrip.com/covid-19`;
export const reviewLink =
    env == "prod"
        ? `https://laytrip.com/cart/confirm/`
        : `https://alpha.laytrip.com/cart/confirm/`;
