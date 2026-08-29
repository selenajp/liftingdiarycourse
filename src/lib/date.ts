export function parseDateParam(dateParam: string) {
  const [year, month, day] = dateParam.split("-").map(Number);
  return new Date(year, month - 1, day);
}
