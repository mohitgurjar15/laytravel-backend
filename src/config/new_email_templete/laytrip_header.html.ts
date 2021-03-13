import { BaseUrl, NewEmailAssets } from "../base-url";

export const LaytripHeader = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <!--[if gte mso 9]>
            <xml>
              <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
    <title>LayTrip</title>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!--<![endif]-->
    <!--[if mso]>
    <style>
      body,table,td {
      font-family: 'Open Sans', sans-serif !important;
      }
    </style>
    <![endif]-->
    <style type="text/css">
    table {
        border-collapse: collapse;
        mso-table-lspace: 0px;
        mso-table-rspace: 0px;
    }

    td,
    a,
    span {
        border-collapse: collapse;
        mso-line-height-rule: exactly;
    }

    p {
        padding: 0 !important;
        margin: 0 !important;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        display: block;
        margin: 0;
    }

    img {
        border: 0;
        outline: none;
        text-decoration: none;
    }

    p,
    a,
    li,
    td,
    blockquote {
        mso-line-height-rule: exactly;
    }

    p,
    a,
    li,
    td,
    body,
    table,
    blockquote {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
    }

    a {
        color: inherit;
        text-decoration: none;
    }

    .mcnPreviewText {
        display: none !important;
    }

    /*assets css start end*/
    body {
        margin: 0 !important;
        padding: 0 !important;
        -webkit-text-size-adjust: 100% !important;
        -ms-text-size-adjust: 100% !important;
        -webkit-font-smoothing: antialiased !important;
    }

    @media only screen and (min-width: 480px) and (max-width: 599px) {
        .oc_wrapper {
            max-width: 100% !important;
            width: 100% !important;
            float: none !important;
        }

        .oc_img100 {
            width: 100% !important;
            height: auto !important;
            max-width: 100% !important;
        }

        .oc_padtop {
            padding-top: 20px !important;
        }

        .oc_text_center {
            text-align: center !important;
        }
    }

    @media only screen and (max-width: 479px) {
        .oc_wrapper {
            max-width: 100% !important;
            width: 100% !important;
            float: none !important;
        }

        .oc_img100 {
            width: 100% !important;
            height: auto !important;
            max-width: 100% !important;
        }

        .oc_padtop {
            padding-top: 20px !important;
        }

        .oc_text_center {
            text-align: center !important;
        }

        u+.body .full-wrap {
            width: 100% !important;
            width: 100vw !important;
        }
    }
    </style>
</head>

<body class="body" style="padding:0; margin:0 auto !important; display:block !important; min-width:100% !important; width:100% !important; background: #ffffff;  -webkit-text-size-adjust:none">
    <!--*|IF:MC_PREVIEW_TEXT|*-->
    <!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">Welcome to LayTrip .....</span>
    <!--<![endif]-->
    <!--*|END:IF|*-->
    <!-- header logo section start -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #ffffff;" class="full-wrap">
        <tr>
            <!-- header logo section start -->
            <td align="center" valign="top">
                <table align="center" style="width:600px; max-width:600px; table-layout:fixed; background: #ffffff;" class="oc_wrapper" width="600" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center" valign="top">
                            <img src="${NewEmailAssets}/email_banner.jpg" alt="" width="100%" height="auto" border="0" style="display: block; max-width: 600px; font-size: 18px; color: #fff;">
                        </td>
                    </tr>
                    <!-- logo section -->
                    <tr>
                        <td align="left" valign="top" style="padding:20px 25px 0px;">
                            <table border="0" cellspacing="0" cellpadding="0" align="left">
                                <tr>
                                    <td align="left" valign="top">
                                        <a href="javascrip:void(0);" target="_blank"><img src="${NewEmailAssets}/dr_logo.png" alt="Laytrip" width="100%" height="auto" border="0" style="display: block; max-width: 135px; font-size: 18px; color: #fff; ">
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>`;