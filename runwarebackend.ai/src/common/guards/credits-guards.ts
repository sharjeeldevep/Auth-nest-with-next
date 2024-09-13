import { BadRequestException } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common/decorators';
import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces';
import { JwtAuthService } from '../services/jwt-auth.service';

@Injectable()
export class CreditGuard implements CanActivate {
  @Inject(JwtAuthService)
  private readonly jwtAuthService: JwtAuthService;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const user = req.user;

    user.credits = 0;

    if (user.credits <= 0) {
      throw new BadRequestException('Not Enough Credits');
    }

    req.user = user;
    return true;
  }

  protected getRequest<T>(context: ExecutionContext): T {
    return context.switchToHttp().getRequest();
  }
}
