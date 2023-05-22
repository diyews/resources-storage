let http = require('http');

const records = new Array(10)
  .fill(0);

const recentSecond = 10

let server = http.createServer(function(req, res) {
  if (req.method === 'GET') {

    switch (req.url) {
      case '/xxx':
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.end(formatRecords());
        break;
      case '/favicon.ico':
        res.writeHead(200, {
          'Content-Type': 'text/plain',
        });
        res.end('');
        break;
      default:
        records.shift()
        records.push(Date.now());

        res.writeHead(200, {
          'Content-Type': 'text/plain',
          'Content-Length': '1'
        });
        res.end('1');
    }
    // console.log(req.url)
  } else {
    res.writeHead(405, {
      'Content-Type': 'text/plain'
    });
    res.end('Method Not Allowed\n');
  }
});

function formatDate(date) {
  let yourDate = new Date(date)
  const offset = yourDate.getTimezoneOffset()
  yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000))
  const dateStr = yourDate.toISOString()
    .replace('T', ' ')
  return dateStr
}

function formatRecords() {
  const arr = records.map(o => {
    if (o > 0) {
      let dateStr = formatDate(o)

      if (Date.now() - o < recentSecond * 1e3) {
        dateStr += ` - In ${recentSecond }s`
      } else {
        dateStr += ` - ${Math.floor((Date.now() - o)/1e3)}s`
      }
      return dateStr
    } else {
      return ''
    }
  })

  return arr.join('\n')
}
server.listen(7109);
