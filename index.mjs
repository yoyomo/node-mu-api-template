import http from 'http';
import db from './db/queries.mjs';
import colors from './utils/colors.mjs';

const PORT = process.env.PORT || 1234;

db.connect();

http.createServer(async (req, res) => {

  const url = req.url;
  const method = req.method;

  let response = { status: 404, error: "Page not found" };

  try {
    if (url === '/users') {
      response = await db[method]('users');
    }
  } catch (error) {
    response.error = error;
  }

  console.log(`${colors.cyan}%s${colors.reset} %s %s %O`, new Date(), method, url, response);

  res.writeHead(response.status, { 'Content-Type': 'application/json' });

  res.write(JSON.stringify(response));

  res.end();

}).listen(PORT, () => {
  console.log(`${colors.bright}server listening at port ${PORT}${colors.reset}`)
});
