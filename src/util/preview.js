/**
 * Create screen data for displaying playlist preview.
 *
 * @param {object} playlist Playlist data.
 * @returns {object} Screen data.
 */
function screenForPlaylistPreview(playlist) {
  return {
    '@id': '/v2/screens/SCREEN01234567890123456789',
    '@type': 'Screen',
    title: 'Preview',
    description: 'Screen for preview.',
    layout: '/v2/layouts/LAYOUT01234567890123456789',
    regions: [
      '/v2/screens/SCREEN01234567890123456789/regions/REGION01234567890123456789/playlists',
    ],
    regionData: {
      REGION01234567890123456789: [playlist],
    },
    layoutData: {
      '@id': '/v2/layouts/LAYOUT01234567890123456789',
      '@type': 'ScreenLayout',
      title: 'Full screen',
      grid: {
        rows: 1,
        columns: 1,
      },
      regions: [
        {
          '@type': 'ScreenLayoutRegions',
          '@id': '/v2/layouts/regions/REGION01234567890123456789',
          title: 'full',
          gridArea: ['a'],
          screenLayout: '/v2/layouts/LAYOUT01234567890123456789',
        },
      ],
    },
  };
}

/**
 * Create screen data for displaying slide preview.
 *
 * @param {object} slide Slide data.
 * @returns {object} Screen data.
 */
function screenForSlidePreview(slide) {
  const playlist = {
    '@id': '/v2/playlists/01HT6WPZCR50W8EF9004PVQ11P',
    '@type': 'Playlist',
    title: 'Preview playlist',
    description: 'Playlist for preview',
    schedules: [],
    slides: '/v2/playlists/PLAYLIST12345678901234567/slides',
    slidesData: [slide],
  };
  return screenForPlaylistPreview(playlist);
}

export { screenForPlaylistPreview, screenForSlidePreview };
