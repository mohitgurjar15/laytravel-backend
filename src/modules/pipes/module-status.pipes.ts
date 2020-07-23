import { PipeTransform, BadRequestException } from "@nestjs/common";
import { moduleStatusEnum } from "../module-status.enum";

export class moduleStatusPipe implements PipeTransform {
	readonly allowedStatus = ["Enable", "Disable"];

	transform(data: { status: string }) {
		const value = data.status;
		if (this.statusValid(value)) {
			if (value == "Enable") {
				return { status: moduleStatusEnum.Enable };
			} else {
				return { status: moduleStatusEnum.Disable };
			}
		} else {
			throw new BadRequestException(`${value} is Not a Valid status`);
		}
	}

	private statusValid(status: any) {
		const idx = this.allowedStatus.indexOf(status);
		if (idx == -1) {
			return false;
		} else {
			return true;
		}
	}
}
