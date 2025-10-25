import { IsString, IsNotEmpty, IsUUID, MinLength, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  message: string;

  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @IsUUID()
  @IsNotEmpty()
  documentId: string;
}

export class CreateSessionDto {
  @IsUUID()
  @IsNotEmpty()
  documentId: string;
}
