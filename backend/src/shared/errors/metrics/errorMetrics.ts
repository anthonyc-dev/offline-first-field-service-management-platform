export const errorMetrics = {
  totalErrors: 0,
  byStatus: new Map<number, number>(),
};

export const recordError = (status: number) => {
  errorMetrics.totalErrors++;
  errorMetrics.byStatus.set(
    status,
    (errorMetrics.byStatus.get(status) || 0) + 1
  );
};
