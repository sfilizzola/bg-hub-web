import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class TrustedUserHidesEndpointGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { trustedUser?: boolean } }>();
    if (request.user?.trustedUser !== true) {
      throw new NotFoundException();
    }
    return true;
  }
}
