# turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/Tuapaaas/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/Tuapaaas/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

**Turkey Run: The Great Thanksgiving Escape** — Gus the turkey has one morning to outrun Farmer Bram, dodge the oven and the carving knives, and reach the forest before he becomes Thanksgiving dinner.

A complete 2D canvas game: title screen, three stages (farmyard → barn → kitchen), a chasing farmer with search-and-sprint AI, jumping, ducking into haystacks to hide, corn to collect, 3 lives, HUD with score / distance / lives, and caught-or-escaped end screens with restart. All art is drawn in code and all sound is synthesized with WebAudio — no external assets, no network.

## Run it

```sh
python3 -m http.server 8080 --directory game
```

Then open http://localhost:8080 in a desktop browser. Keyboard: **Space / ↑** jump, **↓** duck & hide, **P** pause, **M** mute, **R** restart. Mouse / touch: click to jump, on-screen buttons to start and restart.

---

<sub>Entered on [make.fun](https://make.fun/?ref=apaan-tu&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
