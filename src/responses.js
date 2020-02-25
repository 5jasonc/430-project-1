const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const style = fs.readFileSync(`${__dirname}/../client/style.css`);
const main = fs.readFileSync(`${__dirname}/../client/main.js`);

const rawDefaultGameReviewData = fs.readFileSync(`${__dirname}/defaultReviewData.json`);
const gameReviewData = JSON.parse(rawDefaultGameReviewData);

const respond = (request, response, statusCode, content, contentType) => {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.write(content);
  response.end();
};

const respondMeta = (request, response, statusCode, contentType) => {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end();
};

const getIndex = (request, response) => {
  respond(request, response, 200, index, 'text/html');
};

const getStyle = (request, response) => {
  respond(request, response, 200, style, 'text/css');
};

const getMain = (request, response) => {
  respond(request, response, 200, main, 'application/javascript');
};

const getNotReal = (request, response) => {
  const jsonResponse = {
    id: 'notFound',
    message: 'The page you are looking for was not found',
  };

  if (request.method === 'GET') return respond(request, response, 404, JSON.stringify(jsonResponse), 'application/json');
  return respondMeta(request, response, 404, 'application/json');
};

const getGameList = (request, response) => {
  if (request.method === 'GET') return respond(request, response, 200, JSON.stringify(gameReviewData), 'application/json');
  return respondMeta(request, response, 200, 'application/json');
};

const getReviews = (request, response, params) => {
  if (request.method === 'GET') return respond(request, response, 200, JSON.stringify(gameReviewData[params.game]), 'application/json');
  return respondMeta(request, response, 200, 'application/json');
};

const addReview = (request, response, params) => {
  const responseJSON = {
    message: 'Name, score, and a review are all required',
  };

  if (!params.name || !params.score || !params.review) return respond(request, response, 400, JSON.stringify(responseJSON), 'application/json');

  if (!/^\d+$/.test(params.score)
|| Number.parseInt(params.score, 10) < 1
|| Number.parseInt(params.score, 10) > 10) {
    responseJSON.message = 'The score must be a valid number between 1 and 10';
    return respond(request, response, 400, JSON.stringify(responseJSON), 'application/json');
  }

  let responseCode = 201;

  if (gameReviewData[params.game].reviews[params.name]) {
    responseCode = 204;
  } else {
    gameReviewData[params.game].reviews[params.name] = {};
  }

  gameReviewData[params.game].reviews[params.name].user = params.name;
  gameReviewData[params.game].reviews[params.name].score = params.score;
  gameReviewData[params.game].reviews[params.name].review = params.review;

  if (responseCode === 201) {
    responseJSON.message = 'Review created successfully';
    return respond(request, response, responseCode, JSON.stringify(responseJSON), 'application/json');
  }

  return respondMeta(request, response, responseCode, 'application/json');
};

const addGame = (request, response, params) => {
  const responseJSON = {
    message: 'Game title and a link to an image are both required',
  };

  if (!params.game || !params.imageLink) return respond(request, response, 400, JSON.stringify(responseJSON), 'application/json');

  let responseCode = 201;

  if (gameReviewData[params.game]) {
    responseCode = 204;
  } else {
    gameReviewData[params.game] = {};
    gameReviewData[params.game].reviews = {};
  }

  gameReviewData[params.game].title = params.game;
  gameReviewData[params.game].image = params.imageLink;

  if (responseCode === 201) {
    responseJSON.message = 'Game page created successfully';
    return respond(request, response, responseCode, JSON.stringify(responseJSON), 'application/json');
  }

  return respondMeta(request, response, responseCode, 'application/json');
};

module.exports = {
  getIndex,
  getStyle,
  getMain,
  getGameList,
  getReviews,
  addReview,
  addGame,
  getNotReal,
};
