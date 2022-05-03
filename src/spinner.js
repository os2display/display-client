import { React } from 'react';
import './spinner.scss';

/**
 * Spinner component.
 *
 * loading.io css spinner ( https://loading.io/css/ )
 *
 * @returns {object} Component.
 */
function Spinner() {
  return (
    <div className="lds-grid m-5">
      {[...Array(9)].map(() => (
        <div />
      ))}
    </div>
  );
}

Spinner.propTypes = {};

export default Spinner;
