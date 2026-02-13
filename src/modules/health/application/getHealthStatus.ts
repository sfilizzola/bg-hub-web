import type { HealthRepository } from "../domain/HealthRepository";

export function getHealthStatus(repo: HealthRepository) {
  return () => repo.getStatus();
}
