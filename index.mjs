import http from 'http';
import URL  from 'url';

import db from './db/queries.mjs';
import colors from './utils/colors.mjs';

const PORT = process.env.PORT || 1234;

const query = db.connect();

http.createServer(async (req, res) => {

  const url = URL.parse(req.url, true);
  const method = req.method;

  let response = { status: 404, error: "Page not found" };

  try {
    if (url.pathname === '/users') {
      response = await query('users')[method](url.query.id);
    }
  } catch (error) {
    response.error = error.message;
  }

  console.log(`${colors.cyan}%s${colors.reset} %s %s %O`, new Date(), method, url.path, response);

  res.writeHead(response.status, { 'Content-Type': 'application/json' });

  res.write(JSON.stringify(response));

  res.end();

}).listen(PORT, () => {
  console.log(`${colors.bright}server listening at port ${PORT}${colors.reset}`)
});
