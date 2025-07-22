import { ApiProperty } from '@nestjs/swagger';

export class GenerateMcpServerDto {
  @ApiProperty()
  mcpcard_id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty({ type: Object })
  config: Record<string, any>;
}
