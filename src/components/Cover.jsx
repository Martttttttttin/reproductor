import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

/** Portada cuadrada; si no hay imagen muestra una nota musical */
export default function Cover({ src, className = '' }) {
  return src ? (
    <img className={`cover ${className}`} src={src} alt="" loading="lazy" />
  ) : (
    <span className={`cover cover--empty ${className}`}>
      <FontAwesomeIcon icon={faMusic} />
    </span>
  );
}
