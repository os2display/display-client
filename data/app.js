const jsonServer = require('json-server');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const v1Router = jsonServer.router('v1.json');

const hydraRender = (req, res) => {
  let { data } = res.locals;

  // Rewrite of result for '/v1/screens/:screenId/region/:regionId/playlists'
  if (req.originalUrl.startsWith('/v1/playlistScreenRegion')) {
    data = data.map((playlistScreenRegion) => playlistScreenRegion.playlist);
  }

  if (Array.isArray(data)) {
    const path = req.originalUrl;

    res.jsonp({
      '@id': path,
      '@type': 'hydra:Collection',
      'hydra:member': data,
      'hydra:totalItems': data.length,
      'hydra:view': {
        '@id': `${path}`,
        '@type': 'hydra:PartialCollectionView',
        'hydra:first': `${path}`,
        'hydra:last': `${path}`,
        'hydra:next': `${path}`,
      },
    });
  } else {
    res.jsonp(data);
  }
};

/*
server.use('/v1/playlists/:playlistId/slides', (req, res) => {
  res.redirect(
    `/v1/slidesPlaylist?_expand=slide&playlist=${req.params.playlistId}`
  );
});

server.use('/v1/screens/:screenId/region/:regionId/playlists', (req, res) => {
  res.redirect(
    `/v1/playlistScreenRegion?_expand=playlist&screen=${req.params.screenId}&region=${req.params.regionId}`
  );
});
*/

v1Router.render = hydraRender;

server.use(middlewares);
server.use('/v1', v1Router);

server.listen(3000, () => {});
