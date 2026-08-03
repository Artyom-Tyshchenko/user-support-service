import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ListUsersDto } from './dto/list-users.dto';

export type SafeUser = Omit<User, 'password'>;

const userSelectSafe = {
  id: true,
  fullName: true,
  birthDate: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private signToken(user: Pick<SafeUser, 'id' | 'email' | 'role'>): string {
    return this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async register(dto: RegisterDto): Promise<{ user: SafeUser; token: string }> {
    const existing = await this.prisma.user.count({
      where: { email: dto.email },
    });
    if (existing > 0) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        birthDate: new Date(dto.birthDate),
        email: dto.email,
        password: hashedPassword,
      },
      select: userSelectSafe,
    });

    const token = this.signToken(user);
    return { user, token };
  }

  async login(dto: LoginDto): Promise<{ user: SafeUser; token: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Аккаунт заблокирован');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const { password: _password, ...safeUser } = user;
    const token = this.signToken(safeUser);
    return { user: safeUser, token };
  }

  async getUserById(
    requesterId: string,
    requesterRole: Role,
    targetUserId: string,
  ): Promise<SafeUser> {
    const isAdmin = requesterRole === Role.admin;
    const isSelf = requesterId === targetUserId;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException(
        'Недостаточно прав для просмотра этого пользователя',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: userSelectSafe,
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async getAllUsers(
    query: ListUsersDto,
  ): Promise<{ users: SafeUser[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, query.page);
    const limit = Math.min(100, Math.max(1, query.limit));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: userSelectSafe,
      }),
      this.prisma.user.count(),
    ]);

    return { users, total, page, limit };
  }

  async blockUser(
    requesterId: string,
    requesterRole: Role,
    targetUserId: string,
  ): Promise<SafeUser> {
    const isAdmin = requesterRole === Role.admin;
    const isSelf = requesterId === targetUserId;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException(
        'Недостаточно прав для блокировки этого пользователя',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: userSelectSafe,
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (!user.isActive) {
      throw new ConflictException('Пользователь уже заблокирован');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: false },
      select: userSelectSafe,
    });
  }
}
