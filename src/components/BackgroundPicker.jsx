import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';

const backgrounds = [1, 2, 3, 4].map((n) => ({
  id: n,
  src: `/img/empaque${n === 1 ? '' : n}.webp`,
}));

export default function BackgroundPicker({ selected, onSelect, open, setOpen }) {
  const trigger = useRef(null);
  const dialog = useRef(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    dialog.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab') return;
      const buttons = [...dialog.current.querySelectorAll('button')];
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, setOpen]);

  return (
    <div className="background-picker">
      <button ref={trigger} className="background-trigger" onClick={() => setOpen(true)} aria-label="Cambiar fondo" aria-haspopup="dialog">
        <FontAwesomeIcon icon={faImage} />
        <span>Fondo</span>
      </button>
      {open && (
        <div className="background-overlay" onClick={() => setOpen(false)}>
          <div ref={dialog} className="background-dialog" role="dialog" aria-modal="true" aria-labelledby="background-title" tabIndex={-1} onClick={(event) => event.stopPropagation()}>
            <div className="background-heading">
              <div><p>Personaliza tu reproductor</p><h2 id="background-title">Elige un fondo</h2></div>
              <button className="background-close" onClick={() => setOpen(false)} aria-label="Cerrar selector de fondo"><FontAwesomeIcon icon={faXmark} /></button>
            </div>
            <div className="background-grid">
              {backgrounds.map((background) => (
                <button key={background.id} className={`background-option${selected === background.id ? ' background-option--selected' : ''}`} onClick={() => { onSelect(background.id); setOpen(false); }} aria-label={`Elegir fondo ${background.id}${selected === background.id ? ', seleccionado' : ''}`} aria-pressed={selected === background.id}>
                  <img src={background.src} alt="" />
                  <span>Fondo {background.id}</span>
                  {selected === background.id && <span className="background-check" aria-hidden="true"><FontAwesomeIcon icon={faCheck} /></span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}