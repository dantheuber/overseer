import http from 'http';
import fetch from 'node-fetch';

const makeRequest = async ({ path, ...rest }) => await fetch(`https://${process.env.DASHBOARD_DOMAIN}${path}`, { ...rest });

const onRequest = async (client_req, client_res) => {
  const parseBody = () => new Promise((resolve) => {
    let data = '';
    client_req.on('data', chunk => { data += chunk; });
    client_req.on('end', () => resolve(data));
  });
  let body;
  console.log(client_req);
  if (client_req.method === 'POST' || client_req === 'PUT') {
    body = await parseBody(client_req);
    console.log(body);
  }
  
  const results = await makeRequest({
    path: client_req.url,
    method: client_req.method,
    body,
  });
  client_res.writeHead(results.status, results.headers);
  const text = await results.text();
  client_res.write(text)
  client_res.end();
  console.log(client_req.method, client_req.url, results.status, results.statusText);
  // console.log(results);
};

http.createServer(onRequest).listen(4000);