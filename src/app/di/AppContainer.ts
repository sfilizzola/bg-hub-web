export type AppContainer = {
  health: {
    repository: import("../../modules/health/domain/HealthRepository").HealthRepository;
  };
};
