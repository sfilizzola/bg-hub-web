import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(payload: SignupDto) {
    const existing = await this.usersRepository.findOne({
      where: [{ email: payload.email }, { username: payload.username }],
    });

    if (existing) {
      throw new ConflictException({
        message: 'Email or username already in use',
      });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = this.usersRepository.create({
      email: payload.email,
      username: payload.username,
      passwordHash,
    });

    const saved = await this.usersRepository.save(user);

    return {
      id: saved.id,
      email: saved.email,
      username: saved.username,
    };
  }

  async login(payload: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: payload.email },
    });

    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
      });
    }

    const valid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
      });
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      username: user.username,
      trustedUser: user.trustedUser,
    });

    return {
      accessToken,
    };
  }

  async getMe(user: { id: string; email: string; username: string }) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }
}

