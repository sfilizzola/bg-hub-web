import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const BGG_RATE_LIMIT_MS = 5000;
const BGG_503_RETRY_DELAY_MS = 6000;

/**
 * HTTP client for BGG XML API2. Handles auth (Bearer token), rate limiting (~5s between requests),
 * and retry on 503. Responsible only for HTTP; does not parse XML.
 */
@Injectable()
export class BggClient {
  private readonly logger = new Logger(BggClient.name);
  private lastRequestAt = 0;

  constructor(private readonly config: ConfigService) {}

  private getBaseUrl(): string {
    return this.config.get<string>('BGG_BASE_URL', '') || 'https://boardgamegeek.com/xmlapi2';
  }

  private getToken(): string | undefined {
    return this.config.get<string>('BGG_API_TOKEN');
  }

  /**
   * Enforce ~5s between requests to avoid BGG throttling.
   */
  private async waitRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestAt;
    if (elapsed < BGG_RATE_LIMIT_MS) {
      await new Promise((r) => setTimeout(r, BGG_RATE_LIMIT_MS - elapsed));
    }
    this.lastRequestAt = Date.now();
  }

  /**
   * GET request to BGG. Adds Authorization: Bearer if BGG_API_TOKEN is set.
   * Retries once after delay on 503. Returns response text (XML).
   */
  async get(path: string): Promise<string> {
    await this.waitRateLimit();

    const baseUrl = this.getBaseUrl().replace(/\/$/, '');
    const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    const token = this.getToken();

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let res = await fetch(url, { headers });

    if (res.status === 503) {
      this.logger.warn('BGG returned 503, retrying after delay');
      await new Promise((r) => setTimeout(r, BGG_503_RETRY_DELAY_MS));
      await this.waitRateLimit();
      res = await fetch(url, { headers });
    }

    if (!res.ok) {
      this.logger.warn(`BGG request failed: ${res.status} ${url}`);
      throw new Error(`BGG API error: ${res.status}`);
    }

    return res.text();
  }
}
