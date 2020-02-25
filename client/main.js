let currentGame;

const sendAjax = (method, url) => {
	const xhr = new XMLHttpRequest();
	xhr.open(method, url);
	xhr.setRequestHeader('Accept', 'application/json');
	xhr.onload = () => handleResponse(xhr);
	xhr.send();
};

const sendPost = (url) => {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', url);
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhr.setRequestHeader('Accept', 'application/json');
	xhr.onload = () => handleResponse(xhr);
	
	let data;
	
	if(url === '/addGame') data = `game=${gameField.value}&imageLink=${imageLinkField.value}`;
	
	if(url === '/addReview') data = `name=${nameField.value}&score=${scoreField.value}&review=${reviewField.value}&game=${currentGame}`;
	
	xhr.send(data);
};

const buildGameListHTML = (obj, element) => {
	content.innerHTML = '';
	
	for(let game in obj) {
		const gameDiv = document.createElement('div');
		const gameTitle = document.createElement('h3');
		const gameImage = document.createElement('img');

		gameTitle.textContent = obj[game].title;
		gameImage.src = obj[game].image;
		
		gameDiv.classList.add('game');
		gameDiv.id = game;
		gameDiv.appendChild(gameTitle);
		gameDiv.appendChild(gameImage);
		
		element.appendChild(gameDiv);
		
		gameDiv.onclick = (e) => {
			currentGame = e.currentTarget.id;
			sendAjax('GET', '/getReviews?game=' + currentGame);
		};
	}
	
	const submitGameDiv = document.createElement('div');
	const submitGameTitle = document.createElement('h3');
	const gameField = document.createElement('input');
	const imageLinkField = document.createElement('input');
	const submitGameButton = document.createElement('input');
	
	submitGameTitle.textContent = 'Add another game!';
	gameField.type = 'text';
	gameField.placeholder = 'Enter the title of the game';
	gameField.id = 'gameField';
	imageLinkField.type = 'text';
	imageLinkField.placeholder = 'Enter a link to an image of the game';
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
	
	element.id = 'gameList';
	element.appendChild(submitGameDiv);
};

const buildReviewsHTML = (obj, element) => {
	content.innerHTML = '';
	
	const reviewsDiv = document.createElement('div');
	const gameInfoDiv = document.createElement('div');
	const gameTitle = document.createElement('h2');
	const gameImage = document.createElement('img');
	
	gameTitle.textContent = obj.title;
	gameImage.src = obj.image;
	
	gameInfoDiv.id = 'gameInfo';
	gameInfoDiv.appendChild(gameTitle);
	gameInfoDiv.appendChild(gameImage);
	
	reviewsDiv.id = 'reviews';
	
	for(let review in obj.reviews) {
		const reviewDiv = document.createElement('div');
		const user = document.createElement('h3');
		const score = document.createElement('h3');
		const reviewText = document.createElement('p');
		
		user.textContent = obj.reviews[review].user;
		score.textContent = obj.reviews[review].score + '/10';
		score.classList.add('score');
		reviewText.textContent = obj.reviews[review].review;
		
		reviewDiv.classList.add('review');
		reviewDiv.appendChild(user);
		reviewDiv.appendChild(score);
		reviewDiv.appendChild(reviewText);
		reviewsDiv.appendChild(reviewDiv);
	}
	
	const submitReviewDiv = document.createElement('div');
	const submitReviewTitle = document.createElement('h3');
	const nameField = document.createElement('input');
	const scoreField = document.createElement('input');
	const reviewField = document.createElement('input');
	const submitReviewButton = document.createElement('input');
	
	submitReviewTitle.textContent = 'Submit your own Review!';
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
	
	element.id = 'reviewsPage';
	element.appendChild(gameInfoDiv);
	element.appendChild(reviewsDiv);
};

const handleResponse = (xhr) => {
	const section = document.createElement('section');
	
	try {
		const obj = JSON.parse(xhr.response);
		
		if(xhr.responseURL.includes("/getGameList")) buildGameListHTML(obj, section);
		else if(xhr.responseURL.includes("/getReviews")) buildReviewsHTML(obj, section);
	} catch(e) {}
	
	switch(xhr.status) {
		case 200:
			break;
		case 201:
			break;
		case 204:
			break;
		case 400:
			break;
		case 404:
			break;
		default:
			break;
	}
	
	content.appendChild(section);
};

const init = () => {
	sendAjax('GET', '/getGameList');
};

window.onload = init;