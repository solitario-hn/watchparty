export function isValidVideoUrl(value) {
  if (typeof value !== "string" || !value.trim() || value.length > 4096)
    return false;
  try {
    const url = new URL(value.trim());
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
