import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

const API_ERROR = { $ref: '#/components/schemas/ApiErrorDto' };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user with email, username and password. Returns user id, email and username.',
  })
  @ApiBody({
    type: SignupDto,
    examples: {
      default: {
        summary: 'New user',
        value: { email: 'user@example.com', username: 'johndoe', password: 'secret123' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User created', type: AuthUserDto })
  @ApiResponse({ status: 400, description: 'Validation failed', schema: API_ERROR })
  @ApiResponse({ status: 409, description: 'Email or username already in use', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Log in',
    description: 'Authenticates with email and password. Returns a JWT access token for Authorization header.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      default: {
        summary: 'Credentials',
        value: { email: 'user@example.com', password: 'secret123' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid email or password', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Current user',
    description: 'Returns the authenticated user (requires valid JWT in Authorization header).',
  })
  @ApiResponse({ status: 200, description: 'Current user', type: AuthUserDto })
  @ApiResponse({ status: 401, description: 'Unauthorized (missing or invalid token)', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  me(@Request() req: { user: { id: string; email: string; username: string } }) {
    return this.authService.getMe(req.user);
  }
}

