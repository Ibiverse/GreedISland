import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { audio } from './systems/audio';
import MainMenu from './components/Menu/MainMenu';
import CharacterSelect from './components/Menu/CharacterSelect';
import MapScreen from './components/Map/MapScreen';
import CombatScreen from './components/Combat/CombatScreen';
import ShopScreen from './components/Shop/ShopScreen';
import RestScreen from './components/Rest/RestScreen';
import EventScreen from './components/Event/EventScreen';
import RewardScreen from './components/Reward/RewardScreen';
import GameOverScreen from './components/Menu/GameOverScreen';
import ScaleToFit from './components/Shared/ScaleToFit';

function Screen() {
  const screen = useGameStore(s => s.screen);

  switch (screen) {
    case 'menu':             return <MainMenu />;
    case 'character_select': return <CharacterSelect />;
    case 'map':              return <MapScreen />;
    case 'combat':
    case 'elite_combat':
    case 'boss_combat':      return <CombatScreen />;
    case 'shop':             return <ShopScreen />;
    case 'rest':             return <RestScreen />;
    case 'event':            return <EventScreen />;
    case 'reward':           return <RewardScreen />;
    case 'game_over':        return <GameOverScreen />;
    case 'victory':          return <GameOverScreen victory />;
    default:                 return <MainMenu />;
  }
}

function App() {
  // Unlock audio on first user interaction (works around browser autoplay policy)
  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown',     unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown',     unlock);
    };
  }, []);

  return (
    <ScaleToFit>
      <Screen />
    </ScaleToFit>
  );
}

export default App
