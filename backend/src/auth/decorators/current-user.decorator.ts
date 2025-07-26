import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SessionPayload } from '../auth.service';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SessionPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
