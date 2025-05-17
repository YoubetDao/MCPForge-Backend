export class CreateMcpCardDto {
  name: string;
  author?: string;
  tags?: string[];
  github_url: string;
  description?: string;
  overview?: string;
  tools?: string;
  price?: number;
  configs?: Record<string, any>;
  docker_image?: string;
}
