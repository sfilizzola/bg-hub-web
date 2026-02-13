import { AppContainer } from "./AppContainer";
import { HealthMockRepository } from "../../modules/health/infrastructure/HealthMockRepository";

export function createAppContainer(): AppContainer {
  return {
    health: {
      repository: new HealthMockRepository(),
    },
  };
}
