import { expect, test } from "bun:test";
import { getStremioPlaybackUrl } from "../src/utils/stremio.js";
import { isValidVideoUrl } from "../src/utils/validation.js";

test("video URL validation rejects script schemes, credentials and invalid input", () => {
  for (const url of [
    "",
    "garbage",
    "javascript:alert(1)",
    "file:///etc/passwd",
    "https://user:pass@example.com",
    "https://example.com/" + "x".repeat(4096),
  ])
    expect(isValidVideoUrl(url)).toBe(false);
  for (const url of [
    "https://example.com/video.mp4",
    "http://localhost:11470/stream",
    " https://youtu.be/test ",
  ])
    expect(isValidVideoUrl(url)).toBe(true);
});
test("ordinary media links remain unchanged", () => {
  const url = "https://example.com/video.mp4";
  expect(getStremioPlaybackUrl(url, false, "test")).toBe(url);
  expect(getStremioPlaybackUrl("invalid", false, "test")).toBe("invalid");
});
test("local Stremio stream converts to session-specific HLS with compatible codecs", () => {
  const original = `http://localhost:11470/${"a".repeat(40)}/0`;
  const url = new URL(getStremioPlaybackUrl(original, false, "session"));
  expect(url.pathname).toBe("/hlsv2/session/master.m3u8");
  expect(url.searchParams.get("mediaURL")).toBe(original);
  expect(url.searchParams.getAll("videoCodecs")).toEqual(["h264"]);
  expect(url.searchParams.get("audioCodecs")).toBe("aac");
  expect(url.searchParams.get("maxAudioChannels")).toBe("2");
  expect(
    new URL(
      getStremioPlaybackUrl(original, true, "session"),
    ).searchParams.getAll("videoCodecs"),
  ).toEqual(["h264", "hevc", "h265"]);
});
