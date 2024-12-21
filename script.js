const apiKey = '6cfcc9ee';

let currentPageMovies = 1; // Текущая страница для фильмов
let currentPageSeries = 1; // Текущая страница для сериалов
let currentTab = ''; // Для отслеживания текущей активной вкладки

// Популярные ключевые слова для поиска случайных фильмов и сериалов
const movieKeywords = ['action', 'comedy', 'drama', 'horror', 'adventure'];
const seriesKeywords = ['game', 'thriller', 'fantasy', 'sci-fi', 'crime'];

// Функция для получения случайного ключевого слова
function getRandomKeyword(keywords) {
    return keywords[Math.floor(Math.random() * keywords.length)];
}

// Функция для получения фильмов через API с пагинацией
async function fetchMovies(searchQuery = '', page = 1, year = '') {
    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${searchQuery || getRandomKeyword(movieKeywords)}&type=movie&page=${page}&y=${year}&apikey=${apiKey}`);
        const data = await response.json();
        if (data.Response === "True") {
            displayMovies(data.Search, year); // Передаем также год для фильтрации
        } else {
            console.error("Movies not found.");
        }
    } catch (error) {
        console.error("Error loading movies:", error);
    }
}

// Функция для получения сериалов через API с пагинацией
async function fetchSeries(searchQuery = '', page = 1, year = '') {
    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${searchQuery || getRandomKeyword(seriesKeywords)}&type=series&page=${page}&y=${year}&apikey=${apiKey}`);
        const data = await response.json();
        if (data.Response === "True") {
            displaySeries(data.Search, year); // Передаем также год для фильтрации
        } else {
            console.error("TV shows not found.");
        }
    } catch (error) {
        console.error("Error loading TV shows:", error);
    }
}

// Функция для отображения фильмов
function displayMovies(movies, year) {
    const movieGrid = document.querySelector('.movie-grid');
    const existingIDs = Array.from(movieGrid.children).map(movie => movie.dataset.id);

    movies.forEach(movie => {
        // Фильтруем по году, если год установлен
        if ((year === '' || movie.Year === year) && !existingIDs.includes(movie.imdbID)) {
            // Загружаем детальную информацию о фильме
            fetchDetails(movie.imdbID, 'movie').then(details => {
                const genre = details.Genre || 'No Genre';  // Получаем жанр из детальной информации
                const movieElement = document.createElement('article');
                movieElement.dataset.id = movie.imdbID; // Сохраняем уникальный идентификатор
                movieElement.innerHTML = `
                    <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'images/default.jpg'}" alt="${movie.Title}">
                    <h3>${movie.Title}</h3>
                    <p class="year">Year: ${movie.Year}</p>
                    <p class="genre">${genre}</p>
                `;
                movieElement.addEventListener('click', () => fetchDetails(movie.imdbID, 'movie')); // Обработчик клика
                movieGrid.appendChild(movieElement);
            });
        }
    });
}

// Функция для отображения сериалов
function displaySeries(series, year) {
    const seriesGrid = document.querySelector('.series-grid');
    const existingIDs = Array.from(seriesGrid.children).map(serie => serie.dataset.id);

    series.forEach(serie => {
        // Фильтруем по году, если год установлен
        if ((year === '' || serie.Year === year) && !existingIDs.includes(serie.imdbID)) {
            // Загружаем детальную информацию о сериале
            fetchDetails(serie.imdbID, 'series').then(details => {
                const genre = details.Genre || 'No Genre';  // Получаем жанр из детальной информации
                const seriesElement = document.createElement('article');
                seriesElement.dataset.id = serie.imdbID; // Сохраняем уникальный идентификатор
                seriesElement.innerHTML = `
                    <img src="${serie.Poster !== 'N/A' ? serie.Poster : 'images/default.jpg'}" alt="${serie.Title}">
                    <h3>${serie.Title}</h3>
                    <p class="year">Year: ${serie.Year}</p>
                    <p class="genre">${genre}</p>
                `;
                seriesElement.addEventListener('click', () => fetchDetails(serie.imdbID, 'series')); // Обработчик клика
                seriesGrid.appendChild(seriesElement);
            });
        }
    });
}


// Применение фильтров для фильмов
function applyMovieFilters() {
    const genre = document.getElementById('genre-filter').value.toLowerCase();
    const year = document.getElementById('year-filter').value.trim();

    // Сбрасываем текущий контент и загружаем заново с учетом фильтров
    resetContent('films');
    fetchMovies('', currentPageMovies, year); // Передаем только жанр и год в запрос
}

// Применение фильтров для сериалов
function applySeriesFilters() {
    const genre = document.getElementById('series-genre-filter').value.toLowerCase();
    const year = document.getElementById('series-year-filter').value.trim();

    // Сбрасываем текущий контент и загружаем заново с учетом фильтров
    resetContent('series');
    fetchSeries('', currentPageSeries, year); // Передаем только жанр и год в запрос
}

// Функция для сброса содержимого (очистка контейнера)
function resetContent(tab) {
    if (tab === 'films') {
        document.querySelector('.movie-grid').innerHTML = ''; // Очищаем контейнер фильмов
        currentPageMovies = 1; // Сбрасываем текущую страницу для фильмов
    } else if (tab === 'series') {
        document.querySelector('.series-grid').innerHTML = ''; // Очищаем контейнер сериалов
        currentPageSeries = 1; // Сбрасываем текущую страницу для сериалов
    }
}

// Функция для переключения вкладок
function showTab(tabId) {
    // Убираем класс active со всех вкладок
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('nav ul li a').forEach(link => link.classList.remove('active'));

    // Добавляем класс active к выбранной вкладке
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`nav ul li a[onclick="showTab('${tabId}')"]`).classList.add('active');

    // Сохраняем текущую вкладку в localStorage
    localStorage.setItem('currentTab', tabId);
    currentTab = tabId;

    // Загружаем контент в зависимости от вкладки
    if (tabId === 'films') {
        resetContent('films');
        fetchMovies('', currentPageMovies); // Загружаем первую страницу фильмов
    }
    if (tabId === 'series') {
        resetContent('series');
        fetchSeries('', currentPageSeries); // Загружаем первую страницу сериалов
    }
}

// Функция для поиска фильмов
function searchMovies() {
    const searchQuery = document.getElementById('film-search').value.trim();
    const year = document.getElementById('year-filter').value.trim(); // Получаем введённый год

    resetContent('films'); // Сбрасываем текущий контент

    // Загружаем фильмы с учетом года, если он введён
    fetchMovies(searchQuery, 1, year); // Передаем год в запрос
}

// Функция для поиска сериалов
function searchSeries() {
    const searchQuery = document.getElementById('series-search').value.trim();
    const year = document.getElementById('series-year-filter').value.trim(); // Получаем введённый год

    resetContent('series'); // Сбрасываем текущий контент

    // Загружаем сериалы с учетом года, если он введён
    fetchSeries(searchQuery, 1, year); // Передаем год в запрос
}

// Функции для управления профилем
function editProfile() {
    openModal('Profile Editing', 'Profile editing feature is under development.');
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('profile-info').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('profile-info').style.display = 'none';
}

function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (username && password) {
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        alert('Registration successful!');
        showLoginForm();
    } else {
        alert('Please fill in all fields.');
    }
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const storedUsername = localStorage.getItem('username');
    const storedPassword = localStorage.getItem('password');

    if (username === storedUsername && password === storedPassword) {
        alert('Вход успешен!');
        localStorage.setItem('currentUser', username);
        showProfile(username);
    } else {
        alert('Incorrect username or password.');
    }
}

function showProfile(username) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('profile-info').style.display = 'block';
    document.getElementById('profile-username').textContent = username;
}

function logout() {
    localStorage.removeItem('currentUser');
    showLoginForm();
}

// Модальное окно
function openModal(title, description) {
    const modal = document.getElementById('modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-description').textContent = description;
    modal.style.display = 'flex';

    document.querySelector('.close-button').onclick = () => modal.style.display = 'none';
    window.onclick = event => { if (event.target === modal) modal.style.display = 'none'; };
}

// Ловим прокрутку и загружаем следующую страницу, если прокручено до конца
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        if (currentTab === 'films') {
            currentPageMovies++;
            fetchMovies('', currentPageMovies); // Загружаем следующую страницу фильмов
        } else if (currentTab === 'series') {
            currentPageSeries++;
            fetchSeries('', currentPageSeries); // Загружаем следующую страницу сериалов
        }
    }
});

// Запуск главной вкладки или сохраненной вкладки при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        showProfile(currentUser);
    } else {
        showLoginForm();
    }
});

// Функция для получения подробной информации о фильме или сериале
async function fetchDetails(imdbID, type) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&type=${type}&apikey=${apiKey}`);
        const data = await response.json();
        if (data.Response === "True") {
            return data;  // Возвращаем полные данные фильма или сериала
        } else {
            console.error("Details not found.");
        }
    } catch (error) {
        console.error("Error fetching details:", error);
    }
}


function displayDetails(details) {
    // Создаем новое окно с информацией
    const detailWindow = window.open("", "_blank");
    detailWindow.document.write(`
        <html>
        <head>
            <title>${details.Title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #141414; color: #f4f4f4; }
                img { max-width: 100%; border-radius: 10px; margin-bottom: 20px; }
                .content { max-width: 800px; margin: auto; text-align: center; }
                h1 { color: #ff5733; }
            </style>
        </head>
        <body>
            <div class="content">
                <h1>${details.Title}</h1>
                <img src="${details.Poster !== "N/A" ? details.Poster : "images/default.jpg"}" alt="${details.Title}">
                <p><strong>Genre:</strong> ${details.Genre}</p>
                <p><strong>Director:</strong> ${details.Director}</p>
                <p><strong>Actors:</strong> ${details.Actors}</p>
                <p><strong>Plot:</strong> ${details.Plot}</p>
                <p><strong>Rating:</strong> ${details.imdbRating}/10</p>
                <p><strong>Released:</strong> ${details.Released}</p>
            </div>
        </body>
        </html>
    `);
}
