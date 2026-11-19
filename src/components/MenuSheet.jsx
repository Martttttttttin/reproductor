import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

/**
 * Hoja del menú (con fondo desenfocado). Se usa en la biblioteca y en el reproductor.
 * items: [{ key, icon, label, onClick }]   — "Cerrar" se agrega siempre al final.
 */
export default function MenuSheet({ items, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" role="menu" onClick={(e) => e.stopPropagation()}>
        {items.map((item) => (
          <button key={item.key} className="sheet-item" role="menuitem" onClick={item.onClick}>
            <FontAwesomeIcon icon={item.icon} /> {item.label}
          </button>
        ))}
        <button className="sheet-item sheet-item--close" role="menuitem" onClick={onClose}>
          <FontAwesomeIcon icon={faXmark} /> Cerrar
        </button>
      </div>
    </div>
  );
}
