const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const style = fs.readFileSync(`${__dirname}/../client/style.css`);
const main = fs.readFileSync(`${__dirname}/../client/main.js`);

// Default image for 404 image responses
// Image obtained here: https://media.wired.com/photos/5a0201b14834c514857a7ed7/master/pass/1217-WI-APHIST-01.jpg
const noImageFound = fs.readFileSync(`${__dirname}/../client/imageNotFound.jpg`);

// Loads our JSON data that holds all games and user reviews
const rawDefaultGameReviewData = fs.readFileSync(`${__dirname}/defaultReviewData.json`);
const gameReviewData = JSON.parse(rawDefaultGameReviewData);

// JSON message when accept header is not JSON for endpoint that only responds with JSON
const invalidRequest = {
  message: 'Error in request, current endpoint only accepts JSON requests',
};

// Responds with specified content for GET request
const respond = (request, response, statusCode, content, contentType) => {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.write(content);
  response.end();
};

// Responds with meta data for HEAD request
const respondMeta = (request, response, statusCode, contentType) => {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end();
};

// Serves up main index page
const getIndex = (request, response) => {
  respond(request, response, 200, index, 'text/html');
};

// Serves up style sheet
const getStyle = (request, response) => {
  respond(request, response, 200, style, 'text/css');
};

// Serves up JS file for index page
const getMain = (request, response) => {
  respond(request, response, 200, main, 'application/javascript');
};

// Sends response when the specified URL could not be found
const getNotReal = (request, response) => {
  const jsonResponse = {
    id: 'notFound',
    message: 'The page you are looking for was not found',
  };

  // Check if request is for an image, then serve a default not found image instead of 404
  if (request.headers.accept.includes('image/*')) return respond(request, response, 200, noImageFound, 'image/jpeg');

  if (request.method === 'GET') return respond(request, response, 404, JSON.stringify(jsonResponse), 'application/json');
  return respondMeta(request, response, 404, 'application/json');
};

// Responds with all games in our JSON data or just meta data
const getGameList = (request, response) => {
// Check if client is asking for JSON, if not specifically asking for JSON give 404
  if (!request.headers.accept.includes('application/json') && request.headers.length === 1) {
    return respond(request, response, 404, JSON.stringify(invalidRequest), 'application/json');
  }

  if (request.method === 'GET') return respond(request, response, 200, JSON.stringify(gameReviewData), 'application/json');
  return respondMeta(request, response, 200, 'application/json');
};

// Response with all reviews for specified game in JSON data or just meta data
const getReviews = (request, response, params) => {
// Check if client is asking for JSON, if not specifically asking for JSON give 404
  if (!request.headers.accept.includes('application/json') && request.headers.length === 1) {
    return respond(request, response, 404, JSON.stringify(invalidRequest), 'application/json');
  }

  const errorMessage = {
    message: 'A game parameter is required with the id of a valid game',
  };

  // If no game parameter is passed to tell which reviews to get respond with bad request
  if (!params.game || !gameReviewData[params.game]) return respond(request, response, 400, JSON.stringify(errorMessage), 'application/json');

  if (request.method === 'GET') return respond(request, response, 200, JSON.stringify(gameReviewData[params.game]), 'application/json');
  return respondMeta(request, response, 200, 'application/json');
};

// Takes parameters and adds a review for specified game
const addReview = (request, response, params) => {
// Check if client is asking for JSON, if not specifically asking for JSON give 404
  if (!request.headers.accept.includes('application/json') && request.headers.length === 1) {
    return respond(request, response, 404, JSON.stringify(invalidRequest), 'application/json');
  }

  const responseJSON = {
    message: 'Name, score, and a review are all required',
  };

  // If valid game parameter isnt passed give error
  if (!params.game || !gameReviewData[params.game]) {
    responseJSON.message = 'Missing valid game parameter';
    return respond(request, response, 400, JSON.stringify(responseJSON), 'application/json');
  }

  // If not all parameters given respond with bad request
  if (!params.name || !params.score || !params.review) return respond(request, response, 400, JSON.stringify(responseJSON), 'application/json');

  // If the score is not a number between 1 and 10, respond with bad request
  // Method to check if score is only numbers taken from Scott Evernden here: https://stackoverflow.com/questions/1779013/check-if-string-contains-only-digits
  if (!/^\d+$/.test(params.score)
|| Number.parseInt(params.score, 10) < 1
|| Number.parseInt(params.score, 10) > 10) {
    responseJSON.message = 'The score must be a valid number between 1 and 10';
    return respond(request, response, 400, JSON.stringify(responseJSON), 'application/json');
  }

  let responseCode = 201;

  // If user already has a review for that game, update their review and score
  if (gameReviewData[params.game].reviews[params.name]) {
    responseCode = 204;
  } else {
    gameReviewData[params.game].reviews[params.name] = {};
  }

  gameReviewData[params.game].reviews[params.name].user = params.name;
  gameReviewData[params.game].reviews[params.name].score = params.score;
  gameReviewData[params.game].reviews[params.name].review = params.review;

  // If new review respond with successful creation of content
  if (responseCode === 201) {
    responseJSON.message = 'Review created successfully';
    return respond(request, response, responseCode, JSON.stringify(responseJSON), 'application/json');
  }

  // If no new review created respond with content updated
  return respondMeta(request, response, responseCode, 'application/json');
};

// Take parameters and add a new game to the master list
const addGame = (request, response, params) => {
// Check if client is asking for JSON, if not specifically asking for JSON give 404
  if (!request.headers.accept.includes('application/json') && request.headers.length === 1) {
    return respond(request, response, 404, JSON.stringify(invalidRequest), 'application/json');
  }

  const responseJSON = {
    message: 'Game title and a link to an image are both required',
  };

  // If not all parameters given respond with bad request
  if (!params.game || !params.imageLink) return respond(request, response, 400, JSON.stringify(responseJSON), 'application/json');

  let responseCode = 201;

  // If game already exists, update game image
  if (gameReviewData[params.game]) {
    responseCode = 204;
  } else {
    gameReviewData[params.game] = {};
    gameReviewData[params.game].reviews = {};
  }

  gameReviewData[params.game].title = params.game;
  gameReviewData[params.game].image = params.imageLink;

  // If new game respond with successful creation of content
  if (responseCode === 201) {
    responseJSON.message = 'Game page created successfully';
    return respond(request, response, responseCode, JSON.stringify(responseJSON), 'application/json');
  }

  // If no new game added respond with content updated
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
