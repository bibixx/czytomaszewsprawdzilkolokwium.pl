require('dotenv').config();
const chalk = require('chalk');

const http = require('http');
const clientFactory = require("./utils/redis");
const { basicAuth } = require('./utils/basicAuth');

const port = 8080;

(async () => {
  const client = clientFactory();

  await client.setAsync("currentMarksNo", 0);
  await client.setAsync("isChecked", false);

  client.end(true);
  
  const server = http.createServer(async (req, res) => {
    console.log(chalk.blue(`[Request::${req.method}]  ${req.url}`));

    switch (req.url) {
      case '/': {
        await require('./index')(req, res);
        break;
      }
      case '/reset': {
        await basicAuth(require('./reset'))(req, res);
        break;
      }
      case '/crawl': {
        await basicAuth(require('./crawler'))(req, res);
        break;
      }
      default: {
        const data = `<h1 style="text-align: center;">404 Not Found</h1>`;

        res.writeHead(404, {
          'Content-Type': 'text/html',
          'Content-Length': data.length
        });
      
        res.write(data);
        res.end();
      }
    }

    const responseString = `[Response::${req.method}] ${req.url} => ${res.statusCode}`;
    if (Math.floor(res.statusCode / 100) === 2) {
      console.log(chalk.green(responseString));
    } else {
      console.log(chalk.yellow(responseString));
    }
  });

  server.listen(port, (err) => {
    if (err) {
      return console.error('Something bad happened', err);
    }

    console.log(`Server is listening on ${port}`);
  });
})()
