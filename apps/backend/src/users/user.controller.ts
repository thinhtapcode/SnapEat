import { Controller, Put, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Put('profile')
  async updateProfile(
    @GetUser('id') userId: string, 
    @Body() dto: UpdateProfileDto
  ) {
    return this.userService.updateProfile(userId, dto);
  }
}