import { useState } from 'react';
import { palette } from '../game/palette';
import { Card, PixelButton, pixelDisplayFont, pixelFont } from './ui';

interface Mood {
  key: string;
  label: string;
  tag: string;
  playlistId: string;
  playlistName: string;
}

// Public Spotify editorial playlists — each ID checked against Spotify's
// oEmbed endpoint (https://open.spotify.com/oembed?url=...) before being
// hardcoded here. The embed iframe needs no API key or login; playback
// only starts if the person clicks play inside it, so nothing here
// autoplays audio.
const MOODS: Mood[] = [
  { key: 'calm', label: 'need it quiet', tag: 'PEACEFUL PIANO', playlistId: '37i9dQZF1DX4sWSpwq3LiO', playlistName: 'Peaceful Piano' },
  { key: 'focus', label: 'keep steady', tag: 'DEEP FOCUS', playlistId: '37i9dQZF1DWZeKCadgRdKQ', playlistName: 'Deep Focus' },
  { key: 'lift', label: 'need a lift', tag: 'MOOD BOOSTER', playlistId: '37i9dQZF1DX3rxVfibe1L0', playlistName: 'Mood Booster' },
  { key: 'heavy', label: 'sit with the heavy stuff', tag: 'SAD SONGS', playlistId: '37i9dQZF1DX7qK8ma5wgG1', playlistName: 'Sad Songs' },
];

// A small, always-reachable panel (toggled from the app header, so it's
// available on every screen — start, farm, tend, dayend) for picking
// music by how today actually feels, independent of the recovery plan
// itself. Selection is local-only and intentionally not part of
// GameState/localStorage — it's an ambient utility, not plan state.
export function MoodMusicBoard() {
  const [open, setOpen] = useState(false);
  const [moodKey, setMoodKey] = useState<string | null>(null);
  const mood = MOODS.find((m) => m.key === moodKey) ?? null;

  return (
    <div style={{ width: '100%', maxWidth: 880 }}>
      <button
        type="button"
        className="focus-ring"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mood-music-panel"
        style={{
          cursor: 'pointer',
          fontFamily: pixelDisplayFont,
          fontSize: 10,
          padding: '8px 12px',
          border: `2px solid ${palette.cardRing}`,
          background: open ? palette.btnAmberBg : 'rgba(45,28,16,.55)',
          color: open ? palette.ink : '#e8d3ae',
        }}
      >
        {open ? 'CLOSE MOOD MUSIC' : 'MOOD MUSIC'}
      </button>

      {open && (
        <div id="mood-music-panel" role="region" aria-label="Mood music" style={{ marginTop: 10, animation: 'rgUp .25s ease' }}>
          <Card title="WHAT DO YOU NEED RIGHT NOW">
            <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
                {MOODS.map((m) => (
                  <PixelButton
                    key={m.key}
                    onClick={() => setMoodKey(m.key)}
                    bg={m.key === moodKey ? palette.btnAmberBg : palette.btnTanBg}
                    ariaPressed={m.key === moodKey}
                    fontFamily={pixelFont}
                    fontSize={16}
                    padding="12px 14px"
                    style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                  >
                    <span>{m.label}</span>
                    <span style={{ fontFamily: pixelDisplayFont, fontSize: 9, color: palette.tagText }}>{m.tag}</span>
                  </PixelButton>
                ))}
              </div>

              {mood ? (
                <div style={{ border: `3px solid ${palette.tagBorder}`, overflow: 'hidden' }}>
                  <iframe
                    key={mood.playlistId}
                    title={`Spotify playlist: ${mood.playlistName}`}
                    src={`https://open.spotify.com/embed/playlist/${mood.playlistId}`}
                    width="100%"
                    height="352"
                    style={{ display: 'block', border: 0 }}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div style={{ fontSize: 15, color: palette.inkMuted }}>
                  pick whatever fits today — this doesn't have to match the plan.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
