export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export const appDefaults = {
  appName: 'MarketWorld',
  apiPrefix: '/api/v1',
};
