import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from './health/health-response.dto';

const API_ERROR = { $ref: '#/components/schemas/ApiErrorDto' };

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns service liveness. Use for load balancers and readiness probes.',
  })
  @ApiResponse({ status: 200, description: 'Service is healthy', type: HealthResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  getHealth() {
    return { status: 'ok' };
  }
}
