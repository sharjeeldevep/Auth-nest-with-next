import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
// import { Roles } from './common/decorators/roles.decorator';
// import { CreditGuard } from './common/guards/credits-guards';
// import { JwtGuard } from './common/guards/jwt-guards';
// import { RolesGuard } from './common/guards/roles.guards';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  // @UseGuards(JwtGuard, RolesGuard, CreditGuard)
  // @Roles('admin', 'members')
  getHello() {
    return this.appService.getHello();
  }
}
