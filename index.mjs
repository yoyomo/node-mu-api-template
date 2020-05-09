import http from 'http';
import db from './queries.mjs';
import colors from './colors.mjs';

const PORT = process.env.PORT || 3000;

http.createServer( async (req, res) => {

  const url = req.url;
  const method = req.method;

  let response = {status: 404, error: "Page not found"};

  try {
      if (url === '/users') {
        response = await db[method]('users');
      }
  } catch(error) {
    response.error = error;
  }

  console.log(`${colors.cyan}%s${colors.reset} %s %s %O`, new Date(), method, url, response);

  res.writeHead(response.status, {'Content-Type': 'application/json'});

  res.write(JSON.stringify(response));

  res.end();

}).listen(PORT, () => {
  console.log(`${colors.bright}server listening at port ${PORT}${colors.reset}`)
});
