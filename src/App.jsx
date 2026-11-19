import { useState } from 'react';
import { PlayerProvider } from './PlayerContext.jsx';
import Intro from './components/Intro.jsx';
import Gift from './components/Gift.jsx';
import Library from './components/Library.jsx';
import PlayerView from './components/PlayerView.jsx';

/**
 * Flujo:  intro (chico + modal)  →  gift (empaque, "Ir a biblioteca")
 *         →  library (lista por álbumes)  ⇄  player (reproductor)
 * La música sigue sonando al cambiar de pantalla (el audio vive en PlayerProvider).
 */
export default function App() {
  const [view, setView] = useState('intro');
  const go = (v) => () => setView(v);

  return (
    <PlayerProvider>
      <div className={`backdrop backdrop--${view === 'intro' ? 'intro' : 'pack'}`} />
      <main className="app">
        {view === 'intro' && <Intro onGift={go('gift')} />}
        {view === 'gift' && <Gift onLibrary={go('library')} onPlayer={go('player')} />}
        {view === 'library' && <Library onPlayer={go('player')} onHome={go('gift')} />}
        {view === 'player' && <PlayerView onLibrary={go('library')} onHome={go('gift')} />}
      </main>
    </PlayerProvider>
  );
}
