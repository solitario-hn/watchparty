// Keep the room's original link; only the player's local URL changes.
export function getStremioPlaybackUrl(url, supportsHevc, sessionId) {
  let source;
  try {
    source = new URL(url);
  } catch {
    return url;
  }

  const isStremioMovie =
    source.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(source.hostname) &&
    source.port === "11470" &&
    /^\/[a-f0-9]{40}\/-?\d+\/?$/i.test(source.pathname);

  if (!isStremioMovie) return url;

  // getRandomValues also works when the site runs over plain HTTP on a LAN.
  const id =
    sessionId ??
    `watchparty-${crypto.getRandomValues(new Uint32Array(4)).join("-")}`;
  const playback = new URL(
    `/hlsv2/${encodeURIComponent(id)}/master.m3u8`,
    source.origin,
  );
  playback.searchParams.set("mediaURL", source.href);
  playback.searchParams.append("videoCodecs", "h264");
  if (supportsHevc) {
    // Copy HEVC video when this browser supports it, saving conversion work.
    playback.searchParams.append("videoCodecs", "hevc");
    playback.searchParams.append("videoCodecs", "h265");
  }
  // Stremio converts unsupported audio to browser-friendly AAC stereo.
  playback.searchParams.set("audioCodecs", "aac");
  playback.searchParams.set("maxAudioChannels", "2");
  return playback.href;
}
