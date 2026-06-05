import { IsArray, IsEmail, IsNotEmpty, IsString, ArrayNotEmpty } from 'class-validator';

export class SendMailDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  to: string[];

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  html: string;
}
