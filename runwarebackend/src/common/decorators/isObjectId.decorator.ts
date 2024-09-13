import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';
import { ObjectId } from 'mongodb';
export function IsMongoObjectId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isMongoObjectId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          if (typeof value !== 'string') {
            return false;
          }
          try {
            return ObjectId.isValid(value);
          } catch (error) {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid MongoDB ObjectId.`;
        },
      },
    });
  };
}
