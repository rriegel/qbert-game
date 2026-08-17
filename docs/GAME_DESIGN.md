1|# Q*bert Game Design Document
2|
3|## Game Overview
4|
5|**Title:** Q*bert (Modern Recreation)
6|**Genre:** Arcade / Puzzle-Action
7|**Platform:** Web Browser (Desktop + Mobile)
8|**Players:** Single-player
9|**Session Length:** 3-15 minutes per game
10|
11|## Concept
12|
13|A modernized recreation of the 1982 arcade classic Q*bert. Players control the iconic orange character as they hop across an isometric pyramid of cubes, changing their colors while avoiding enemies. Faithful to the original mechanics with expanded content including power-ups, varied level shapes, and modern visual polish.
14|
15|## Core Gameplay Loop
16|
17|```
18|Hop on cube -> Change color -> Avoid enemies -> Complete level -> Next level (harder)
19|```
20|
21|1. **Primary Action:** Q*bert hops diagonally between cubes
22|2. **Primary Goal:** Change all cubes to the target color
23|3. **Primary Challenge:** Avoid enemies while navigating the pyramid
24|4. **Progression:** Complete levels with increasing difficulty
25|
26|## Controls
27|
28|### Keyboard (Desktop)
29|| Input | Action |
30||-------|--------|
31|| Up-Left Arrow / Q | Hop up-left |
32|| Up-Right Arrow / E | Hop up-right |
33|| Down-Left Arrow / A | Hop down-left |
34|| Down-Right Arrow / D | Hop down-right |
35|| Space / Enter | Start / Pause |
36|
37|### Touch (Mobile)
38|| Gesture | Action |
39||---------|--------|
40|| Swipe up-left | Hop up-left |
41|| Swipe up-right | Hop up-right |
42|| Swipe down-left | Hop down-left |
43|| Swipe down-right | Hop down-right |
44|| Tap | Start / Pause |
45|
46|## Pyramid Mechanics
47|
48|### Classic Pyramid (Levels 1-5)
49|```
50|        [1]
51|       [2][3]
52|      [4][5][6]
53|     [7][8][9][10]
54|    [11][12][13][14][15]
55|   [16][17][18][19][20][21]
56|  [22][23][24][25][26][27][28]
57|```
58|- 7 rows, 28 cubes total
59|- Row 0 = top (1 cube), Row 6 = bottom (7 cubes)
60|
61|### Alternative Shapes (Later Levels)
62|
63|**Diamond:**
64|```
65|        [1]
66|       [2][3]
67|      [4][5][6]
68|     [7][8][9][10]
69|      [11][12][13]
70|       [14][15]
71|        [16]
72|```
73|
74|**Hourglass:**
75|```
76|  [1][2][3][4][5][6][7]
77|    [8][9][10][11][12]
78|      [13][14][15]
79|        [16]
80|      [17][18][19]
81|    [20][21][22][23][24]
82|  [25][26][27][28][29][30][31]
83|```
84|
85|**Truncated (Small):**
86|```
87|      [1]
88|     [2][3]
89|    [4][5][6]
90|   [7][8][9][10]
91|```
92|
93|### Cube Color Mechanics
94|
95|Each level defines a color sequence. Cubes start at color 0 and must reach the target color.
96|
97|**Example Level 1 (2-step):**
98|- Start: Blue (color 0)
99|- Hop once: Red (color 1) <- target
100|- All cubes red = level complete
101|
102|**Example Level 3 (3-step):**
103|- Start: Blue (color 0)
104|- Hop once: Yellow (color 1)
105|- Hop twice: Green (color 2) <- target
106|- Must land on each cube exactly twice
107|
108|### Scoring
109|
110|| Action | Points |
111||--------|--------|
112|| Color a cube to target | 25 |
113|| Combo multiplier (2x) | +25 bonus |
114|| Combo multiplier (3x) | +50 bonus |
115|| Combo multiplier (4x+) | +100 bonus |
116|| Level complete bonus | 250 x level |
117|| Defeat Coily (fall off with him) | 500 |
118|| Collect power-up | 100 |
119|
120|**Combo System:**
121|- Combo increments each time you color a cube without dying
122|- Resets to 0 on death
123|- Multiplier = min(combo / 5, 4) + 1 (caps at 4x)
124|
125|## Player Character
126|
127|### Q*bert
128|- **Appearance:** Orange round character with snout and feet
129|- **Idle Animation:** Slight bounce/breathing
130|- **Hop Animation:** Parabolic arc, ~300ms duration
131|- **Death Animation:** Fall off screen with swear bubble (classic nod)
132|- **Size:** ~32x32 pixels (scaled for iso view)
133|
134|### Movement Rules
135|- Hops are always diagonal (4 directions)
136|- One cube at a time
137|- Input locked during hop animation
138|- Falls off if target position is off pyramid edge
139|
140|## Enemies
141|
142|### Red Ball (Level 1+)
143|- **Appearance:** Red sphere
144|- **Behavior:** Spawns at top, bounces downward randomly (left or right at each step)
145|- **Speed:** One cube per 1 second
146|- **Kill:** Contact = death
147|- **Score:** None
148|- **Notes:** Simple hazard, teaches player to watch for falling objects
149|
150|### Coily (Level 4+)
151|- **Appearance:** Purple egg (Phase 1) -> Purple snake (Phase 2)
152|- **Phase 1 (Egg):** Bounces down like Red Ball
153|- **Phase 2 (Snake):** Hatches at bottom, chases Q*bert upward
154|- **Chase AI:** Moves toward player's row each turn, picks closer column
155|- **Defeat:** Hop on a disk/teleporter to make Coily fall off (500 pts)
156|- **Kill:** Contact = death
157|- **Notes:** Most dangerous enemy, requires strategic positioning
158|
159|### Slick & Sam (Level 7+)
160|- **Appearance:** Green gremlins
161|- **Behavior:** Move downward, revert cubes to original color
162|- **Speed:** One cube per 0.8 seconds
163|- **Kill:** None (cannot be defeated)
164|- **Strategy:** Avoid them, re-color cubes they touch
165|- **Notes:** Force player to backtrack and re-do work
166|
167|### Ugg & Chop (Level 10+)
168|- **Appearance:** Small creatures
169|- **Behavior:** Move along the left/right edges of the pyramid upward
170|- **Kill:** Contact = death
171|- **Notes:** Edge hazards, limit safe zones on sides
172|
173|## Power-ups
174|
175|### Shield (Rare)
176|- **Appearance:** Blue glowing orb
177|- **Effect:** Survive one enemy hit
178|- **Duration:** Until hit or level end
179|- **Visual:** Blue glow around Q*bert
180|
181|### Slow-Mo (Uncommon)
182|- **Appearance:** Yellow clock icon
183|- **Effect:** All enemies move at 50% speed
184|- **Duration:** 10 seconds
185|- **Visual:** Yellow tint on screen edges
186|
187|### Paintbrush (Common)
188|- **Appearance:** Paint brush icon
189|- **Effect:** Next 3 cubes colored to target instantly on landing
190|- **Duration:** 3 cube landings
191|- **Visual:** Paint trail effect
192|
193|### Disk/Teleporter (Classic)
194|- **Appearance:** Floating rainbow disk
195|- **Effect:** Q*bert teleports to top, Coily falls off if chasing
196|- **Spawn:** On pyramid edges, temporary
197|- **Notes:** Classic mechanic, high risk/reward (must hop to edge)
198|
199|### Extra Life (Very Rare)
200|- **Appearance:** Q*bert head icon
201|- **Effect:** +1 life
202|- **Spawn:** Score milestones (10,000 / 20,000 / 50,000)
203|- **Notes:** Classic arcade reward
204|
205|## Level Design
206|
207|### Level Progression
208|
209|| Level | Pyramid | Colors | Enemies | Spawn Rate |
210||-------|---------|--------|---------|------------|
211|| 1 | Classic | 2 | Red Ball | Slow |
212|| 2 | Classic | 2 | Red Ball | Medium |
213|| 3 | Classic | 3 | Red Ball | Medium |
214|| 4 | Classic | 3 | Red Ball + Coily | Medium |
215|| 5 | Classic | 3 | Red Ball + Coily | Fast |
216|| 6 | Classic | 4 | Red Ball + Coily | Fast |
217|| 7 | Classic | 4 | + Slick/Sam | Fast |
218|| 8 | Diamond | 4 | All enemies | Fast |
219|| 9 | Diamond | 5 | All enemies | Very Fast |
220|| 10 | Hourglass | 5 | All + Ugg/Chop | Very Fast |
221|
222|### Difficulty Curve
223|- **Levels 1-3:** Tutorial-ish, learn movement and Red Balls
224|- **Levels 4-6:** Coily introduced, requires strategy
225|- **Levels 7-9:** Slick/Sam add frustration, precision needed
226|- **Levels 10+:** All enemies, alternate shapes, high speed
227|
228|## Art Direction
229|
230|### Style
231|- **Geometric/vector** with clean lines (initial)
232|- Bright, saturated colors
233|- Retro-modern aesthetic (8-bit inspired but clean)
234|- Subtle shadows for depth
235|- Particle effects for juice
236|
237|### Color Palette
238|- **Background:** Dark gradient (deep purple to black)
239|- **Cubes:** Bright saturated colors per level theme
240|- **Q*bert:** Orange (classic)
241|- **Enemies:** Distinct colors (red, purple, green)
242|- **Power-ups:** Glowing with particle trails
243|
244|### Screen Layout
245|```
246|+------------------------------------------+
247||  SCORE: 1250    LIVES: 3    LEVEL: 4     |
248|+------------------------------------------+
249||                                          |
250||              [Q*bert]                    |
251||             /        \                   |
252||           [ ]  [ ]  [ ]                 |
253||          [ ]  [ ]  [ ]  [ ]             |
254||         [ ]  [ ]  [ ]  [ ]  [ ]         |
255||        [ ]  [ ]  [ ]  [ ]  [ ]  [ ]     |
256||       [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ] |
257||                                          |
258||    [Enemy]              [Power-up]       |
259|+------------------------------------------+
260||         COMBO: 3x    [Shield Active]     |
261|+------------------------------------------+
262|```
263|
264|## Audio Design
265|
266|### Sound Effects
267|- **Hop:** Short "boing" on each jump
268|- **Land:** Soft thud
269|- **Cube color change:** Musical note (ascending scale)
270|- **Level complete:** Victory jingle (2-3 seconds)
271|- **Death:** Classic Q*bert "swear" sound (or modern equivalent)
272|- **Enemy spawn:** Warning tone
273|- **Power-up collect:** Sparkle/chime
274|- **Power-up activate:** Whoosh
275|
276|### Music
277|- **Title screen:** Catchy retro chiptune loop
278|- **Gameplay:** Upbeat, driving chiptune (matches hop rhythm)
279|- **Game over:** Somber short melody
280|- **Boss/special level:** Intensified version of gameplay music
281|
282|## UI/UX
283|
284|### HUD Elements
285|- Score (top-left)
286|- Lives remaining (top-center, as Q*bert heads)
287|- Current level (top-right)
288|- Combo multiplier (bottom-left, when active)
289|- Active power-ups (bottom-right, with timers)
290|
291|### Screens
292|- **Title:** Logo, "Press Start", high score list, controls hint
293|- **In-game:** Clean HUD, minimal distraction
294|- **Pause:** Overlay with Resume/Quit options
295|- **Level Complete:** Brief animation + bonus score tally
296|- **Game Over:** Final score, high score position, "Play Again"
297|
298|### Feedback
299|- Screen shake on death
300|- Flash on power-up collect
301|- Particles on cube color change
302|- Trail effect on Q*bert hop
303|- Enemy warning indicators (off-screen arrows)
304|
305|## Accessibility
306|
307|- Colorblind mode (shapes on cubes in addition to colors)
308|- Adjustable game speed (slow/normal/fast)
309|- High contrast mode
310|- Keyboard remapping
311|- Touch input for mobile
312|
313|## Monetization (if applicable)
314|
315|- Free to play (browser game)
316|- Optional: cosmetic skins for Q*bert (unlockable via scores)
317|- No ads during gameplay
318|- Optional rewarded ads for extra life (mobile version)
319|
320|## Success Metrics
321|
322|- Average session length > 5 minutes
323|- Level 5+ reach rate > 50%
324|- Level 10+ reach rate > 15%
325|- Return player rate > 30%
326|- Mobile play rate > 20%
327|