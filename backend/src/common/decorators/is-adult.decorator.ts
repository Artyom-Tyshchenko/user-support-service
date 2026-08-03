import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsAdult(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAdult',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return false;

          const now = new Date();
          const minAge = new Date(
            now.getFullYear() - 18,
            now.getMonth(),
            now.getDate(),
          );
          return date <= minAge;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property}: пользователь должен быть старше 18 лет`;
        },
      },
    });
  };
}
