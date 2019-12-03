var es = require('elasticsearch');
const client = new es.Client({
  node: 'http://localhost:9200',
  log: 'trace'
});

client.indices.putMapping(
  {
    index: 'dhamakan',
    type: '_doc',
    body: {
      properties: {
        title: {
          type: 'text',
          analyzer: 'english'
        },
        content: {
          type: 'text',
          analyzer: 'english'
        }
      }
    }
  },
  function(err, resp) {
    if (err) {
      console.log(err);
    } else {
      console.log(resp);
    }
  }
);
