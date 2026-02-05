export const formatDateString = (isoDate: string): string => {
  const date = new Date(isoDate);

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(date);
};
