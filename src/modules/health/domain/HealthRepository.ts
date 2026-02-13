import type { HealthStatus } from "./HealthStatus";

export interface HealthRepository {
  getStatus(): Promise<HealthStatus>;
}
