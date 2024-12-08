const tmdbApiKey = "cf811f120299a8eb4e63c3c3a39037ad";
const tmdbBaseURL = "https://api.themoviedb.org/3/movie/";
const playerBaseURL = "https://embed.warezcdn.link/filme/";

// Obter ID do filme da URL
function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
}

// Buscar detalhes do filme no TMDB
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${tmdbBaseURL}${movieId}?api_key=${tmdbApiKey}&language=pt-BR`);
        return await response.json();
    } catch (error) {
        console.error("Erro ao carregar os detalhes do filme:", error);
        return null;
    }
}

// Configurar o background do filme
function setMovieBackground(backdropPath) {
    const movieBackground = document.getElementById("movieBackground");
    if (backdropPath) {
        movieBackground.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${backdropPath})`;
    } else {
        movieBackground.style.backgroundColor = "#121212"; // Cor padrão
    }
}

// Configurar o player
function setPlayer(movieId) {
    const iframe = document.getElementById("videoIframe");
    if (iframe) {
        iframe.src = `${playerBaseURL}${movieId}`;
        iframe.style.display = "block";
    } else {
        console.error("Player não encontrado!");
    }
}

// Renderizar informações do filme e configurar elementos dinâmicos
async function renderMovieDetails() {
    const movieId = getMovieIdFromUrl();
    if (!movieId) {
        alert("Filme não encontrado!");
        return;
    }

    const movieDetails = await fetchMovieDetails(movieId);
    if (!movieDetails) {
        alert("Erro ao carregar os detalhes do filme.");
        return;
    }

    // Preencher informações na página
    document.getElementById("movieTitle").textContent = movieDetails.title || movieDetails.original_title;
    document.getElementById("movieDescription").textContent = movieDetails.overview || "Descrição não disponível.";
    document.getElementById("movieGenres").textContent = movieDetails.genres.map(genre => genre.name).join(", ") || "Gênero não disponível";
    document.getElementById("movieDuration").textContent = `${movieDetails.runtime || "N/A"} minutos`;
    document.getElementById("movieReleaseDate").textContent = movieDetails.release_date || "Data não disponível.";

    // Configurar o background e o player
    setMovieBackground(movieDetails.backdrop_path);
    setPlayer(movieId);
}

// Inicializar a página
renderMovieDetails();
