# Card Art

Drop PNG images into this folder, named by the card's `baseId`.
Missing files fall back to an emoji — the game won't crash.

## Starting deck images needed

### Gon (Ironclad) starter — 3 unique cards
| Filename | Card | Type |
|---|---|---|
| `strike_r.png` | Strike  | Attack — Deal 6 damage |
| `defend_r.png` | Defend  | Skill — Gain 5 Block |
| `bash.png`     | Bash    | Attack — Deal 8 damage, apply 2 Vulnerable |

### Killua (Defect) starter — 4 unique cards
| Filename | Card | Type |
|---|---|---|
| `strike_b.png`   | Strike    | Attack — Deal 6 damage |
| `defend_b.png`   | Defend    | Skill — Gain 5 Block |
| `zap.png`        | Zap       | Skill — Channel Lightning |
| `dualcast.png`   | Dualcast  | Skill — Evoke first orb twice |

## Image specs

- **Format:** PNG (transparency supported)
- **Aspect ratio:** ~16:9 horizontal (the art slot is wider than it is tall)
- **Recommended size:** 220×120px or larger (downscaled by browser, sharp on retina)
- **Style:** Pixel-art is auto-rendered crisp via `image-rendering: pixelated`. Smooth art also works.

## How to add more later

The system works for *any* card — not just starters. To add art for, say, "Cleave":

1. Look up its `baseId` in `src/data/cards.ts` (line ~33: `id: 'cleave'`)
2. Drop `cleave.png` in this folder
3. It auto-appears in-game for both base and upgraded versions of the card

## Full list of all card baseIds

**Ironclad cards:** `strike_r`, `defend_r`, `bash`, `anger`, `cleave`, `flex`,
`heavy_blade`, `impervious`, `whirlwind`, `corruption`, `iron_wave`,
`pommel_strike`, `shrug_it_off`, `sword_boomerang`, `thunderclap`,
`flame_barrier`, `uppercut`, `battle_trance`, `wild_strike`, `limit_break`

**Defect cards:** `strike_b`, `defend_b`, `zap`, `dualcast`, `streamline`,
`cold_snap`, `ball_lightning`, `glacier`, `chill`, `consume`, `electrodynamics`,
`doom_and_gloom`, `compile_driver`, `reinforced_body`, `reboot`, `all_for_one`,
`seek`, `loop`, `darkness`, `turbo`
