import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  matches,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNameValid' })
export class IsNameValid implements ValidatorConstraintInterface {
  validate(value: string) {
    // A basic regex for names (letters, spaces, hyphens)
    const nameRegex = /[a-zA-Z\s]+$/;
    return matches(value, nameRegex);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must contain only letters, spaces, and hyphens.`;
  }
}

export function IsValidName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNameValid,
    });
  };
}
