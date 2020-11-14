import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";
import * as moment from 'moment';

export function IsValidDate(property: string, validationOptions?: ValidationOptions) {
   return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsValidDate",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    return  typeof value === "string" && moment(value, "YYYY-MM-DD",true).isValid();
                }
            }
        });
   };
}