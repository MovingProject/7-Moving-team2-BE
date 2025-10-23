export function parseCookies(header?: string): Record<string, string> {
  if (!header) return {};
  return header.split(';').reduce(
    (acc, part) => {
      const [k, v] = part.split('=');
      if (!k || v === undefined) return acc;
      acc[k.trim()] = decodeURIComponent(v.trim());
      return acc;
    },
    {} as Record<string, string>,
  );
}
