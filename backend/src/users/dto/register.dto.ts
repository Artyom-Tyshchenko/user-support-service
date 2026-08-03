import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { IsAdult } from '../../common/decorators/is-adult.decorator';

export class RegisterDto {
  @ApiProperty({ example: 'Артём Тыщенко' })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(2, 150, { message: 'ФИО должно содержать от 2 до 150 символов' })
  @Matches(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/, {
    message: 'ФИО содержит недопустимые символы',
  })
  fullName!: string;

  @ApiProperty({ example: '2000-01-15' })
  @IsDateString({}, { message: 'Дата рождения должна быть в формате YYYY-MM-DD' })
  @IsAdult()
  birthDate!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Некорректный email' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  email!: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(8, { message: 'Пароль должен содержать не менее 8 символов' })
  @Matches(/[A-Z]/, {
    message: 'Пароль должен содержать хотя бы одну заглавную букву',
  })
  @Matches(/[0-9]/, { message: 'Пароль должен содержать хотя бы одну цифру' })
  password!: string;
}
