type DashboardSimulation = {
  metrics: {
    total_applications: number;
    approved_rate: number;
    average_pd: number;
    portfolio_el: number;
  };
  recent_jobs: [];
  pd_distribution: number[];
  el_over_time: number[];
  job_durations: number[];
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const createSeededRandom = (seed: number) => {
  let value = seed % 233280;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

const randomNormal = (rand: () => number) => {
  const u = rand() || 0.0001;
  const v = rand() || 0.0001;
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

export const generateDashboardSimulation = (): DashboardSimulation => {
  const today = new Date();
  const seed = Number(`${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`);
  const rand = createSeededRandom(seed);

  const totalApplications = Math.round(120 + rand() * 140);
  const averagePd = clamp(0.12 + randomNormal(rand) * 0.03, 0.06, 0.28);
  const approvedRate = clamp(0.68 - averagePd * 0.6 + rand() * 0.08, 0.45, 0.82);
  const averageLoan = 18000 + rand() * 12000;
  const portfolioEl = totalApplications * averagePd * 0.5 * averageLoan;

  const pd_distribution = Array.from({ length: 20 }, () =>
    clamp(averagePd + randomNormal(rand) * 0.04, 0.02, 0.45)
  );

  const el_over_time = Array.from({ length: 12 }, (_, index) => {
    const seasonal = 0.92 + Math.sin(index / 2) * 0.08;
    const drift = 1 + (rand() - 0.5) * 0.1;
    return portfolioEl / 12 * seasonal * drift;
  });

  const job_durations = Array.from({ length: 5 }, () => clamp(0.4 + rand() * 0.5, 0.2, 1));

  return {
    metrics: {
      total_applications: totalApplications,
      approved_rate: approvedRate,
      average_pd: averagePd,
      portfolio_el: portfolioEl
    },
    recent_jobs: [],
    pd_distribution,
    el_over_time,
    job_durations
  };
};
