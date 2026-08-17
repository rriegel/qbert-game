# Q*bert - Modern Arcade Game

A modernized recreation of the classic 1982 arcade game Q*bert, built with Phaser 3 and TypeScript.

## 🎮 Game Overview

Hop across an isometric pyramid of cubes, changing their colors while avoiding enemies. Complete all cubes to advance to the next level with increasing difficulty.

### Features
- **Classic Gameplay:** Faithful to the original Q*bert mechanics
- **Modern Polish:** Smooth animations, particle effects, responsive controls
- **Expanded Content:** Power-ups, varied level shapes, multiple enemy types
- **Cross-Platform:** Play on desktop (keyboard) or mobile (touch)

## 📚 Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - System design and component architecture
- **[Game Design](docs/GAME_DESIGN.md)** - Game mechanics, rules, and content
- **[Technical Design](docs/TECHNICAL_DESIGN.md)** - Implementation details and data structures

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 🎯 Controls

### Keyboard
- **Arrow Keys / WASD:** Move Q*bert diagonally
- **Space / Enter:** Start game / Pause

### Touch (Mobile)
- **Swipe:** Move Q*bert in swipe direction

## 🏗️ Tech Stack

- **Game Engine:** Phaser 3.60+
- **Language:** TypeScript 5.0+
- **Build Tool:** Vite 5.0+
- **Testing:** Vitest
- **Renderer:** HTML5 Canvas (WebGL)

## 📁 Project Structure

```
qbert-game/
├── docs/                    # Documentation
├── public/assets/           # Static assets (sprites, audio)
├── src/
│   ├── scenes/              # Phaser scenes
│   ├── entities/            # Game objects (Player, Enemies, etc.)
│   ├── systems/             # Game systems (Input, Collision, Score)
│   ├── config/              # Game configuration
│   └── utils/               # Utilities
└── tests/                   # Unit and integration tests
```

## 🎨 Development Phases

See [Implementation Plan](.hermes/plans/2026-08-16_qbert-game-implementation.md) for detailed development roadmap.

### Phase 1: Setup & Rendering
- Project scaffolding
- Isometric pyramid rendering
- Coordinate system

### Phase 2: Player Movement
- Q*bert hopping mechanics
- Cube color changes
- Edge detection

### Phase 3: Game Loop
- Level completion
- Lives and scoring
- Combo system

### Phase 4: Enemies
- Red Ball, Coily, Slick/Sam
- AI behaviors
- Collision detection

### Phase 5: Power-ups & Polish
- Shield, Slow-Mo, Paintbrush
- Particles and effects
- Audio integration

### Phase 6: Advanced Levels
- New pyramid shapes
- Enemy configurations
- Mobile controls

### Phase 7: Final Polish
- Responsive scaling
- Performance optimization
- Deployment

## 📝 License

MIT License - feel free to use this for learning or personal projects.

## 🙏 Credits

Original Q*bert game by Gottlieb (1982). This is a fan-made recreation for educational purposes.
