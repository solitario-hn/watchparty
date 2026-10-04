let fallbackName;
export default function getUser() {
  try {
    const name = localStorage.getItem("watchparty_name")?.trim();
    if (
      name &&
      name.length <= 40 &&
      name.toLowerCase() !== "system" &&
      !Array.from(name).some(
        (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127,
      )
    )
      return name;
  } catch { /* Storage can be disabled; use the session fallback. */ }
  fallbackName ??= `Guest_${crypto.getRandomValues(new Uint32Array(1))[0] % 10000}`;
  try {
    localStorage.setItem("watchparty_name", fallbackName);
  } catch { /* Storage can be disabled; use the session fallback. */ }
  return fallbackName;
}
