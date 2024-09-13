import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isNumber,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNumberValid' })
export class IsNumberValid implements ValidatorConstraintInterface {
  validate(value) {
    return isNumber(value); // Use class-validator's built-in number check
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a number.`;
  }
}

export function IsValidNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNumberValid,
    });
  };
}
