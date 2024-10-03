type ClassValue = string | number | boolean | undefined | null;

export function clsx(...args: ClassValue[]): string {
  return args.filter(Boolean).join(' ');
}

// Helper function to convert UTC date to local datetime-local string
export const utcToLocal = (utcDate: Date | null | undefined): string => {
  if (!utcDate) {
    return '';
  }
  const localDate = new Date(utcDate);
  return (
    localDate
      // sv-SE is the locale for Sweden, which uses 24-hour time format. Looks weird, but I was told by Claude that it's fine
      // I could use date-fns/format though
      .toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(' ', 'T')
  );
};
