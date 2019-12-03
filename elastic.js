var es = require('elasticsearch');
const client = new es.Client({
  node: 'http://localhost:9200',
  log: 'trace'
});
const port = 3200;
const express = require('express');
const compress = require('compression');
const methodOverride = require('method-override');
const helmet = require('helmet');

var app = express();

app.use(compress());
app.use(methodOverride());
// secure apps by setting various HTTP headers
app.use(helmet());
// enable CORS - Cross Origin Resource Sharing

app.get('/', (req, res) => {
  client.ping(
    {
      requestTimeout: 30000
    },
    err => {
      if (err) {
        console.log(err);
        res.status(500).json({
          res: 'Unable to connect',
          err
        });
      } else {
        res.status(200).send('elastic up');
      }
    }
  );
});

app.get('/search', (req, res) => {
  let query = req.query.query;
  query ? query : '';

  let body = {
    size: 200,
    from: 0,
    query: {
      multi_match: {
        query: query,
        fields: ['content', 'title^2'],
        fuzziness: 4
      }
    }
  };

  client
    .search({
      index: 'dhamakan',
      body: body,
      type: '_doc'
    })
    .then(results => {
      rs = results.hits.hits;
      rs = rs.map(r => r._source);
      res.send(rs);
    })
    .catch(err => {
      console.log(err);
      res.send([]);
    });
});

app.listen(port, () => {
  console.log(`elastic server started on http://127.0.0.1:${port}`);
});

module.exports = app;

// create index

// client.indices.create(
//   {
//     index: 'polpa-dishes'
//   },
//   function(err, resp, status) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log('create', resp);
//     }
//   }
// );
