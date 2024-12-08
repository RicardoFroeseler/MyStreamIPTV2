const jsonUrl = "filmesdetalhes.json"; // Caminho do JSON detalhado
const tmdbApiKey = "cf811f120299a8eb4e63c3c3a39037ad"; // Sua chave API TMDB
const tmdbBaseURL = "https://api.themoviedb.org/3/movie/";
const moviesPerPage = 30;
const paginationLimit = 5; // Máximo de botões visíveis na paginação
let allMovies = [];
let filteredMovies = [];
let currentPage = 1;
let genres = [];

// Carregar filmes do JSON
async function loadMovies() {
    try {
        const response = await fetch(jsonUrl);
        allMovies = await response.json();
        filteredMovies = [...allMovies];
        extractGenres();
        renderGenres();
        renderMovieList();
        renderPagination();
    } catch (error) {
        console.error("Erro ao carregar filmes:", error);
    }
}

// Mapear categorias pelo nome
function extractGenres() {
    const genreMap = {
        28: "Ação",
        12: "Aventura",
        16: "Animação",
        35: "Comédia",
        80: "Crime",
        99: "Documentário",
        18: "Drama",
        10751: "Família",
        14: "Fantasia",
        36: "História",
        27: "Terror",
        10402: "Música",
        9648: "Mistério",
        10749: "Romance",
        878: "Ficção Científica",
        10770: "Cinema TV",
        53: "Thriller",
        10752: "Guerra",
        37: "Faroeste"
    };

    genres = [...new Set(allMovies.flatMap(movie => movie.categorias))]
        .map(id => ({ id, name: genreMap[id] || "Desconhecido" }));
}

// Renderizar gêneros como tags
function renderGenres() {
    const genreContainer = document.getElementById("genre-container");
    genreContainer.innerHTML = '<button onclick="filterByGenre()">Todos</button>';
    
    genres.forEach(genre => {
        const button = document.createElement("button");
        button.textContent = genre.name;
        button.onclick = () => filterByGenre(genre.id);
        genreContainer.appendChild(button);
    });
}

// Filtrar filmes por gênero
function filterByGenre(genreId) {
    filteredMovies = genreId
        ? allMovies.filter(movie => movie.categorias.includes(genreId))
        : [...allMovies];
    currentPage = 1;
    renderMovieList();
    renderPagination();
}

// Buscar detalhes do filme na API TMDB
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${tmdbBaseURL}${movieId}?api_key=${tmdbApiKey}&language=pt-BR`);
        return await response.json();
    } catch (error) {
        console.error(`Erro ao buscar detalhes do filme ${movieId}:`, error);
        return null;
    }
}

// Renderizar lista de filmes
async function renderMovieList() {
    const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = "";

    const start = (currentPage - 1) * moviesPerPage;
    const end = start + moviesPerPage;
    const moviesToRender = filteredMovies.slice(start, end);

    for (const movie of moviesToRender) {
        const movieDetails = await fetchMovieDetails(movie.id);
        if (!movieDetails) continue;

        const card = document.createElement("div");
        card.className = "movie-card";

        card.innerHTML = `
            <img 
                src="https://image.tmdb.org/t/p/w500${movieDetails.poster_path}" 
                alt="${movieDetails.title}" 
                loading="lazy"
                class="movie-card-image"
            >
            <h5>${movieDetails.title || movieDetails.original_title}</h5>
        `;
        
        // Adicionar evento de clique para redirecionar
        card.onclick = () => {
            window.location.href = `details.html?id=${movie.id}`;
        };

        cardContainer.appendChild(card);
    }
}


// Renderizar paginação com limite de botões visíveis
function renderPagination() {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
    const startPage = Math.max(1, currentPage - Math.floor(paginationLimit / 2));
    const endPage = Math.min(totalPages, startPage + paginationLimit - 1);

    if (startPage > 1) {
        const prevButton = document.createElement("button");
        prevButton.textContent = "<<";
        prevButton.onclick = () => {
            currentPage = 1;
            renderMovieList();
            renderPagination();
        };
        pagination.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.className = i === currentPage ? "active" : "";
        button.onclick = () => {
            currentPage = i;
            renderMovieList();
            renderPagination();
        };
        pagination.appendChild(button);
    }

    if (endPage < totalPages) {
        const nextButton = document.createElement("button");
        nextButton.textContent = ">>";
        nextButton.onclick = () => {
            currentPage = totalPages;
            renderMovieList();
            renderPagination();
        };
        pagination.appendChild(nextButton);
    }
}

// Buscar filmes por título ou nome
function searchMovies(event) {
    event.preventDefault();
    const searchInput = document.getElementById("search-input").value.toLowerCase();
    filteredMovies = allMovies.filter(movie =>
        (movie.nome && movie.nome.toLowerCase().includes(searchInput)) ||
        (movie.titulo && movie.titulo.toLowerCase().includes(searchInput))
    );
    currentPage = 1;
    renderMovieList();
    renderPagination();
}

// Inicializar o sistema
document.getElementById("search-form").addEventListener("submit", searchMovies);
loadMovies();
