export class CreateMcpCardDto {
  name: string;
  github_url: string;
  description?: string;
  overview?: string;
  tools?: Record<string, any>;
  price?: number;
  configs?: Record<string, any>;
  docker_image?: string;
}
