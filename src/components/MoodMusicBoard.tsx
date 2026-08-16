import { useState } from 'react';
import { palette } from '../game/palette';
import { CRISIS_MESSAGE, detectsCrisisLanguage } from '../game/safety';
import { Card, PixelButton, pixelDisplayFont, pixelFont } from './ui';

interface Mood {
  key: string;
  label: string;
  tag: string;
  playlistId: string;
  playlistName: string;
  // Free-text matching terms — checked as substrings against whatever
  // someone types, on top of the mood's own key/label/tag words.
  keywords: string[];
}

// Real, public Spotify editorial playlists — every ID checked against
// Spotify's oEmbed endpoint (https://open.spotify.com/oembed?url=...)
// before being hardcoded here. The embed iframe needs no API key or
// login; playback only starts if someone clicks play inside it.
const MOODS: Mood[] = [
  { key: 'calm', label: 'need it quiet', tag: 'PEACEFUL PIANO', playlistId: '37i9dQZF1DX4sWSpwq3LiO', playlistName: 'Peaceful Piano', keywords: ['calm', 'quiet', 'peaceful', 'still', 'overwhelmed', 'gentle', 'soft', 'settle'] },
  { key: 'focus', label: 'keep steady', tag: 'DEEP FOCUS', playlistId: '37i9dQZF1DWZeKCadgRdKQ', playlistName: 'Deep Focus', keywords: ['focus', 'concentrate', 'steady', 'productive', 'deadline', 'working', 'deep work'] },
  { key: 'lofi', label: 'quiet concentration', tag: 'LOFI BEATS', playlistId: '37i9dQZF1DWWQRwui0ExPn', playlistName: 'lofi beats', keywords: ['lofi', 'lo-fi', 'study', 'studying', 'homework', 'chill focus', 'background'] },
  { key: 'lift', label: 'need a lift', tag: 'MOOD BOOSTER', playlistId: '37i9dQZF1DX3rxVfibe1L0', playlistName: 'Mood Booster', keywords: ['lift', 'boost', 'pick me up', 'low', 'meh', 'blah', 'need energy'] },
  { key: 'feelgood', label: 'actually doing okay', tag: "FEELIN' GOOD", playlistId: '37i9dQZF1DX9XIFQuFvzM4', playlistName: "Feelin' Good", keywords: ['good', 'happy', 'great', 'content', 'okay today', 'fine today', 'light'] },
  { key: 'goodvibes', label: 'chasing a good-weather feeling', tag: 'GOOD VIBES', playlistId: '37i9dQZF1DWYBO1MoTDhZI', playlistName: 'Good Vibes', keywords: ['sunny', 'summer', 'warm', 'bright', 'good vibes', 'breezy'] },
  { key: 'confidence', label: 'need to feel capable', tag: 'CONFIDENCE BOOST', playlistId: '37i9dQZF1DX4fpCWaHOned', playlistName: 'Confidence Boost', keywords: ['confidence', 'capable', 'nervous about', 'interview', 'big day', 'presentation', 'brave'] },
  { key: 'badasswalk', label: "walking out the door like it's a big deal", tag: 'WALK LIKE A BADASS', playlistId: '37i9dQZF1DX1tyCD9QhIWF', playlistName: 'Walk Like A Badass', keywords: ['badass', 'strut', 'main character', 'walking out', 'unstoppable', 'powerful'] },
  { key: 'morning', label: 'starting slow today', tag: 'MORNING MOTIVATION', playlistId: '37i9dQZF1DXc5e2bJhV6pu', playlistName: 'Morning Motivation', keywords: ['morning', 'waking up', 'slow start', 'groggy', 'first thing'] },
  { key: 'workout', label: 'need to move', tag: 'BEAST MODE', playlistId: '37i9dQZF1DX76Wlfdnj7AP', playlistName: 'Beast Mode', keywords: ['workout', 'gym', 'exercise', 'run', 'running', 'move my body', 'restless', 'pumped'] },
  { key: 'singalong', label: 'need to yell-sing something', tag: 'SONGS TO SING IN THE CAR', playlistId: '37i9dQZF1DWWMOmoXKqHTD', playlistName: 'Songs to Sing in the Car', keywords: ['sing', 'scream', 'car', 'loud', 'belt it out', 'yell'] },
  { key: 'cooking', label: 'cooking, not thinking', tag: 'DINNER WITH FRIENDS', playlistId: '37i9dQZF1DX4xuWVBs4FgJ', playlistName: 'Dinner with Friends', keywords: ['cooking', 'kitchen', 'dinner', 'making food', 'domestic', 'puttering'] },
  { key: 'nostalgia', label: 'missing an earlier version of myself', tag: 'THROWBACK JAMS', playlistId: '37i9dQZF1DX8ky12eWIvcW', playlistName: 'Throwback Jams', keywords: ['nostalgia', 'nostalgic', 'throwback', 'used to', 'remember when', 'old me', 'younger'] },
  { key: 'rainy', label: 'matching the weather', tag: 'RAINY DAY', playlistId: '37i9dQZF1DXbvABJXBIyiY', playlistName: 'Rainy Day', keywords: ['rain', 'rainy', 'grey day', 'gray day', 'gloomy', 'window'] },
  { key: 'anxious', label: 'need to come down a notch', tag: 'CALM DOWN', playlistId: '37i9dQZF1DX5bjCEbRU4SJ', playlistName: 'Calm Down', keywords: ['anxious', 'anxiety', 'nervous', 'panic', 'spiraling', 'stressed', 'on edge', 'racing thoughts'] },
  { key: 'angry', label: 'actually just angry', tag: 'ANGRY MIX', playlistId: '37i9dQZF1EIgNZCaOGb0Mi', playlistName: 'Angry Mix', keywords: ['angry', 'mad', 'furious', 'rage', 'pissed', 'frustrated', 'irritated'] },
  { key: 'heartbreak', label: 'missing someone', tag: 'HEARTBROKEN MIX', playlistId: '37i9dQZF1EIf7xoQBl4aZ1', playlistName: 'Heartbroken Mix', keywords: ['heartbreak', 'heartbroken', 'breakup', 'broke up', 'ex', 'missing him', 'missing her', 'missing them', 'lonely', 'lovesick'] },
  { key: 'heavy', label: 'sit with the heavy stuff', tag: 'SAD SONGS', playlistId: '37i9dQZF1DX7qK8ma5wgG1', playlistName: 'Sad Songs', keywords: ['sad', 'heavy', 'grief', 'crying', 'need to cry', 'awful', 'exhausted', 'hopeless', "can't"] },
  { key: 'sleep', label: 'trying to wind down', tag: 'SLEEP', playlistId: '37i9dQZF1DWZd79rJ6a7lp', playlistName: 'Sleep', keywords: ['sleep', 'sleepy', 'tired', 'bedtime', 'wind down', 'insomnia', 'exhausted', 'night'] },
];

function normalize(s: string) {
  return s.toLowerCase().trim();
}

// Local, no-backend "matching": score every mood by how many of its own
// name/keywords show up as substrings of what was typed, take the best
// score above zero. Deliberately simple — this isn't trying to be a real
// search engine, just a friendlier front door onto a curated library than
// nineteen buttons in a row.
function matchMood(query: string): Mood | null {
  const q = normalize(query);
  if (!q) return null;
  let best: Mood | null = null;
  let bestScore = 0;
  for (const mood of MOODS) {
    const haystack = [mood.key, mood.label, mood.playlistName, ...mood.keywords].map(normalize);
    let score = 0;
    for (const term of haystack) {
      if (term.length < 3) continue;
      if (q.includes(term) || term.includes(q)) score += term.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = mood;
    }
  }
  return best;
}

// A small, always-reachable panel (toggled from the app header, so it's
// available on every screen — start, farm, tend, dayend) for finding music
// by how today actually feels, independent of the recovery plan itself.
// Selection is local-only and intentionally not part of GameState /
// localStorage — it's an ambient utility, not plan state.
export function MoodMusicBoard() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [moodKey, setMoodKey] = useState<string | null>(null);
  const [searchedFor, setSearchedFor] = useState<string | null>(null);
  const [noMatch, setNoMatch] = useState(false);
  const [crisis, setCrisis] = useState(false);

  const mood = MOODS.find((m) => m.key === moodKey) ?? null;

  const pick = (m: Mood) => {
    setMoodKey(m.key);
    setSearchedFor(null);
    setNoMatch(false);
    setCrisis(false);
  };

  const runSearch = () => {
    const q = query.trim();
    if (!q) return;
    // Checked before any mood matching — this isn't a "mood" the playlist
    // library should try to serve music for, cheerfully or otherwise.
    if (detectsCrisisLanguage(q)) {
      setMoodKey(null);
      setSearchedFor(q);
      setNoMatch(false);
      setCrisis(true);
      return;
    }
    const found = matchMood(q);
    if (found) {
      setMoodKey(found.key);
      setSearchedFor(q);
      setNoMatch(false);
      setCrisis(false);
    } else {
      setMoodKey(null);
      setSearchedFor(q);
      setNoMatch(true);
      setCrisis(false);
    }
  };

  const surpriseMe = () => {
    const others = MOODS.filter((m) => m.key !== moodKey);
    const pool = others.length ? others : MOODS;
    pick(pool[Math.floor(Math.random() * pool.length)]);
  };

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label htmlFor="mood-query" style={{ fontFamily: pixelDisplayFont, fontSize: 10, color: palette.tagText }}>
                  TYPE WHATEVER'S TRUE RIGHT NOW
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    id="mood-query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') runSearch();
                    }}
                    placeholder="heartbroken, need to focus, pumped for the gym, anything"
                    style={{
                      flex: '1 1 260px',
                      minWidth: 0,
                      fontFamily: pixelFont,
                      fontSize: 16,
                      padding: '11px 12px',
                      border: `3px solid ${palette.cardBorder}`,
                      background: palette.inputBg,
                      color: palette.inkDark,
                      outline: 'none',
                    }}
                  />
                  <PixelButton onClick={runSearch} bg={query.trim() ? palette.btnGreenBg : palette.btnTendedBg} fontSize={11} padding="0 16px" minHeight={44}>
                    FIND MUSIC
                  </PixelButton>
                  <PixelButton onClick={surpriseMe} bg={palette.btnWaterBg} fontSize={11} padding="0 16px" minHeight={44}>
                    SURPRISE ME
                  </PixelButton>
                </div>
              </div>

              <div>
                <div style={{ fontFamily: pixelDisplayFont, fontSize: 9, color: palette.tagText, marginBottom: 8 }}>
                  OR PICK ONE ({MOODS.length} MOODS)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {MOODS.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      className="focus-ring"
                      onClick={() => pick(m)}
                      aria-pressed={m.key === moodKey}
                      style={{
                        cursor: 'pointer',
                        fontFamily: pixelFont,
                        fontSize: 13,
                        padding: '7px 10px',
                        border: `2px solid ${palette.cardBorder}`,
                        background: m.key === moodKey ? palette.btnAmberBg : palette.cardBg,
                        color: palette.ink,
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div aria-live="polite">
                {crisis && (
                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.5,
                      color: palette.inkDark,
                      background: palette.inputBg,
                      border: `3px solid ${palette.cardBorder}`,
                      padding: 14,
                    }}
                  >
                    {CRISIS_MESSAGE}
                  </div>
                )}

                {!crisis && noMatch && searchedFor && (
                  <div style={{ fontSize: 15, color: palette.inkMuted, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span>don't have a playlist tuned for "{searchedFor}" yet — but here's a direct line to Spotify's own search for it.</span>
                    <a
                      href={`https://open.spotify.com/search/${encodeURIComponent(searchedFor)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring"
                      style={{ fontFamily: pixelDisplayFont, fontSize: 11, color: palette.linkOnCard, textDecoration: 'underline' }}
                    >
                      SEARCH "{searchedFor.toUpperCase()}" ON SPOTIFY ↗
                    </a>
                  </div>
                )}

                {mood && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 14, color: palette.inkMuted }}>
                      {searchedFor ? (
                        <>
                          closest match for "{searchedFor}": <strong>{mood.playlistName}</strong>
                        </>
                      ) : (
                        <>playing: {mood.playlistName}</>
                      )}
                    </div>
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
                  </div>
                )}

                {!crisis && !mood && !noMatch && (
                  <div style={{ fontSize: 15, color: palette.inkMuted }}>
                    type anything, hit surprise me, or pick from the list — this doesn't have to match the plan.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
