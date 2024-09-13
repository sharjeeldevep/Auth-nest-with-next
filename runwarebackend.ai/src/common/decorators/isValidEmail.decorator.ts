import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isEmail,
} from 'class-validator';

@ValidatorConstraint({ name: 'isEmailValid' }) // Create a custom constraint
export class IsEmailValid implements ValidatorConstraintInterface {
  validate(value: string) {
    return isEmail(value); // Use class-validator's built-in email check
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid email address.`;
  }
}

export function IsValidEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsEmailValid,
    });
  };
}
