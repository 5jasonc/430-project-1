const http = require('http');
const url = require('url');
const query = require('querystring');
const responseHandler = require('./responses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': responseHandler.getIndex,
  '/style.css': responseHandler.getStyle,
  '/main.js': responseHandler.getMain,
  '/getGameList': responseHandler.getGameList,
  '/getReviews': responseHandler.getReviews,
  '/addReview': responseHandler.addReview,
  '/addGame': responseHandler.addGame,
  getNotReal: responseHandler.getNotReal,
};

const handlePost = (request, response, parsedURL) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    if (urlStruct[parsedURL.pathname]) {
      urlStruct[parsedURL.pathname](request, response, bodyParams);
    } else {
      urlStruct.getNotReal(request, response);
    }
  });
};

const handleGet = (request, response, parsedURL) => {
  const params = query.parse(parsedURL.query);

  if (urlStruct[parsedURL.pathname]) {
    urlStruct[parsedURL.pathname](request, response, params);
  } else {
    urlStruct.getNotReal(request, response);
  }
};

const onRequest = (request, response) => {
  const parsedURL = url.parse(request.url);

  if (request.method === 'POST') {
    handlePost(request, response, parsedURL);
  } else {
    handleGet(request, response, parsedURL);
  }
};

http.createServer(onRequest).listen(port);
console.log(`Listening on 127.0.0.1:${port}`);
