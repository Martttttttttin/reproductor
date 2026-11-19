import { useCallback, useState } from 'react';
import { PlayerProvider } from './PlayerContext.jsx';
import Intro from './components/Intro.jsx';
import Gift from './components/Gift.jsx';
import Library from './components/Library.jsx';
import PlayerView from './components/PlayerView.jsx';
import BackgroundPicker from './components/BackgroundPicker.jsx';
import Opening from './components/Opening.jsx';

/**
 * Flujo:  intro (chico + modal)  →  gift (empaque, "Ir a biblioteca")
 *         →  library (lista por álbumes)  ⇄  player (reproductor)
 * La música sigue sonando al cambiar de pantalla (el audio vive en PlayerProvider).
 */
export default function App() {
  const [view, setView] = useState('opening');
  const [background, setBackground] = useState(() => {
    try {
      const saved = Number(localStorage.getItem('popi-background'));
      return saved >= 1 && saved <= 4 ? saved : 1;
    } catch { return 1; }
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const selectBackground = (value) => {
    setBackground(value);
    try { localStorage.setItem('popi-background', String(value)); } catch { /* Storage can be unavailable. */ }
  };
  const backgroundStyle = { '--pack-background': `url('/img/empaque${background === 1 ? '' : background}.webp')` };
  const go = (v) => () => setView(v);
  const goIntro = useCallback(() => setView('intro'), []);

  return (
    <PlayerProvider>
      <div className={`backdrop backdrop--${view === 'intro' ? 'intro' : 'pack'}`} style={backgroundStyle} />
      <main className="app" style={backgroundStyle}>
        {view === 'opening' && <Opening onComplete={goIntro} />}
        {view === 'intro' && <Intro onGift={go('gift')} />}
        {view === 'gift' && <Gift onLibrary={go('library')} onPlayer={go('player')} />}
        {view === 'library' && <Library onPlayer={go('player')} onHome={go('gift')} />}
        {view === 'player' && <PlayerView onLibrary={go('library')} onHome={go('gift')} />}
        {view !== 'intro' && view !== 'opening' && <BackgroundPicker selected={background} onSelect={selectBackground} open={pickerOpen} setOpen={setPickerOpen} />}
      </main>
    </PlayerProvider>
  );
}
