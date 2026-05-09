# Audio Files

The game references these files. Missing files don't crash — they just stay silent.
Drop `.mp3` files matching the names below to enable sounds.

## Required filenames

### `public/sounds/sfx/`  (short, ~0.1–1.5s clips)

| Filename | When it plays |
|---|---|
| `card_draw.mp3` | New hand dealt at turn start |
| `card_play.mp3` | Card is clicked/played |
| `card_select.mp3` | Card hover (optional) |
| `button.mp3` | UI button click |
| `hit_light.mp3` | Damage dealt < 8 |
| `hit_heavy.mp3` | Damage dealt ≥ 8 |
| `block.mp3` | Block absorbs damage |
| `heal.mp3` | HP gain |
| `death.mp3` | Enemy or player dies |
| `attack_slash.mp3` | Attack-type card played |
| `attack_magic.mp3` | Skill card played |
| `attack_special.mp3` | Power card played |
| `energy_use.mp3` | Energy orb consumed |
| `turn_end.mp3` | End Turn button |
| `victory.mp3` | Combat won |
| `defeat.mp3` | Player dies |
| `gold.mp3` | Gold gained |
| `level_up.mp3` | Card upgrade / max-HP up |

### `public/sounds/music/`  (loops, ~30s–2min, will fade in/out)

| Filename | When it plays |
|---|---|
| `menu.mp3` | Main menu, character select, map |
| `combat.mp3` | Normal combat |
| `boss.mp3` | Boss fights |
| `shop.mp3` | Shop screen (optional) |
| `rest.mp3` | Rest site (optional) |

## Where to get them (FREE, no attribution needed for CC0)

### Best one-stop pack — **Kenney.nl**
- https://kenney.nl/assets/category:Audio
- Look at: **"RPG Audio"**, **"UI Audio"**, **"Casino Audio"**, **"Voiceover Pack"**
- License: CC0 (use however you want, even commercially)

Quick mapping from Kenney's RPG/UI Audio packs:
- `card_draw` → `cardSlide1.ogg` (rename to `.mp3` works in most browsers, or convert)
- `card_play` → `cardPlace1.ogg`
- `button`    → `click1.ogg`
- `hit_light` → `impactSoft_medium_002.ogg`
- `hit_heavy` → `impactPlate_heavy_001.ogg`
- `block`    → `impactMetal_001.ogg`
- `attack_slash` → `swordSlash.ogg` (from "Impact Sounds")

### Bigger library — **OpenGameArt.org**
- https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=13
- Filter: License = CC0 / CC-BY 3.0
- Search "rpg sword", "magic", "fire", "dungeon ambient"

### Music — **Pixabay** (free, high-quality)
- https://pixabay.com/music/search/genre/fantasy/
- Search "fantasy battle", "dungeon", "epic boss"
- All free, no signup required for download

### Music — **Incompetech** (Kevin MacLeod, classic free game music)
- https://incompetech.com/music/royalty-free/genres.html?genre=Fantasy
- Free with attribution (credit Kevin MacLeod somewhere — the readme is fine)

## File format

Browsers prefer `.mp3` (smallest, universal). Howler.js will auto-pick the best
format if you provide multiple in `audio.ts`, but mp3 alone is fine.

If you download `.ogg` or `.wav`, convert with:
- **Audacity** (free, GUI): drag in, File → Export → MP3
- **ffmpeg** (CLI): `ffmpeg -i input.ogg -b:a 128k output.mp3`

## Volume tips

- SFX should be **short** and **loud-ish** (game auto-mixes at 60% by default)
- Music should be **quiet** and **looping smoothly** (60+ second loops work best)
- Players can adjust volumes in-game via the 🔊 button (top-right)

## Easiest path (~10 minutes)

1. Download Kenney's **RPG Audio** + **UI Audio** packs (free zip)
2. Copy the `.ogg` files into `public/sounds/sfx/` and rename to match table above
   (most browsers play `.ogg` natively — no conversion needed)
3. Open the SFX file list in `src/systems/audio.ts` and change `.mp3` to `.ogg`
   if you didn't convert
4. Grab one fantasy track from Pixabay → save as `combat.mp3` in `public/sounds/music/`
5. Reload the game — you'll hear it instantly
