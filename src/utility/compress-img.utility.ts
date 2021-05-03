const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");

export class CompressImgUtility {
    static async compressImg(req, file) {
        let name = file.originalname.split(".")[0];
        name = name.split(" ").join("");
        const files = await imagemin(
            [`./assets/profile/${name}.{jpg,png,jpeg}`],
            {
                destination: "./assets/profile/",
                plugins: [
                    imageminJpegtran(),
                    imageminPngquant({
                        quality: [0.6, 0.8],
                    }),
                ],
            }
        );
        console.log(files);

        //=> [{data: <Buffer 89 50 4e …>, destinationPath: 'build/images/foo.jpg'}, …]
    }
}
