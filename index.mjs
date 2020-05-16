import http from 'http';
import URL from 'url';

import DB from './db/core/queries.mjs';
import colors from './utils/colors.mjs';

import { models } from './db/resources/index.mjs';

const PORT = process.env.PORT || 1234;

const db = DB.connect(models);

http.createServer(async (req, res) => {

  const url = URL.parse(req.url, true);
  const method = req.method;

  let response = { status: 404, error: "Page not found" };

  let bufferedData = [];

  req.on('data', buffer => {
    bufferedData.push(buffer)
  }).on('end', async () => {
    try {
      const data = JSON.parse(Buffer.concat(bufferedData).toString() || "{}");

      const path = url.pathname.match(/\/([a-z]+)(\/[0-9]+)?(\/[a-zA-Z]+)?/);

      const model = path[1];
      const id = path[2] && path[2].split('/')[1];
      const update = path[3] && path[3].split('/')[1];

      if(update){
        response = await db(model).update()[method][update]({...url.query, id: id}, data);
      }else {
        response = await db(model)[method]({ ...url.query, id: id }, data);
      }

    } catch (error) {
      console.error(error);
      response = { status: 500, error: error.message };
    }

    console.log(`${colors.cyan}%s${colors.reset} %s %s %O`, new Date(), method, url.path, response);

    res.writeHead(response.status, { 'Content-Type': 'application/json' });

    res.write(JSON.stringify(response));

    res.end();
  })
}).listen(PORT, () => {
  console.log(`${colors.bright}server listening at port ${PORT}${colors.reset}`)
});
