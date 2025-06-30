export function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/[^a-z0-9\-]/g, "") // remove non-alphanumeric except hyphens
    .replace(/\-+/g, "-"); // collapse multiple hyphens

  // const randomSuffix = Math.floor(100000 + Math.random() * 900000); // 6-digit number

  // Create a datetime suffix: e.g., 20240611-134523
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const timestampSuffix = `${datePart}-${timePart}`;
  
  return `${baseSlug}-${timestampSuffix }`;
}
