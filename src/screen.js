import { Fragment, React, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import SunCalc from 'suncalc';
import { createGrid } from 'os2display-grid-generator';
import Region from './region';
import './screen.scss';
import getLogger from './logger/logger';
import TouchRegion from './touch-region';
import ConfigLoader from './config-loader';

/**
 * Screen component.
 *
 * @param {object} props
 *   Props.
 * @param {object} props.screen
 *   The screen data.
 * @returns {object}
 *   The component.
 */
function Screen({ screen }) {
  const configColumns = screen?.layoutData?.grid?.columns || 1;
  const configRows = screen?.layoutData?.grid?.rows || 1;
  const gridTemplateColumns = '1fr '.repeat(configColumns);
  const gridTemplateRows = '1fr '.repeat(configRows);
  const colorSchemeIntervalRef = useRef(null);

  const rootStyle = {
    gridTemplateAreas: createGrid(configColumns, configRows),
    gridTemplateColumns: gridTemplateRows,
    gridTemplateRows: gridTemplateColumns,
  };

  const refreshColorScheme = () => {
    ConfigLoader.loadConfig().then((config) => {
      getLogger().then((logger) => logger.log('info', 'Refreshing color scheme.'));

      const now = new Date();
      let colorScheme = '';

      if (config.colorScheme?.type === 'library') {
        // Default to somewhere in Denmark.
        const times = SunCalc.getTimes(
          now,
          config.colorScheme?.lat ?? 56.0,
          config.colorScheme?.lng ?? 10.0
        );

        if (now > times.sunrise && now < times.sunset) {
          getLogger().then((logger) => logger.log('info', 'Light color scheme activated.'));
          colorScheme = 'color-scheme-light';
        } else {
          getLogger().then((logger) => logger.log('info', 'Dark color scheme activated.'));
          colorScheme = 'color-scheme-dark';
        }
      } else {
        // Browser based.
        colorScheme = window?.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'color-scheme-dark'
          : 'color-scheme-light';
      }

      // Set class name on html root.
      document.documentElement.classList.remove(
        'color-scheme-light',
        'color-scheme-dark'
      );
      document.documentElement.classList.add(colorScheme);
    });
  };

  useEffect(() => {
    if (screen?.enableColorSchemeChange) {
      getLogger().then((logger) => logger.log('info', 'Enabling color scheme change.'));
      refreshColorScheme();
      // Refresh color scheme every 5 minutes.
      colorSchemeIntervalRef.current = setInterval(
        refreshColorScheme,
        5 * 60 * 1000
      );
    }

    return () => {
      if (colorSchemeIntervalRef.current !== null) {
        clearInterval(colorSchemeIntervalRef.current);
      }

      // Cleanup html root classes.
      document.documentElement.classList.remove(
        'color-scheme-light',
        'color-scheme-dark'
      );
    };
  }, [screen]);

  return (
    <div className="screen" style={rootStyle} id={screen['@id']}>
      {screen?.layoutData?.regions?.map((region) => (
        <Fragment key={region['@id']}>
          {/* Default region type */}
          {(!region.type || region.type === 'default') && (
            <Region key={region['@id']} region={region} />
          )}
          {/* Special region type: touch-buttons */}
          {region?.type === 'touch-buttons' && (
            <TouchRegion key={region['@id']} region={region} />
          )}
        </Fragment>
      ))}
    </div>
  );
}

Screen.propTypes = {
  screen: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    layoutData: PropTypes.shape({
      grid: PropTypes.shape({
        columns: PropTypes.number.isRequired,
        rows: PropTypes.number.isRequired,
      }),
      regions: PropTypes.arrayOf(
        PropTypes.shape({
          '@id': PropTypes.string.isRequired,
          // @TODO: Expand prop type.
        })
      ),
    }).isRequired,
    enableColorSchemeChange: PropTypes.bool,
  }).isRequired,
};

export default Screen;
