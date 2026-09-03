# ทายชื่อสมาชิก (Guess the Member)

Identify a club member from cropped parts of their profile photo — eyes, nose
and mouth — across five difficulty levels.

## Where the data comes from

The game reads the **current season roster** straight from the live schema:

```
seasons ──< rosters >── players
                └──── teams
```

- `players.photo_url` is the profile photo. Only members who have one can be the
  subject of a question; everyone else on the roster is still used as a decoy
  answer, which keeps the choices plausible.
- The season is resolved by `is_current_default`, not taken from `SeasonContext`.

`src/services/game/gameSupabase.ts` reaches these tables through an untyped
client, because the generated `integrations/supabase/types.ts` still describes
the older `members` schema. Regenerating the Supabase types will let that file
go away.

## Levels

| Level | Shown at the start | Answering | Base points |
|-------|--------------------|-----------|-------------|
| 1 | eyes + nose + mouth | 4 choices | 100 |
| 2 | eyes + mouth | 4 choices | 150 |
| 3 | eyes | 4 choices | 200 |
| 4 | nose | 6 choices | 300 |
| 5 | mouth | typed, with autocomplete | 400 |

A wrong answer or a hint reveals one more part and drops what the question is
still worth (100% → 60% → 35% → 15%). After the reveals run out the answer is
shown and the question scores nothing. High scores are kept per level in
`localStorage`; a shared leaderboard would need a Supabase table and a write
policy.

## How the crops are produced

Two sources, in order of preference:

1. **Landmark detection** — `@vladmandic/face-api` with the tiny detector and
   tiny 68-point landmark model (~280 kB total, served from `public/models`).
   face-api is dynamically imported so it stays out of the main bundle, and the
   models load only when a round needs them. Results are cached in
   `localStorage` per photo URL, so each photo is analysed once per browser.
2. **A portrait heuristic** — fixed proportions for a roughly centred head, in
   `faceRegions.ts`.

Detection needs pixel access, which needs the photo host to send CORS headers.
If it does not — or the models fail to load, or no face is found — the game
falls back to the heuristic crops and stays fully playable. After three photos
in a row come back empty, detection switches itself off for the session.

Crops are drawn with CSS background positioning rather than a canvas, precisely
so that a photo host without CORS still renders. Tiles are never enlarged more
than 2.5x their real pixel size, since a small crop blown up to fill the card is
unreadable.

## Updating the models

The four model files in `public/models` are copied from the package:

```sh
cp node_modules/@vladmandic/face-api/model/{tiny_face_detector_model,face_landmark_68_tiny_model}{-weights_manifest.json,.bin} public/models/
```
