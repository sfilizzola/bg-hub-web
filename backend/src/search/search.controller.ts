import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { GlobalSearchResponseDto } from './dto/global-search-response.dto';
import { SearchService } from './search.service';

const API_ERROR = { $ref: '#/components/schemas/ApiErrorDto' };

interface RequestWithOptionalUser {
  user?: { id: string; email: string; username: string };
}

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Global search',
    description: 'Search both games and users by query. When authenticated, excludes current user from results and includes follow flags.',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search query',
    schema: { type: 'string' },
  })
  @ApiResponse({ status: 200, description: 'Games and users', type: GlobalSearchResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async search(@Query('q') q: string, @Request() req: RequestWithOptionalUser) {
    const currentUserId = req.user?.id;
    return this.searchService.search(q ?? '', currentUserId);
  }
}
