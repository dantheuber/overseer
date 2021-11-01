import http from 'http';
import fetch from 'node-fetch';

const makeRequest = async ({ path, method }) => await fetch(`https://${process.env.DASHBOARD_DOMAIN}${path}`, { method });

const onRequest = async (client_req, client_res) => {
  const results = await makeRequest({ path: client_req.url, method: client_req.method });
  client_res.writeHead(results.status, results.headers);
  const text = await results.text();
  client_res.write(text)
  client_res.end();
  console.log(client_req.method, client_req.url, results.status, results.statusText);
};

http.createServer(onRequest).listen(4000);