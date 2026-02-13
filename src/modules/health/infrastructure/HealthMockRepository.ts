import type { HealthRepository } from "../domain/HealthRepository";
import type { HealthStatus } from "../domain/HealthStatus";

export class HealthMockRepository implements HealthRepository {
  async getStatus(): Promise<HealthStatus> {
    return { ok: true, message: "BG Hub web is running" };
  }
}
