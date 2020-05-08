const http = require('http');
const db = require('./queries')

const PORT = process.env.PORT || 3000;

http.createServer( async (req, res) => {

  const url = req.url;
  const method = req.method;

  console.log('START: ',method,url);

  let response = {status: 404, error: "Page not found"};

  try {
    if(method === 'GET'){
      if(url === '/about'){
        response = {title: 'about us page!!!'};
      } else if (url === '/users') {
        response = await db.getUsers(req,res);
      }
    }
  } catch(error) {
    response.error = error;
  }

  console.log('FINISH: ', method, url, response);

  res.writeHead(response.status, {'Content-Type': 'application/json'});

  res.write(JSON.stringify(response));

  res.end();

}).listen(PORT, () => {
  console.log(`server start at port ${PORT}`)
});
