import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { errorMessage } from 'src/config/common.config';
import { AppVersions } from 'src/entity/app-version.entity';
import { getConnection, getManager } from 'typeorm';
import { AddVersionDto } from './dto/add-version.dto'
import { CheckForceUpdateDto } from './dto/check-force-update.dto'

@Injectable()
export class AppVersionService {

	async addVersion(addVersionDto: AddVersionDto) {
		try {
			const { device_type, force_update, version, name, url } = addVersionDto


			const appVersion = new AppVersions

			appVersion.deviceType = device_type
			appVersion.forceUpdate = force_update
			appVersion.version = version
			appVersion.name = name
			appVersion.url = url
			appVersion.uploadDate = new Date();
			await appVersion.save();

			return { message: `version added succefully` }
		} catch (error) {
			if (typeof error.response !== "undefined") {
				console.log("m");
				switch (error.response.statusCode) {
					case 404:
						throw new NotFoundException(error.response.message);
					case 409:
						throw new ConflictException(error.response.message);
					case 403:
						throw new ForbiddenException(error.response.message);
					case 422:
						throw new BadRequestException(error.response.message);
					case 500:
						throw new InternalServerErrorException(error.response.message);
					case 406:
						throw new NotAcceptableException(error.response.message);
					case 404:
						throw new NotFoundException(error.response.message);
					case 401:
						throw new UnauthorizedException(error.response.message);
					default:
						throw new InternalServerErrorException(
							`${error.message}&&&id&&&${error.Message}`
						);
				}
			}
			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}

	async checkForceUpdate(checkForceUpdateDto: CheckForceUpdateDto) {
		const { version, device_type } = checkForceUpdateDto

		let data = await getManager().query(`SELECT "appVersions"."id" AS "appVersions_id", "appVersions"."device_type" AS "appVersions_device_type", "appVersions"."force_update" AS "appVersions_force_update", "appVersions"."version" AS "appVersions_version", "appVersions"."name" AS "appVersions_name", "appVersions"."url" AS "appVersions_url", "appVersions"."upload_date" AS "appVersions_upload_date" FROM "app_version" "appVersions" WHERE device_type = ${device_type} AND  version = '${version}'`)



		console.log(
			data
		);

		if (!data.length) {

			const result = await getManager().query(`SELECT id, force_update, version, name, url, upload_date
		FROM app_version where device_type = ${device_type} ORDER BY id DESC`
			)
			if (await this.checkGraterVersion(version, result[0].version)) {
				return {
					force_update: false
				}
			}
			if (result.length) {
				return result[0]
			}
			else {
				throw new NotAcceptableException(`Given device type is wrong please contact administration`)
			}

		}
		const forceUpdateData = await getManager().query(`SELECT id, force_update, version, name, url, upload_date
		FROM app_version where id > ${data[0].appVersions_id} AND force_update = true AND device_type = ${data[0].appVersions_device_type} ORDER BY id DESC`)

		if (!forceUpdateData.length) {
			return {
				force_update: false
			}
		}

		return forceUpdateData[0]
	}

	async checkGraterVersion(version1, version2) {
		console.log('version1',version1);
		console.log('version2',version2);
		
		
		const version1Array = version1.split('.')
		const version2Array = version2.split('.')

		console.log('version1Array',version1Array);
		console.log('version2Array',version2Array);
		
		
		if (version1Array[0] > version2Array[0]) {
			return true
		}
		else if (version1Array[0] == version2Array[0] && version1Array[1] > version2Array[1] && version1Array[1] && version2Array[1]) {
			return true
		}
		else if (version1Array[0] == version2Array[0] && version1Array[1] == version2Array[1] && version1Array[2] >= version2Array[2] && version1Array[2] && version2Array[2]) {
			return true
		}
		else {
			return false
		}
	}
}
