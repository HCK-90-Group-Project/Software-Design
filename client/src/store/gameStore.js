import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  gameStatus: 'waiting', // 'waiting' | 'countdown' | 'playing' | 'finished'
  wordPool: [], // Array of { word, damage, claimed, claimedBy }
  currentInput: '',
  
  // Player State
  player1: { health: 100, score: 0, username: 'You', isReady: false },
  player2: { health: 100, score: 0, username: 'Opponent', isReady: false },
  
  // Visuals
  projectiles: [], // Array of { id, x, y, targetX, targetY, damage, color }
  
  // Actions
  setGameStatus: (status) => set({ gameStatus: status }),
  setWordPool: (words) => set({ wordPool: words }),
  setCurrentInput: (input) => set({ currentInput: input }),
  
  // Update local input and check for matches
  handleInput: (input) => {
    set({ currentInput: input });
    // Note: Actual validation usually happens on server, 
    // but we can do optimistic checking here or wait for socket event
  },

  updatePlayer1: (data) => set((state) => ({ player1: { ...state.player1, ...data } })),
  updatePlayer2: (data) => set((state) => ({ player2: { ...state.player2, ...data } })),

  // Animation helpers
  addProjectile: (projectile) => set((state) => ({
    projectiles: [...state.projectiles, projectile]
  })),
  
  updateProjectiles: () => set((state) => {
    // Move projectiles towards targets
    const newProjectiles = state.projectiles.map(p => {
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 5) return null; // Hit target

      const speed = 8;
      return {
        ...p,
        x: p.x + (dx / distance) * speed,
        y: p.y + (dy / distance) * speed
      };
    }).filter(Boolean); // Remove nulls (hits)

    return { projectiles: newProjectiles };
  })
}));