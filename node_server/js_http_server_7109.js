let http = require('http');

const records = new Array(10)
  .fill(0);

const recentSecond = 10

let server = http.createServer(function (req, res) {
  if (req.method === 'GET') {

    switch (req.url) {
      case '/xxx':
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8'
        });
        res.end(statisticsHTML());
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
        dateStr += ` - In ${recentSecond}s`
      } else {
        dateStr += ` - ${Math.floor((Date.now() - o) / 1e3)}s`
      }
      return dateStr
    } else {
      return ''
    }
  })

  return arr.join('<br>')
}

function checkIsRunning() {
  if (records.length) {
    return Date.now() - records[records.length - 1] < recentSecond * 1e3
  } else {
    return false
  }
}

function statisticsHTML() {
  const isRunning = checkIsRunning()

  return `<!doctype html>

  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  
    <title>Server Status</title>
    
    <style>
      body {
        background: #000;
        color: #c7c7c7;
      }

      .status {
        display: flex;
      }
      .status span {
        width: 20px;
        height: 20px;
        margin-right: 8px;
        border-radius: 50%;
        
        display: inline-flex;
      }
      .status .running {
        background: #0f0;
      }
      .status .stop {
        background: #f00;
      }
    </style>
  </head>
  
  <body>
    <div class="status">${ isRunning ? '<span class="running"></span> Running' : '<span class="stop"></span> Stop' }</div>
    <div>${formatRecords()}</div>
    <script>
      setTimeout(() => {
        location.reload()
      }, 30e3)
    </script>
  </body>
  </html>`
}

server.listen(7109);
