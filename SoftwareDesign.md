# Tower Spell Battle - Software Design Document

## 1. Executive Summary

### 1.1 Project Overview
Tower Spell Battle is a real-time multiplayer typing game that combines the competitive nature of TypeRacer with tower defense mechanics inspired by Clash Royale. Players type words to cast spells that deal damage to their opponent's tower, with word length determining spell power.

### 1.2 Key Features
- Real-time multiplayer battles (1v1)
- AI-generated word pools for each match
- Animated spell projectiles and tower defense visuals
- Progressive difficulty and skill-based matchmaking
- Player statistics and leaderboards
- WebSocket-based real-time communication

### 1.3 Tech Stack
- **Frontend**: React 18, Vite, JavaScript (ES6+), HTML5 Canvas, Tailwind CSS, Axios
- **Backend**: Node.js, Express, Socket.io, PM2 (Process Manager)
- **ORM**: Sequelize with PostgreSQL
- **Database**: PostgreSQL (Supabase for development)
- **Deployment**: AWS EC2 (Ubuntu/Amazon Linux), Nginx (reverse proxy)
- **AI Integration**: Claude API (Anthropic) for dynamic content generation
- **Authentication**: JWT-based authentication
- **Additional Libraries**: UUID, dotenv, cors, lucide-react

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   React    │  │ Canvas Game  │  │  Socket.io       │   │
│  │   UI/UX    │  │   Renderer   │  │   Client         │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                    WebSocket/HTTP
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Express   │  │  Socket.io   │  │   Game Room      │   │
│  │   Server   │  │   Server     │  │   Manager        │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Matchmaking│  │  Auth        │  │   AI Word Pool   │   │
│  │   Queue    │  │  Middleware  │  │   Generator      │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │              PostgreSQL Database                    │    │
│  │  Users | Matches | PlayerStats | TroopTypes |      │    │
│  │  MatchEvents | PlayerTroops | Sessions             │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Claude API (Anthropic)                     │    │
│  │          - Word pool generation                     │    │
│  │          - Real-time commentary                     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Architecture

#### 2.2.1 Frontend Components (React + Vite)
```
game-client/
├── public/
│   └── assets/
├── src/
│   ├── main.jsx (Entry point)
│   ├── App.jsx
│   ├── components/
│   │   ├── game/
│   │   │   ├── GameCanvas.jsx (HTML5 Canvas)
│   │   │   ├── TypingInput.jsx
│   │   │   ├── WordPool.jsx
│   │   │   ├── HealthBars.jsx
│   │   │   ├── Commentary.jsx
│   │   │   └── ProjectileAnimation.jsx
│   │   ├── room/
│   │   │   ├── CreateRoomModal.jsx
│   │   │   ├── JoinRoomModal.jsx
│   │   │   ├── RoomLobby.jsx
│   │   │   ├── RoomList.jsx
│   │   │   └── RoomCard.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   └── common/
│   │       ├── Modal.jsx
│   │       ├── LoadingSpinner.jsx
│   │       ├── Button.jsx
│   │       └── CopyToClipboard.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── RoomSelectionPage.jsx (new)
│   │   ├── GamePage.jsx
│   │   ├── LeaderboardPage.jsx
│   │   └── ProfilePage.jsx
│   ├── hooks/
│   │   ├── useSocket.js
│   │   ├── useAuth.js
│   │   ├── useGame.js
│   │   ├── useRoom.js (new)
│   │   └── useCanvas.js
│   ├── store/
│   │   ├── gameStore.js (Zustand)
│   │   ├── roomStore.js (Zustand - new)
│   │   └── authStore.js (Zustand)
│   ├── utils/
│   │   ├── socket.js
│   │   ├── api.js (Axios instance)
│   │   └── helpers.js
│   ├── styles/
│   │   └── index.css (Tailwind)
│   └── config/
│       └── constants.js
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

#### 2.2.2 Backend Services
```
Server
├── Routes
│   ├── /api/auth (login, register, logout)
│   ├── /api/users (profile, stats)
│   ├── /api/matches (history, details)
│   └── /api/leaderboard
├── WebSocket Handlers
│   ├── connection
│   ├── join-queue
│   ├── match-found
│   ├── word-typed
│   ├── game-state-update
│   └── match-end
└── Services
    ├── AuthService
    ├── MatchmakingService
    ├── GameRoomService
    ├── AIWordGeneratorService
    └── StatsService
```

---

## 3. Data Models & Sequelize Configuration

### 3.0 Sequelize Setup

#### Database Configuration (Supabase)
```javascript
// config/config.json
{
  "development": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}
```

```bash
# .env (Supabase connection string)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

#### Database Connection
```javascript
// models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config/config.json')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  ...config,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000
  }
});

// Test connection
sequelize.authenticate()
  .then(() => console.log('✅ Supabase database connected'))
  .catch(err => console.error('❌ Unable to connect:', err));

module.exports = sequelize;
```

#### Common Sequelize Operations
```javascript
// Query examples
const { User, Match, PlayerStats } = require('./models');

// Create user
const user = await User.create({
  username: 'player1',
  email: 'player1@example.com',
  password: hashedPassword
});

// Find user with stats
const userWithStats = await User.findOne({
  where: { id: userId },
  include: [{ model: PlayerStats, as: 'stats' }]
});

// Get user's match history
const matches = await Match.findAll({
  where: {
    [Op.or]: [
      { player1Id: userId },
      { player2Id: userId }
    ]
  },
  include: [
    { model: User, as: 'player1' },
    { model: User, as: 'player2' },
    { model: User, as: 'winner' }
  ],
  order: [['createdAt', 'DESC']],
  limit: 10
});

// Update user stats
await User.update(
  { wins: sequelize.literal('wins + 1'), rating: newRating },
  { where: { id: userId } }
);

// Complex query with aggregation
const leaderboard = await User.findAll({
  attributes: [
    'id',
    'username',
    'rating',
    'wins',
    'losses',
    [sequelize.literal('wins::float / NULLIF(total_matches, 0)'), 'winRate']
  ],
  order: [['rating', 'DESC']],
  limit: 100
});
```

### 3.1 Database Schema (Sequelize Models)

#### User Model
```javascript
// models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 1000
    },
    wins: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    losses: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalMatches: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });

  User.associate = (models) => {
    User.hasOne(models.PlayerStats, { foreignKey: 'userId', as: 'stats' });
    User.hasMany(models.Match, { foreignKey: 'player1Id', as: 'matchesAsPlayer1' });
    User.hasMany(models.Match, { foreignKey: 'player2Id', as: 'matchesAsPlayer2' });
    User.hasMany(models.Match, { foreignKey: 'winnerId', as: 'matchesWon' });
    User.hasMany(models.PlayerTroop, { foreignKey: 'userId', as: 'troops' });
    User.hasMany(models.Session, { foreignKey: 'userId', as: 'sessions' });
  };

  return User;
};
```

#### Match Model
```javascript
// models/match.js
module.exports = (sequelize, DataTypes) => {
  const Match = sequelize.define('Match', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    player1Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    player2Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    winnerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' }
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  Match.associate = (models) => {
    Match.belongsTo(models.User, { foreignKey: 'player1Id', as: 'player1' });
    Match.belongsTo(models.User, { foreignKey: 'player2Id', as: 'player2' });
    Match.belongsTo(models.User, { foreignKey: 'winnerId', as: 'winner' });
    Match.hasMany(models.MatchEvent, { foreignKey: 'matchId', as: 'events' });
  };

  return Match;
};
```

#### PlayerStats Model
```javascript
// models/playerstats.js
module.exports = (sequelize, DataTypes) => {
  const PlayerStats = sequelize.define('PlayerStats', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'Users', key: 'id' }
    },
    averageWPM: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    accuracy: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    fastestWPM: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalTroopsDeployed: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });

  PlayerStats.associate = (models) => {
    PlayerStats.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return PlayerStats;
};
```

#### TroopType Model
```javascript
// models/trooptype.js
module.exports = (sequelize, DataTypes) => {
  const TroopType = sequelize.define('TroopType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    typingWord: {
      type: DataTypes.STRING,
      allowNull: false
    },
    health: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    damage: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    speed: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    attackRange: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cost: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  TroopType.associate = (models) => {
    TroopType.hasMany(models.PlayerTroop, { foreignKey: 'troopTypeId', as: 'playerTroops' });
  };

  return TroopType;
};
```

#### MatchEvent Model
```javascript
// models/matchevent.js
module.exports = (sequelize, DataTypes) => {
  const MatchEvent = sequelize.define('MatchEvent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    matchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Matches', key: 'id' }
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    troopType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  });

  MatchEvent.associate = (models) => {
    MatchEvent.belongsTo(models.Match, { foreignKey: 'matchId', as: 'match' });
    MatchEvent.belongsTo(models.User, { foreignKey: 'playerId', as: 'player' });
  };

  return MatchEvent;
};
```

#### PlayerTroop Model
```javascript
// models/playertroop.js
module.exports = (sequelize, DataTypes) => {
  const PlayerTroop = sequelize.define('PlayerTroop', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    troopTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'TroopTypes', key: 'id' }
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    unlockedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  PlayerTroop.associate = (models) => {
    PlayerTroop.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    PlayerTroop.belongsTo(models.TroopType, { foreignKey: 'troopTypeId', as: 'troopType' });
  };

  return PlayerTroop;
};
```

#### Session Model
```javascript
// models/session.js
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  Session.associate = (models) => {
    Session.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Session;
};
```

---

## 4. Game Logic & Mechanics

### 4.1 Match Flow (Room-Based System)

```
┌─────────────────────┐
│  Player creates     │
│  room or joins      │
│  existing room      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Room created with  │
│  unique code        │
│  (e.g., "ABC123")   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Player 1 waits in  │
│  room lobby         │
│  Share room code    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Player 2 joins     │
│  using room code    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Both players ready │
│  Room status:       │
│  "waiting" -> "full"│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Host starts match  │
│  Generate Word Pool │
│  (AI-powered)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Match starts       │
│  Both players see   │
│  same word pool     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Players type words │
│  First to complete  │
│  claims the word    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Spell animation    │
│  Damage calculated  │
│  Tower HP reduced   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Continue until:    │
│  - Pool empty       │
│  - Tower HP = 0     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Calculate winner   │
│  Update stats/rating│
│  Save match data    │
│  Room destroyed     │
└─────────────────────┘
```

### 4.2 Game Rules

#### Room System
- **Room Creation**: Any player can create a room and become the host
- **Room Code**: Each room has a unique 6-character code (e.g., "ABC123")
- **Room Capacity**: Maximum 2 players per room
- **Room Status**: 
  - `waiting` - 1 player, waiting for second player
  - `full` - 2 players, ready to start
  - `active` - Match in progress
  - `finished` - Match completed
- **Room Visibility**: 
  - Public rooms appear in room list
  - Private rooms require code to join
- **Host Privileges**: Host can start the match when room is full
- **Room Timeout**: Rooms automatically close after 10 minutes of inactivity

#### Victory Conditions
1. **Primary**: Reduce opponent's tower HP to 0
2. **Secondary**: Higher damage dealt when word pool is exhausted

#### Damage System
- Damage = Word Length
- Example: "cat" (3 letters) = 3 damage
- Example: "lightning" (9 letters) = 9 damage

#### Word Pool Generation
- Total: 30 words per match
- Distribution:
  - 12 short words (3-5 letters) = 3-5 damage
  - 12 medium words (6-8 letters) = 6-8 damage
  - 6 long words (9+ letters) = 9+ damage
- AI-generated when match starts (not during room creation)
- Same word pool for both players

#### Rating Changes (Optional for Competitive Rooms)
```javascript
// K-factor for rating adjustment
const K = 32;

// Expected score calculation
expectedScore = 1 / (1 + 10^((opponentRating - playerRating) / 400))

// Rating change
ratingChange = K * (actualScore - expectedScore)
// actualScore: 1 = win, 0 = loss
```

### 4.3 Room & Game State Management

#### Server-Side Room State
```javascript
class GameRoom {
  id: string; // Unique room ID
  code: string; // 6-character room code (e.g., "ABC123")
  hostId: string; // User ID of room creator
  isPublic: boolean; // true = visible in lobby, false = code required
  status: 'waiting' | 'full' | 'active' | 'finished';
  createdAt: Date;
  players: {
    player1: {
      userId: string;
      username: string;
      socketId: string;
      rating: number;
      isReady: boolean;
      health: number;
      score: number;
    } | null;
    player2: {
      userId: string;
      username: string;
      socketId: string;
      rating: number;
      isReady: boolean;
      health: number;
      score: number;
    } | null;
  };
  wordPool: Array<{
    word: string;
    length: number;
    damage: number;
    claimed: boolean;
    claimedBy: string | null;
  }>;
  startTime: Date | null;
  endTime: Date | null;
  winner: string | null;
}
```

#### Room Manager Service
```javascript
// services/RoomService.js
class RoomService {
  constructor() {
    this.rooms = new Map(); // roomId -> GameRoom
    this.roomCodes = new Map(); // roomCode -> roomId
  }

  // Generate unique 6-character room code
  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    do {
      code = Array.from({ length: 6 }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      ).join('');
    } while (this.roomCodes.has(code));
    return code;
  }

  // Create new room
  createRoom(hostId, username, rating, isPublic = true) {
    const roomId = uuid();
    const roomCode = this.generateRoomCode();
    
    const room = {
      id: roomId,
      code: roomCode,
      hostId,
      isPublic,
      status: 'waiting',
      createdAt: new Date(),
      players: {
        player1: {
          userId: hostId,
          username,
          socketId: null,
          rating,
          isReady: false,
          health: 100,
          score: 0
        },
        player2: null
      },
      wordPool: [],
      startTime: null,
      endTime: null,
      winner: null
    };

    this.rooms.set(roomId, room);
    this.roomCodes.set(roomCode, roomId);
    
    return { roomId, roomCode, room };
  }

  // Join room by code
  joinRoomByCode(code, userId, username, rating) {
    const roomId = this.roomCodes.get(code.toUpperCase());
    if (!roomId) {
      throw new Error('Room not found');
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== 'waiting') {
      throw new Error('Room is not available');
    }

    if (room.players.player2) {
      throw new Error('Room is full');
    }

    room.players.player2 = {
      userId,
      username,
      socketId: null,
      rating,
      isReady: false,
      health: 100,
      score: 0
    };
    room.status = 'full';

    return room;
  }

  // Get all public rooms
  getPublicRooms() {
    return Array.from(this.rooms.values())
      .filter(room => room.isPublic && room.status === 'waiting')
      .map(room => ({
        id: room.id,
        code: room.code,
        host: room.players.player1.username,
        playerCount: room.players.player2 ? 2 : 1,
        createdAt: room.createdAt
      }));
  }

  // Get room by ID
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  // Update player socket
  updatePlayerSocket(roomId, userId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.players.player1?.userId === userId) {
      room.players.player1.socketId = socketId;
    } else if (room.players.player2?.userId === userId) {
      room.players.player2.socketId = socketId;
    }
  }

  // Set player ready
  setPlayerReady(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    if (room.players.player1?.userId === userId) {
      room.players.player1.isReady = true;
    } else if (room.players.player2?.userId === userId) {
      room.players.player2.isReady = true;
    }

    return room.players.player1?.isReady && room.players.player2?.isReady;
  }

  // Start match (host only)
  async startMatch(roomId, hostId, aiWordGenerator) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.hostId !== hostId) {
      throw new Error('Only host can start the match');
    }

    if (room.status !== 'full') {
      throw new Error('Room must be full to start');
    }

    // Generate word pool
    const player1Rating = room.players.player1.rating;
    const player2Rating = room.players.player2.rating;
    room.wordPool = await aiWordGenerator.generate(player1Rating, player2Rating);

    room.status = 'active';
    room.startTime = new Date();

    return room;
  }

  // Remove player from room
  removePlayer(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.players.player1?.userId === userId) {
      room.players.player1 = null;
    } else if (room.players.player2?.userId === userId) {
      room.players.player2 = null;
    }

    // If room becomes empty, delete it
    if (!room.players.player1 && !room.players.player2) {
      this.deleteRoom(roomId);
    } else if (!room.players.player2 && room.status === 'full') {
      room.status = 'waiting';
    }
  }

  // Delete room
  deleteRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      this.roomCodes.delete(room.code);
      this.rooms.delete(roomId);
    }
  }

  // Clean up inactive rooms (called periodically)
  cleanupInactiveRooms() {
    const now = new Date();
    const timeout = 10 * 60 * 1000; // 10 minutes

    for (const [roomId, room] of this.rooms.entries()) {
      if (room.status === 'waiting' || room.status === 'full') {
        const inactiveTime = now - room.createdAt;
        if (inactiveTime > timeout) {
          this.deleteRoom(roomId);
        }
      } else if (room.status === 'finished') {
        const finishTime = now - (room.endTime || room.createdAt);
        if (finishTime > 60000) { // 1 minute after finish
          this.deleteRoom(roomId);
        }
      }
    }
  }
}

module.exports = new RoomService();
```

#### Client-Side Game State (React Hooks + Zustand)

```javascript
// store/roomStore.js
import { create } from 'zustand';

export const useRoomStore = create((set) => ({
  currentRoom: null,
  publicRooms: [],
  roomStatus: 'idle', // 'idle' | 'creating' | 'joining' | 'in-room' | 'playing'
  
  setCurrentRoom: (room) => set({ currentRoom: room }),
  setPublicRooms: (rooms) => set({ publicRooms: rooms }),
  setRoomStatus: (status) => set({ roomStatus: status }),
  
  updateRoomPlayers: (players) => set((state) => ({
    currentRoom: state.currentRoom ? { ...state.currentRoom, players } : null
  })),
  
  clearRoom: () => set({ 
    currentRoom: null, 
    roomStatus: 'idle' 
  })
}));
```

```javascript
// store/gameStore.js
import { create } from 'zustand';

export const useGameStore = create((set) => ({
  gameStatus: 'waiting', // 'waiting' | 'countdown' | 'playing' | 'finished'
  wordPool: [],
  currentInput: '',
  selectedWord: null,
  player1: {
    health: 100,
    score: 0,
    username: '',
    isReady: false
  },
  player2: {
    health: 100,
    score: 0,
    username: '',
    isReady: false
  },
  projectiles: [],
  commentary: '',
  feedback: '',
  countdown: null,
  
  // Actions
  setGameStatus: (status) => set({ gameStatus: status }),
  setCountdown: (count) => set({ countdown: count }),
  setWordPool: (words) => set({ wordPool: words }),
  setCurrentInput: (input) => set({ currentInput: input }),
  updatePlayer1: (data) => set((state) => ({
    player1: { ...state.player1, ...data }
  })),
  updatePlayer2: (data) => set((state) => ({
    player2: { ...state.player2, ...data }
  })),
  addProjectile: (projectile) => set((state) => ({
    projectiles: [...state.projectiles, projectile]
  })),
  removeProjectile: (id) => set((state) => ({
    projectiles: state.projectiles.filter(p => p.id !== id)
  })),
  setCommentary: (text) => set({ commentary: text }),
  setFeedback: (text) => set({ feedback: text }),
  resetGame: () => set({
    gameStatus: 'waiting',
    wordPool: [],
    currentInput: '',
    selectedWord: null,
    player1: { health: 100, score: 0, username: '', isReady: false },
    player2: { health: 100, score: 0, username: '', isReady: false },
    projectiles: [],
    commentary: '',
    feedback: '',
    countdown: null
  })
}));
```

```javascript
// hooks/useRoom.js
import { useEffect } from 'react';
import { useRoomStore } from '../store/roomStore';
import { useGameStore } from '../store/gameStore';

export const useRoom = (socket) => {
  const setCurrentRoom = useRoomStore(state => state.setCurrentRoom);
  const setPublicRooms = useRoomStore(state => state.setPublicRooms);
  const setRoomStatus = useRoomStore(state => state.setRoomStatus);
  const setGameStatus = useGameStore(state => state.setGameStatus);
  const setWordPool = useGameStore(state => state.setWordPool);
  const setCountdown = useGameStore(state => state.setCountdown);

  useEffect(() => {
    if (!socket) return;

    // Room created
    socket.on('room-created', ({ roomId, roomCode, room }) => {
      setCurrentRoom(room);
      setRoomStatus('in-room');
      console.log('Room created:', roomCode);
    });

    // Room joined
    socket.on('room-joined', ({ room }) => {
      setCurrentRoom(room);
      setRoomStatus('in-room');
      console.log('Joined room:', room.code);
    });

    // Player joined
    socket.on('player-joined', ({ player, playerCount }) => {
      console.log('Player joined:', player.username);
      // Update room state
    });

    // Public rooms list
    socket.on('public-rooms-list', ({ rooms }) => {
      setPublicRooms(rooms);
    });

    // Player ready update
    socket.on('player-ready-update', ({ userId, isReady, allReady }) => {
      console.log('Player ready:', userId, allReady);
      // Update player ready status
    });

    // Match starting (countdown)
    socket.on('match-starting', ({ wordPool, countdown }) => {
      setWordPool(wordPool);
      setGameStatus('countdown');
      setCountdown(countdown);
      
      // Countdown timer
      let count = countdown;
      const timer = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    });

    // Match started
    socket.on('match-started', ({ wordPool, players }) => {
      setWordPool(wordPool);
      setGameStatus('playing');
      setRoomStatus('playing');
      console.log('Match started!');
    });

    // Player left
    socket.on('player-left', ({ username, reason }) => {
      console.log(`${username} left the room: ${reason}`);
      // Handle player leaving
    });

    // Room closed
    socket.on('room-closed', ({ roomId, reason }) => {
      console.log('Room closed:', reason);
      setCurrentRoom(null);
      setRoomStatus('idle');
    });

    // Room error
    socket.on('room-error', ({ error }) => {
      console.error('Room error:', error);
      alert(error);
    });

    return () => {
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('player-joined');
      socket.off('public-rooms-list');
      socket.off('player-ready-update');
      socket.off('match-starting');
      socket.off('match-started');
      socket.off('player-left');
      socket.off('room-closed');
      socket.off('room-error');
    };
  }, [socket]);

  return {
    createRoom: (userId, username, rating, isPublic) => {
      socket?.emit('create-room', { userId, username, rating, isPublic });
    },
    joinRoom: (userId, username, rating, roomCode) => {
      socket?.emit('join-room', { userId, username, rating, roomCode });
    },
    getPublicRooms: () => {
      socket?.emit('get-public-rooms');
    },
    setReady: (roomId, userId) => {
      socket?.emit('player-ready', { roomId, userId });
    },
    startMatch: (roomId, userId) => {
      socket?.emit('start-match', { roomId, userId });
    },
    leaveRoom: (roomId, userId) => {
      socket?.emit('leave-room', { roomId, userId });
    }
  };
};
```

---

## 5. Real-Time Communication (Room-Based)

### 5.1 WebSocket Events

#### Client -> Server Events
```javascript
// Create room
socket.emit('create-room', { 
  userId, 
  username, 
  rating,
  isPublic // true or false
});

// Join room by code
socket.emit('join-room', { 
  userId, 
  username, 
  rating,
  roomCode // e.g., "ABC123"
});

// Join room by ID (from public room list)
socket.emit('join-room-by-id', {
  userId,
  username,
  rating,
  roomId
});

// Get list of public rooms
socket.emit('get-public-rooms');

// Player ready
socket.emit('player-ready', { roomId, userId });

// Start match (host only)
socket.emit('start-match', { roomId, userId });

// Word typed
socket.emit('word-typed', { 
  roomId, 
  userId,
  word, 
  timestamp 
});

// Leave room
socket.emit('leave-room', { roomId, userId });
```

#### Server -> Client Events
```javascript
// Room created
socket.emit('room-created', { 
  roomId, 
  roomCode,
  hostId,
  isPublic
});

// Room joined successfully
socket.emit('room-joined', { 
  room: {
    id,
    code,
    hostId,
    players,
    status
  }
});

// Player joined room (broadcast to room)
io.to(roomId).emit('player-joined', { 
  player: {
    userId,
    username,
    rating
  },
  playerCount
});

// Public rooms list
socket.emit('public-rooms-list', { 
  rooms: [
    { id, code, host, playerCount, createdAt }
  ]
});

// Player ready status (broadcast to room)
io.to(roomId).emit('player-ready-update', { 
  userId,
  isReady,
  allReady // boolean
});

// Match starting
io.to(roomId).emit('match-starting', { 
  roomId, 
  wordPool,
  countdown: 3 // seconds
});

// Match started
io.to(roomId).emit('match-started', { 
  roomId, 
  wordPool,
  players
});

// Word claimed
io.to(roomId).emit('word-claimed', { 
  word, 
  userId, 
  damage 
});

// Game state update
io.to(roomId).emit('game-state-update', { 
  player1Health, 
  player2Health,
  player1Score,
  player2Score,
  remainingWords
});

// Match end
io.to(roomId).emit('match-end', { 
  winner: {
    userId,
    username,
    score
  },
  loser: {
    userId,
    username,
    score
  },
  duration,
  stats,
  ratingChange
});

// Player left room
io.to(roomId).emit('player-left', { 
  userId,
  username,
  reason // 'disconnected' | 'left' | 'timeout'
});

// Room closed
io.to(roomId).emit('room-closed', { 
  roomId,
  reason
});

// Error events
socket.emit('room-error', { 
  error: 'Room not found' | 'Room is full' | 'Invalid room code' | 'Not authorized'
});
```

### 5.2 Socket.io Room Implementation

```javascript
// socket/gameHandler.js
const roomService = require('../services/RoomService');
const aiWordGenerator = require('../services/AIWordGeneratorService');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Create room
    socket.on('create-room', async ({ userId, username, rating, isPublic }) => {
      try {
        const { roomId, roomCode, room } = roomService.createRoom(
          userId, 
          username, 
          rating, 
          isPublic
        );

        // Update player socket
        roomService.updatePlayerSocket(roomId, userId, socket.id);

        // Join socket.io room
        socket.join(roomId);

        // Store roomId in socket data
        socket.data.roomId = roomId;
        socket.data.userId = userId;

        socket.emit('room-created', {
          roomId,
          roomCode,
          room
        });

        console.log(`Room created: ${roomCode} by ${username}`);
      } catch (error) {
        socket.emit('room-error', { error: error.message });
      }
    });

    // Join room by code
    socket.on('join-room', async ({ userId, username, rating, roomCode }) => {
      try {
        const room = roomService.joinRoomByCode(roomCode, userId, username, rating);

        // Update player socket
        roomService.updatePlayerSocket(room.id, userId, socket.id);

        // Join socket.io room
        socket.join(room.id);

        // Store roomId in socket data
        socket.data.roomId = room.id;
        socket.data.userId = userId;

        // Notify both players
        socket.emit('room-joined', { room });
        
        io.to(room.id).emit('player-joined', {
          player: { userId, username, rating },
          playerCount: 2
        });

        console.log(`${username} joined room: ${roomCode}`);
      } catch (error) {
        socket.emit('room-error', { error: error.message });
      }
    });

    // Get public rooms
    socket.on('get-public-rooms', () => {
      const rooms = roomService.getPublicRooms();
      socket.emit('public-rooms-list', { rooms });
    });

    // Player ready
    socket.on('player-ready', ({ roomId, userId }) => {
      const allReady = roomService.setPlayerReady(roomId, userId);
      
      io.to(roomId).emit('player-ready-update', {
        userId,
        isReady: true,
        allReady
      });
    });

    // Start match (host only)
    socket.on('start-match', async ({ roomId, userId }) => {
      try {
        const room = await roomService.startMatch(roomId, userId, aiWordGenerator);

        // Countdown
        io.to(roomId).emit('match-starting', {
          roomId,
          wordPool: room.wordPool,
          countdown: 3
        });

        // Start after countdown
        setTimeout(() => {
          io.to(roomId).emit('match-started', {
            roomId,
            wordPool: room.wordPool,
            players: room.players
          });
        }, 3000);

        console.log(`Match started in room: ${room.code}`);
      } catch (error) {
        socket.emit('room-error', { error: error.message });
      }
    });

    // Word typed
    socket.on('word-typed', ({ roomId, userId, word, timestamp }) => {
      const room = roomService.getRoom(roomId);
      if (!room || room.status !== 'active') return;

      // Validate word
      const wordData = room.wordPool.find(w => w.word === word && !w.claimed);
      if (!wordData) {
        socket.emit('invalid-word', { word });
        return;
      }

      // Claim word
      wordData.claimed = true;
      wordData.claimedBy = userId;

      // Calculate damage
      const damage = wordData.damage;
      const isPlayer1 = room.players.player1?.userId === userId;

      if (isPlayer1) {
        room.players.player1.score += damage;
        room.players.player2.health = Math.max(0, room.players.player2.health - damage);
      } else {
        room.players.player2.score += damage;
        room.players.player1.health = Math.max(0, room.players.player1.health - damage);
      }

      // Broadcast word claimed
      io.to(roomId).emit('word-claimed', {
        word: wordData.word,
        userId,
        damage
      });

      // Broadcast game state update
      io.to(roomId).emit('game-state-update', {
        player1Health: room.players.player1.health,
        player2Health: room.players.player2.health,
        player1Score: room.players.player1.score,
        player2Score: room.players.player2.score,
        remainingWords: room.wordPool.filter(w => !w.claimed).length
      });

      // Check for game end
      const gameEnded = 
        room.players.player1.health <= 0 ||
        room.players.player2.health <= 0 ||
        room.wordPool.every(w => w.claimed);

      if (gameEnded) {
        endMatch(io, room);
      }
    });

    // Leave room
    socket.on('leave-room', ({ roomId, userId }) => {
      handlePlayerLeave(io, socket, roomId, userId, 'left');
    });

    // Disconnect
    socket.on('disconnect', () => {
      const { roomId, userId } = socket.data;
      if (roomId && userId) {
        handlePlayerLeave(io, socket, roomId, userId, 'disconnected');
      }
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // Cleanup inactive rooms every 5 minutes
  setInterval(() => {
    roomService.cleanupInactiveRooms();
  }, 5 * 60 * 1000);
};

// Helper function to handle player leaving
function handlePlayerLeave(io, socket, roomId, userId, reason) {
  const room = roomService.getRoom(roomId);
  if (!room) return;

  const username = room.players.player1?.userId === userId
    ? room.players.player1.username
    : room.players.player2?.username;

  // Notify other players
  socket.to(roomId).emit('player-left', {
    userId,
    username,
    reason
  });

  // If match is active, end it
  if (room.status === 'active') {
    const winner = room.players.player1?.userId === userId
      ? room.players.player2
      : room.players.player1;

    io.to(roomId).emit('match-end', {
      winner: {
        userId: winner.userId,
        username: winner.username,
        score: winner.score
      },
      reason: 'opponent-left'
    });
  }

  // Remove player from room
  roomService.removePlayer(roomId, userId);

  // Leave socket.io room
  socket.leave(roomId);
}

// Helper function to end match
function endMatch(io, room) {
  room.status = 'finished';
  room.endTime = new Date();

  const player1 = room.players.player1;
  const player2 = room.players.player2;

  // Determine winner
  let winner, loser;
  if (player2.health <= 0 || player1.score > player2.score) {
    winner = player1;
    loser = player2;
  } else {
    winner = player2;
    loser = player1;
  }

  room.winner = winner.userId;

  const duration = Math.floor((room.endTime - room.startTime) / 1000);

  io.to(room.id).emit('match-end', {
    winner: {
      userId: winner.userId,
      username: winner.username,
      score: winner.score
    },
    loser: {
      userId: loser.userId,
      username: loser.username,
      score: loser.score
    },
    duration,
    stats: {
      totalWords: room.wordPool.length,
      wordsClaimed: room.wordPool.filter(w => w.claimed).length
    }
  });

  // Save match to database
  // saveMatchToDatabase(room);

  console.log(`Match ended in room: ${room.code}, Winner: ${winner.username}`);
}
```

### 5.2 State Synchronization Strategy

#### Authoritative Server Model
- Server is the single source of truth
- Clients send inputs, server validates and broadcasts results
- Prevents cheating (client-side manipulation)

#### Client-Side Prediction
- Client immediately shows projectile animation
- Server confirms damage after validation
- Rollback if server rejects (rare)

#### Latency Compensation
- Timestamp all events
- Server-side interpolation for fairness
- Grace period (100ms) for simultaneous typing

---

## 6. AI Integration

### 6.1 Dynamic Word Pool Generation

#### Claude API Integration
```javascript
async function generateWordPool(player1Rating, player2Rating) {
  const avgRating = (player1Rating + player2Rating) / 2;
  const difficulty = calculateDifficulty(avgRating);
  
  const prompt = `Generate a balanced word pool for a typing battle game.

Player 1 Rating: ${player1Rating}
Player 2 Rating: ${player2Rating}
Difficulty Level: ${difficulty}

Requirements:
- Total words: 30
- Distribution: 12 short (3-5 letters), 12 medium (6-8 letters), 6 long (9+ letters)
- Mix common and moderately challenging English words
- Avoid: offensive words, proper nouns, contractions
- Difficulty appropriate for rating: ${avgRating}

Return ONLY a JSON array: [{"word": "example", "length": 7, "damage": 7}]`;

  const response = await callClaudeAPI(prompt);
  return parseWordPool(response);
}
```

#### Difficulty Scaling
```javascript
function calculateDifficulty(rating) {
  if (rating < 800) return 'beginner';
  if (rating < 1200) return 'intermediate';
  if (rating < 1600) return 'advanced';
  return 'expert';
}
```

### 6.2 Real-Time Commentary

```javascript
async function generateCommentary(event) {
  const prompt = `Generate exciting battle commentary for:
Event: Player ${event.player} typed "${event.word}" (${event.damage} damage)
Current HP: Player 1: ${event.p1HP}, Player 2: ${event.p2HP}

Return one short, exciting sentence (max 10 words).`;

  const response = await callClaudeAPI(prompt);
  return response;
}
```

---

## 7. Security & Performance

### 7.1 Security Measures

#### Authentication
- JWT tokens (24-hour expiry)
- Password hashing with bcrypt (10 salt rounds)
- HTTPS only in production

#### Input Validation
- Sanitize all user inputs
- Validate word against pool on server
- Rate limiting (max 10 words/second)

#### WebSocket Security
- Authenticate socket connections with JWT
- Validate room permissions
- Auto-disconnect idle connections (5 minutes)

### 7.2 Performance Optimization

#### Frontend
- Canvas rendering at 60 FPS
- Object pooling for projectiles
- Debounced input validation
- Lazy loading for components

#### Backend
- Sequelize connection pooling
  ```javascript
  const sequelize = new Sequelize(DATABASE_URL, {
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    }
  });
  ```
- PM2 Cluster Mode for load balancing (2+ instances)
  ```javascript
  // ecosystem.config.js
  module.exports = {
    apps: [{
      instances: 2,
      exec_mode: 'cluster'
    }]
  };
  ```
- Nginx caching for static assets
- Redis caching for:
  - Active game rooms
  - Matchmaking queue
  - User sessions
  - Leaderboards
- Horizontal scaling: Add more EC2 instances with load balancer

#### Database (Sequelize + PostgreSQL)
- Indexed columns: userId, matchId, rating
  ```javascript
  // In migration
  await queryInterface.addIndex('Users', ['rating']);
  await queryInterface.addIndex('Matches', ['player1Id', 'player2Id']);
  ```
- Eager loading to prevent N+1 queries
  ```javascript
  const matches = await Match.findAll({
    include: [
      { model: User, as: 'player1' },
      { model: User, as: 'player2' }
    ]
  });
  ```
- Use raw queries for complex aggregations
  ```javascript
  const stats = await sequelize.query(
    'SELECT ... FROM users WHERE ...',
    { type: QueryTypes.SELECT }
  );
  ```
- Partition large tables (MatchEvent)
- Regular vacuum/analyze operations

---

## 8. Testing Strategy

### 8.1 Unit Tests
```javascript
// Example tests for React components
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import TypingInput from '../components/game/TypingInput';

describe('TypingInput', () => {
  test('should render input field', () => {
    render(<TypingInput />);
    expect(screen.getByPlaceholderText(/type a spell/i)).toBeInTheDocument();
  });
  
  test('should call onSubmit when Enter is pressed', () => {
    const handleSubmit = vi.fn();
    render(<TypingInput onSubmit={handleSubmit} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'fireball' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 13 });
    
    expect(handleSubmit).toHaveBeenCalledWith('fireball');
  });
});

// Example tests for game logic
describe('GameRoom', () => {
  test('should create room with two players', () => {});
  test('should validate word from pool', () => {});
  test('should calculate damage correctly', () => {});
  test('should determine winner correctly', () => {});
});

describe('MatchmakingService', () => {
  test('should match players within rating range', () => {});
  test('should expand search after timeout', () => {});
});
```

```json
// package.json test scripts
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0"
  }
}
```

### 8.2 Integration Tests
- WebSocket connection flow
- Match creation and completion
- Database transactions
- AI API integration

### 8.3 End-to-End Tests
- Complete match flow
- Matchmaking to match completion
- Rating updates after match
- Leaderboard updates

### 8.4 Load Testing
- Simulate 100+ concurrent matches
- Test server stability under load
- Database query performance
- WebSocket connection limits

---

## 9. Deployment

### 9.1 Environment Setup

#### Development (Local + Supabase)
```
- Supabase PostgreSQL (cloud-hosted)
- Local Node.js server with nodemon
- Vite dev server (HMR enabled, port 5173)
- PM2 (optional for local testing)
- Mock AI responses (optional)
```

#### Production (AWS EC2)
```
- Supabase PostgreSQL (production database)
- AWS EC2 Ubuntu/Amazon Linux instance
- Node.js backend with PM2 process manager
- Nginx as reverse proxy
- Frontend built with Vite, served by Nginx
- SSL/TLS with Let's Encrypt
- CloudWatch for monitoring
- Redis for caching (optional)
```

### 9.2 AWS EC2 Server Setup

#### EC2 Instance Specifications
```
Instance Type: t3.medium (2 vCPU, 4 GB RAM)
Operating System: Ubuntu 22.04 LTS or Amazon Linux 2
Storage: 30 GB SSD
Security Groups:
  - SSH (22) - Your IP only
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0
  - Custom TCP (3001) - Internal only
```

#### Initial EC2 Setup
```bash
# Connect to EC2
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Install build essentials (for native modules)
sudo apt install -y build-essential
```

### 9.3 PM2 Configuration

#### PM2 Ecosystem File
```javascript
// game-server/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'tower-spell-battle-server',
    script: './server.js',
    instances: 2,  // Use 2 instances for load balancing
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '500M',
    // Restart strategies
    min_uptime: '10s',
    max_restarts: 10,
    autorestart: true,
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    shutdown_with_message: true
  }]
};
```

#### PM2 Commands
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Start with specific name
pm2 start server.js --name "tower-spell-battle"

# View all processes
pm2 list

# Monitor in real-time
pm2 monit

# View logs
pm2 logs
pm2 logs tower-spell-battle-server
pm2 logs --lines 100

# Restart application
pm2 restart tower-spell-battle-server

# Reload (zero-downtime restart)
pm2 reload tower-spell-battle-server

# Stop application
pm2 stop tower-spell-battle-server

# Delete from PM2
pm2 delete tower-spell-battle-server

# Save current PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs

# Update PM2
pm2 update
```

### 9.4 Nginx Configuration

#### Nginx Server Block
```nginx
# /etc/nginx/sites-available/tower-spell-battle
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend - Serve Vite build
    root /var/www/tower-spell-battle/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Support for Socket.io
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket timeout settings
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
```

#### Enable Nginx Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/tower-spell-battle /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

### 9.5 SSL Setup with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run

# Certificates auto-renew via cron/systemd timer
```

### 9.6 Deployment Script

```bash
#!/bin/bash
# deploy.sh - Automated deployment script

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Pull latest code
cd /var/www/tower-spell-battle
git pull origin main

# Backend deployment
echo "📦 Installing server dependencies..."
cd game-server
npm ci --production

# Run migrations
echo "🗃️ Running database migrations..."
npx sequelize-cli db:migrate

# Restart with PM2
echo "🔄 Restarting server with PM2..."
pm2 reload ecosystem.config.js --env production

# Frontend deployment
echo "🎨 Building frontend..."
cd ../game-client
npm ci
npm run build

# Copy build to Nginx directory
echo "📋 Copying build to Nginx..."
sudo rm -rf /var/www/tower-spell-battle/client/dist
sudo cp -r dist /var/www/tower-spell-battle/client/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/tower-spell-battle/client/dist

echo "✅ Deployment complete!"

# Show PM2 status
pm2 list
```

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 9.7 Environment Variables on EC2

```bash
# Create .env file in server directory
cd /var/www/tower-spell-battle/game-server

# Edit .env
sudo nano .env
```

```bash
# .env (Production)
NODE_ENV=production
PORT=3001

# Supabase Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# JWT Secret
JWT_SECRET=your-super-secret-production-key-change-this

# Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key

# CORS Origin
CORS_ORIGIN=https://yourdomain.com

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### 9.8 Monitoring and Logs

#### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# CPU and Memory usage
pm2 status

# View logs
pm2 logs --lines 200

# Log rotation (prevent large log files)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### System Monitoring
```bash
# Install htop for system monitoring
sudo apt install -y htop

# Monitor system resources
htop

# Check disk space
df -h

# Check memory
free -h

# Monitor Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

#### AWS CloudWatch
```bash
# Install CloudWatch agent (optional)
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

### 9.9 Database Management (Supabase)

#### Running Migrations on Supabase
```bash
# From your EC2 server
cd /var/www/tower-spell-battle/game-server

# Run migrations
npx sequelize-cli db:migrate

# Undo last migration (if needed)
npx sequelize-cli db:migrate:undo

# Check migration status
npx sequelize-cli db:migrate:status
```

#### Supabase Dashboard
- Access: https://app.supabase.com
- View tables, run SQL queries
- Monitor database performance
- Set up backups (automatic daily backups)
- View real-time database activity

### 9.10 CI/CD Pipeline (GitHub Actions + AWS EC2)

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS EC2

on:
  push:
    branches: [main]

jobs:
  test-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        working-directory: ./game-client
        run: npm ci
      - name: Run linter
        working-directory: ./game-client
        run: npm run lint
      - name: Build client
        working-directory: ./game-client
        run: npm run build
        
  test-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        working-directory: ./game-server
        run: npm ci
      - name: Run tests
        working-directory: ./game-server
        run: npm test
        
  deploy-to-ec2:
    needs: [test-client, test-server]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/tower-spell-battle
            git pull origin main
            ./deploy.sh
```

#### GitHub Secrets Required
```
EC2_HOST: Your EC2 instance public IP or domain
EC2_SSH_KEY: Your private SSH key (.pem file content)
```

---

## 10. Future Enhancements

### 10.1 Phase 2 Features
- [ ] Multiple game modes (blitz, marathon, practice)
- [ ] Custom room creation (private matches)
- [ ] Friend system and friend battles
- [ ] Tournament system
- [ ] Replay system
- [ ] Achievement/badge system

### 10.2 Phase 3 Features
- [ ] Mobile app (React Native)
- [ ] Voice chat during matches
- [ ] Custom avatar/tower skins
- [ ] Seasonal leaderboards
- [ ] Clan/team system
- [ ] Spectator mode

### 10.3 Advanced AI Features
- [ ] Personalized word lists based on typing patterns
- [ ] AI opponent for practice mode
- [ ] Adaptive difficulty during match
- [ ] Post-match analysis with improvement tips
- [ ] Dynamic theme-based word pools

---

## 11. Monitoring & Analytics

### 11.1 Metrics to Track
- Active concurrent users
- Match completion rate
- Average match duration
- Server response time
- Database query performance (Supabase dashboard)
- WebSocket connection stability
- AI API response time
- Player retention rate
- PM2 process metrics (CPU, memory, restarts)
- EC2 instance health (CloudWatch)
- Nginx request rates

### 11.2 Error Tracking
- PM2 error logs (`pm2 logs --err`)
- Nginx error logs (`/var/log/nginx/error.log`)
- Custom logging for game events
- Database query logging (Sequelize)
- AI API failure tracking
- AWS CloudWatch alarms for critical errors

### 11.3 User Analytics
- Daily/Monthly Active Users (DAU/MAU)
- Match frequency per user
- Average words per minute progression
- Rating distribution
- Most common words typed
- Peak usage times
- Geographic distribution (AWS CloudFront)

---

## 12. API Documentation

### 12.1 REST API Endpoints

#### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/verify
```

#### User
```
GET    /api/users/:id
PUT    /api/users/:id
GET    /api/users/:id/stats
GET    /api/users/:id/matches
```

#### Matches
```
GET    /api/matches/:id
GET    /api/matches/:id/events
```

#### Leaderboard
```
GET    /api/leaderboard?limit=100&offset=0
```

### 12.2 WebSocket API

See Section 5.1 for complete WebSocket event documentation.

---

## Appendix A: Technology Justification

### Why React + Vite?
- **Vite**: Lightning-fast HMR (Hot Module Replacement) for instant feedback during development
- **Vite**: Optimized build with code splitting and tree-shaking
- **Vite**: Native ES modules support, no bundling in dev mode
- **React**: Component-based architecture perfect for game UI
- **React Hooks**: Clean state management with useState, useEffect, useRef
- **Large ecosystem**: Huge community and package availability
- **Excellent for real-time UI updates**: Perfect for game state changes
- **HTML5 Canvas integration**: Easy to work with Canvas in React components
- **JavaScript (no TypeScript)**: Faster development, less boilerplate, easier for team members

### Why Node.js + Socket.io?
- JavaScript full-stack
- Real-time communication built-in
- High concurrency handling
- Large package ecosystem

### Why PM2?
- **Process Management**: Automatic restart on crashes, ensures zero-downtime
- **Cluster Mode**: Run multiple instances for load balancing
- **Log Management**: Built-in log rotation and aggregation
- **Monitoring**: Real-time CPU and memory monitoring
- **Zero-downtime Deployment**: Reload without dropping connections
- **Startup Scripts**: Auto-start on server reboot
- **Production Ready**: Battle-tested by thousands of Node.js apps

### Why Supabase?
- **Managed PostgreSQL**: No server maintenance required
- **Automatic Backups**: Daily automatic backups included
- **Real-time Features**: Built-in real-time subscriptions (optional use)
- **Great Developer Experience**: Intuitive dashboard and SQL editor
- **Free Tier**: Generous free tier for development
- **Scalable**: Easy to scale as your game grows
- **Global CDN**: Fast access from anywhere in the world

### Why AWS EC2?
- **Full Control**: Complete control over server configuration
- **Cost-effective**: Pay only for what you use, Reserved Instances for savings
- **Scalability**: Easy to scale vertically or horizontally
- **Reliability**: 99.99% uptime SLA
- **PM2 Compatible**: Perfect environment for PM2 process management
- **Nginx Support**: Standard setup for reverse proxy
- **Security**: VPC, Security Groups, IAM for fine-grained control

### Why Claude API?
- High-quality natural language generation
- Consistent word difficulty
- Creative commentary generation
- Reliable and fast responses

---

## Appendix B: Glossary

- **MMR**: Matchmaking Rating (ELO system)
- **WPM**: Words Per Minute
- **WebSocket**: Full-duplex communication protocol
- **JWT**: JSON Web Token
- **ORM**: Object-Relational Mapping
- **Projectile**: Visual representation of spell traveling
- **Word Pool**: Set of words available in a match
- **Game Room**: Server-side match instance

## 13. Vite Configuration & Setup

### 13.1 Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

### 13.2 Environment Variables

```bash
# .env.development
VITE_SERVER_URL=http://localhost:3001
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# .env.production
VITE_SERVER_URL=https://api.towerspellbattle.com
VITE_API_URL=https://api.towerspellbattle.com/api
VITE_WS_URL=wss://api.towerspellbattle.com
```

```javascript
// Access in components
const serverUrl = import.meta.env.VITE_SERVER_URL;
```

### 13.3 Axios Configuration

```javascript
// utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 13.4 React Router Setup

```javascript
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import { useAuthStore } from './store/authStore';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } />
        <Route path="/game" element={
          <PrivateRoute>
            <GamePage />
          </PrivateRoute>
        } />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile/:userId" element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 13.5 Tailwind CSS Setup

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#ef4444',
        accent: '#fbbf24'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  plugins: []
}
```

```css
/* src/styles/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform;
  }
  
  .tower-blue {
    @apply bg-blue-600 border-blue-800;
  }
  
  .tower-red {
    @apply bg-red-600 border-red-800;
  }
}
```

### 13.6 Package.json Scripts

```json
{
  "name": "tower-spell-battle-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "socket.io-client": "^4.6.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.0"
  }
}
```
- **Version**: 1.0
- **Last Updated**: December 2024
- **Author**: Development Team
- **Status**: Active Development