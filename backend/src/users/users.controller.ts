import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.usersService.register(dto);
    return {
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.usersService.login(dto);
    return { success: true, message: 'Авторизация успешна', data: result };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  async getAll(@Query() query: ListUsersDto) {
    const result = await this.usersService.getAllUsers(query);
    return { success: true, data: result };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string, @CurrentUser() currentUser: RequestUser) {
    const user = await this.usersService.getUserById(
      currentUser.id,
      currentUser.role,
      id,
    );
    return { success: true, data: { user } };
  }

  @Patch(':id/block')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async block(@Param('id') id: string, @CurrentUser() currentUser: RequestUser) {
    const user = await this.usersService.blockUser(
      currentUser.id,
      currentUser.role,
      id,
    );
    return { success: true, message: 'Пользователь заблокирован', data: { user } };
  }
}
