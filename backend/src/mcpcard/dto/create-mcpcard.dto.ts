import { ApiProperty } from '@nestjs/swagger';

export class CreateMcpCardDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  author?: string;

  @ApiProperty({ required: false, type: [String] })
  tags?: string[];

  @ApiProperty()
  github_url: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  overview?: string;

  @ApiProperty({ required: false })
  tools?: string;

  @ApiProperty({ required: false })
  price?: number;

  @ApiProperty({ required: false, type: Object })
  configs?: Record<string, any>;

  @ApiProperty({ required: false })
  docker_image?: string;
}
