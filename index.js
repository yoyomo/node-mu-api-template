const http = require('http');
const { Client } = require('pg');
const client = new Client();


const PORT = process.env.PORT || 3000;

http.createServer( (req, res) => {

  res.writeHead(200, {'Content-Type': 'application/json'});

  const url = req.url;

  if(url === '/about'){
    res.write(JSON.stringify({title: 'about us page!!!'}));
  } else if (url === '/pg') {
    await client.connect();
    const response = await client.query('SELECT $1::text as message', ['Hellow world!'])
    res.write(response.rows[0].message);
    await client.end()
  }

  res.end();

}).listen(PORT, () => {
  console.log(`server start at port ${PORT}`)
});
