// Holds value of current game being viewed for use in sending request parameters
let currentGame;

// Send our XHR request for GET requests
const sendAjax = (method, url) => {
	const xhr = new XMLHttpRequest();
	xhr.open(method, url);
	xhr.setRequestHeader('Accept', 'application/json');
	xhr.onload = () => handleResponse(xhr);
	xhr.send();
};

// Send our XHR request for POST requests, send parameters as encoded URL
const sendPost = (url) => {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', url);
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhr.setRequestHeader('Accept', 'application/json');
	xhr.onload = () => handleResponse(xhr);
	
	// Will hold url parameters to be sent
	let data;
	
	// Send proper parameters depending if user is adding review or game
	if(url === '/addGame') {
		let gameParam = encodeURIComponent(gameField.value.trim());
		let linkParam = encodeURIComponent(imageLinkField.value.trim());
		
		data = `game=${gameParam}&imageLink=${linkParam}`;
	}
	
	if(url === '/addReview') {
		let nameParam = encodeURIComponent(nameField.value.trim());
		let scoreParam = encodeURIComponent(scoreField.value.trim());
		let reviewParam = encodeURIComponent(reviewField.value.trim());
		
		data = `name=${nameParam}&score=${scoreParam}&review=${reviewParam}&game=${currentGame}`;
	}
	
	xhr.send(data);
};

// Create the HTML for the game list and append to body
const buildGameListHTML = (obj, element) => {
	content.innerHTML = '';
	
	// For each game in JSON response create a new div with game information and image
	for(let game in obj) {
		const gameDiv = document.createElement('div');
		const gameTitle = document.createElement('h3');
		const gameImage = document.createElement('img');

		gameTitle.textContent = obj[game].title;
		gameImage.src = obj[game].image;
		
		gameDiv.classList.add('game');
		gameDiv.id = encodeURIComponent(game.trim());
		gameDiv.appendChild(gameTitle);
		gameDiv.appendChild(gameImage);
		
		element.appendChild(gameDiv);
		
		// Give click events for each game to allow user to view reviews for each game once clicked
		gameDiv.onclick = (e) => {
			currentGame = e.currentTarget.id;
			sendAjax('GET', '/getReviews?game=' + currentGame);
		};
	}
	
	// Create HTML for form to add a game and tie click event to submit button
	const submitGameDiv = document.createElement('div');
	const submitGameTitle = document.createElement('h3');
	const gameField = document.createElement('input');
	const imageLinkField = document.createElement('input');
	const submitGameButton = document.createElement('input');
	
	submitGameTitle.textContent = 'Add another game!';
	submitGameTitle.id = 'submitGameTitle';
	gameField.type = 'text';
	gameField.placeholder = 'Enter game title';
	gameField.id = 'gameField';
	imageLinkField.type = 'text';
	imageLinkField.placeholder = 'Enter image link';
	imageLinkField.id = 'imageLinkField';
	submitGameButton.type = 'submit';
	submitGameButton.value = 'Submit Game';
	submitGameButton.id = 'submitGameButton';
	
	submitGameDiv.classList.add('game');
	submitGameDiv.id = 'submitGame';
	submitGameDiv.appendChild(submitGameTitle);
	submitGameDiv.appendChild(gameField);
	submitGameDiv.appendChild(imageLinkField);
	submitGameDiv.appendChild(submitGameButton);
	submitGameButton.onclick = () => {
		sendPost('/addGame');
	};
	
	// Append HTML to page
	element.id = 'gameList';
	element.appendChild(submitGameDiv);
};

// Create the HTML for the game page and reviews for specified game and append to body
const buildReviewsHTML = (obj, element) => {
	content.innerHTML = '';
	
	// Will be used to calculate average of all user scores for game
	let totalScore = 0;
	let numScores = 0;
	
	// Create basic layout for page
	const reviewsDiv = document.createElement('div');
	const gameInfoDiv = document.createElement('div');
	const gameTitle = document.createElement('h2');
	const gameImage = document.createElement('img');
	const backButton = document.createElement('input');
	
	gameTitle.textContent = obj.title;
	gameImage.src = obj.image;
	
	// Create back button tie click event that allows user to go back to main game list
	backButton.type = 'submit';
	backButton.value = 'Back to Game List';
	backButton.id = 'backButton';
	backButton.onclick = () => {
		sendAjax('GET', '/getGameList');
	};
	
	gameInfoDiv.id = 'gameInfo';
	gameInfoDiv.appendChild(backButton);
	gameInfoDiv.appendChild(gameTitle);
	gameInfoDiv.appendChild(gameImage);
	
	reviewsDiv.id = 'reviews';
	
	// For each review in JSON response create a new div with review information
	for(let review in obj.reviews) {
		const reviewDiv = document.createElement('div');
		const user = document.createElement('h3');
		const score = document.createElement('h3');
		const reviewText = document.createElement('p');
		
		user.textContent = obj.reviews[review].user;
		score.textContent = obj.reviews[review].score + '/10';
		score.classList.add('score');
		reviewText.textContent = obj.reviews[review].review;
		
		totalScore += Number.parseInt(score.textContent, 10);
		numScores++;
		
		reviewDiv.classList.add('review');
		reviewDiv.appendChild(user);
		reviewDiv.appendChild(score);
		reviewDiv.appendChild(reviewText);
		reviewsDiv.appendChild(reviewDiv);
	}
	
	// Add average user score to game info
	// Rounds to 100th decimal
	// Code obtained from Rodaine here: https://stackoverflow.com/questions/14968615/rounding-to-the-nearest-hundredth-of-a-decimal-in-javascript
	const avgScoreNum = Math.round((totalScore / numScores) * 100) / 100;
	const avgScore = document.createElement('h3');
	avgScore.textContent = "Average Score: " + avgScoreNum;
	gameInfoDiv.appendChild(avgScore);
	
	// Create HTML for form to add a review and tie click event to submit button
	const submitReviewDiv = document.createElement('div');
	const submitReviewTitle = document.createElement('h3');
	const nameField = document.createElement('input');
	const scoreField = document.createElement('input');
	const reviewField = document.createElement('input');
	const submitReviewButton = document.createElement('input');
	
	submitReviewTitle.textContent = 'Submit your own Review!';
	submitReviewTitle.id = 'submitReviewTitle';
	nameField.type = 'text';
	nameField.placeholder = 'Enter your name';
	nameField.id = 'nameField';
	scoreField.type = 'text';
	scoreField.placeholder = 'Enter a score (From 1 to 10)';
	scoreField.id = 'scoreField';
	reviewField.type = 'text';
	reviewField.placeholder = 'Enter your review';
	reviewField.id = 'reviewField';
	submitReviewButton.type = 'submit';
	submitReviewButton.value = 'Submit Review';
	submitReviewButton.id = 'submitReviewButton';

	submitReviewDiv.id = 'submitReview';
	submitReviewDiv.appendChild(submitReviewTitle);
	submitReviewDiv.appendChild(nameField);
	submitReviewDiv.appendChild(scoreField);
	submitReviewDiv.appendChild(reviewField);
	submitReviewDiv.appendChild(submitReviewButton);
	submitReviewButton.onclick = () => {
		sendPost('/addReview');
	};
	
	reviewsDiv.appendChild(submitReviewDiv);
	
	// Append HTML to page
	element.id = 'reviewsPage';
	element.appendChild(gameInfoDiv);
	element.appendChild(reviewsDiv);
};

// Handles XHR response to update necessary data on page
const handleResponse = (xhr) => {
	// Parent element we will add HTML to
	const section = document.createElement('section');
	
	// Holds the JSON object of request
	let obj;
	
	// Check if response is valid JSON before parsing
	if(xhr.response) obj = JSON.parse(xhr.response);
	
	if(xhr.status == 400) {
		if(xhr.responseURL.includes("/addReview")) submitReviewTitle.textContent = obj.message;
		if(xhr.responseURL.includes("/addGame")) submitGameTitle.textContent = obj.message;
	}
	else {
		// Use AJAX to update page data based on response URL
		if(xhr.responseURL.includes("/getGameList")) buildGameListHTML(obj, section);
		else if(xhr.responseURL.includes("/getReviews")) buildReviewsHTML(obj, section);
		else if(xhr.responseURL.includes("/addGame")) sendAjax('GET', '/getGameList');
		else if(xhr.responseURL.includes("/addReview")) sendAjax('GET', '/getReviews?game=' + currentGame);
		
		// Append body with content built with AJAX based on response
		content.appendChild(section);
	}	
};

// Get game list once window loads
const init = () => {
	sendAjax('GET', '/getGameList');
};

window.onload = init;