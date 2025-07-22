import { ApiProperty } from '@nestjs/swagger';

export class ImportMcpCardDto {
  @ApiProperty()
  github: string;
}
