export function slugify(input: string): string {
  const baseSlug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")     // remove special chars
    .replace(/\s+/g, "-")             // replace spaces with dashes
    .replace(/-+/g, "-");             // collapse multiple dashes

  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:.TZ]/g, "")          // remove non-numeric
    .slice(0, 14);                    // get YYYYMMDDHHmmss

  return `${baseSlug}-${timestamp}`;
}
