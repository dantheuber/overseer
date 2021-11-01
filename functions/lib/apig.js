const unprocessableResponse = (msg) => ({
  statusCode: 422,
  body: JSON.stringify(msg),
});

const jsonResponse = msg => ({
  statusCode: 200,
  body: JSON.stringify(msg),
});

module.exports = {
  unprocessableResponse,
  jsonResponse,
};