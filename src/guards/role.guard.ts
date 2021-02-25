import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const roles = this.reflector.get<number[]>("roles", context.getHandler());
		if (!roles?.length) {
			return true;
		}
		const request = context.switchToHttp().getRequest();
		const user = request.user;
		console.log('roles',user,roles);
		//return matchRoles(roles, user.roles);
		if (roles.includes(user.roleId)) return true;
		else {
			throw new ForbiddenException(
				`You are not allowed to access this resource.`
			);
		}
	}
}
