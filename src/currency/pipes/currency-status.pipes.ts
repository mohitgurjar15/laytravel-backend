import { PipeTransform, BadRequestException } from "@nestjs/common";
import { CurrencyStatusEnum } from "../currency-status.enum";


export class CurrencytStatusPipe implements PipeTransform {
	readonly allowedStatus = ["Enable", "Disable"];

	transform(data: { status: string }) {
		const value = data.status;
		if (this.statusValid(value)) {
			if (value == "Enable") {
				return { status: CurrencyStatusEnum.Enable};
			} else {
				return { status: CurrencyStatusEnum.Disable};
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
