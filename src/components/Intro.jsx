import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faGift } from '@fortawesome/free-solid-svg-icons';

export default function Intro({ onGift }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="stage stage--intro view-enter">
      <button className="pill pill--glass intro-btn" onClick={() => setOpen(true)}>
        <FontAwesomeIcon icon={faEnvelope} />
        Ver mensaje
      </button>

      {open && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-card">
            <p className="modal-kicker">Para ti</p>
              <h1 id="modal-title">
                <span>Feliz cumpleaños</span>
                <span className="modal-name">Popi</span>
              </h1>
              <p className="modal-text">
                Gracias por la amistad que tenemos en este corto tiempo, ha sido loco y gracioso como nos conocimos y pues mantener hasta ahora una amistad así de buena es algo que no se encuentra hoy en día. Gracias por ser como eres, fuera de todas las bromas que podamos hacer de verdad te admiro mucho y siempre voy a querer lo mejor vos (pez). Te quiero mucho alfajor, disfruta de tu regalo.
              </p>
              <button className="pill pill--red" onClick={onGift} autoFocus>
                <FontAwesomeIcon icon={faGift} />
                Ver regalo
              </button>
          </div>
        </div>
      )}
    </section>
  );
}
