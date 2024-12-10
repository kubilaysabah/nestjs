import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from '@user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const find = await this.userService.findByEmail(registerDto.email);

    if (find) {
      throw new HttpException('E-Mail already exists', 409);
    }

    const user = await this.userService.create(registerDto);

    if (user.status) {
      const accessToken = await this.jwtService.signAsync(user, {
        expiresIn: '1h',
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      const refreshToken = await this.jwtService.signAsync(user, {
        expiresIn: '7d',
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      return { accessToken, refreshToken };
    }

    throw new HttpException('User created successfully but is not active', 403);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.status) {
      throw new HttpException('User is not active', 403);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const userWithoutPassword = { ...user };

    delete userWithoutPassword.password;

    const accessToken = await this.jwtService.signAsync(userWithoutPassword, {
      expiresIn: '1h',
      secret: process.env.ACCESS_TOKEN_SECRET,
    });

    const refreshToken = await this.jwtService.signAsync(userWithoutPassword, {
      expiresIn: '7d',
      secret: process.env.REFRESH_TOKEN_SECRET,
    });

    return { accessToken, refreshToken };
  }
}
