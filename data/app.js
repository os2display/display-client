const jsonServer = require('json-server');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const v1Router = jsonServer.router('v1.json');

v1Router.db._.id = "jsonServerId";

v1Router.render = (req, res) => {
  let data = res.locals.data;

  if (Array.isArray(data)) {
    const path = req.originalUrl;

    // Remove jsonServerId.
    res.locals.data = res.locals.data.map((element) => {
      delete element.jsonServerId;
      return element;
    });

    res.jsonp({
      "@id": path,
      "@type": "hydra:Collection",
      "hydra:member": data,
      "hydra:totalItems": data.length,
      "hydra:view": {
        "@id": path + "?page=1",
        "@type": "hydra:PartialCollectionView",
        "hydra:first": path + "?page=1",
        "hydra:last": path + "?page=1",
        "hydra:next": path + "?page=1"
      }
    })
  }
  else {
    // Remove jsonServerId.
    delete data.jsonServerId;

    res.jsonp(data);
  }
}

server.use(middlewares);
server.use('/v1', v1Router);

server.listen(3000, () => {});
