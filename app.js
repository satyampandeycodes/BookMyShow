/**
 * MovieVerse Frontend Application (Inspired by BookMyShow)
 * Connects directly to Spring Boot backend (/api/v1)
 * Enhanced with permanent fallback content so data NEVER disappears.
 */

// ======================================================
// CONFIGURATION & DYNAMIC API BASE
// ======================================================

// Connects to live Render backend in production (e.g., on Vercel), or localhost during development
const isLocalEnvironment = 
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0" ||
    !window.location.hostname ||
    window.location.protocol === "file:";

const API_BASE = isLocalEnvironment
    ? "http://localhost:8080/api/v1"
    : "https://bookmyshowbe-2fqf.onrender.com/api/v1";

console.log("MovieVerse API Endpoint:", API_BASE, "(Local:", isLocalEnvironment, ")");

// ======================================================
// PERMANENT FALLBACK MOVIES & THEATRES (Zero-Downtime Guarantee)
// ======================================================

const FALLBACK_MOVIES = [
    {
        id: 6,
        title: "Jailer 2",
        language: "Tamil, Hindi",
        genre: "Action / Crime / Thriller",
        certificate: "U/A",
        durationMinutes: 172,
        posterUrl: "images/jailer2_poster.jpg",
        description: "Superstar Rajinikanth returns as Tiger Muthuvel Pandian in this explosive blockbuster sequel, unleashing an unstoppable war against an international syndicate."
    },
    {
        id: 2,
        title: "Pushpa 2: The Rule",
        language: "Telugu, Hindi",
        genre: "Action / Thriller / Drama",
        certificate: "A",
        durationMinutes: 200,
        posterUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900",
        description: "Pushpa Raj expands his red sandalwood empire across borders while locked in an all-out war with SP Bhanwar Singh Shekhawat."
    },
    {
        id: 5,
        title: "Stree 2",
        language: "Hindi",
        genre: "Comedy / Horror",
        certificate: "U/A",
        durationMinutes: 147,
        posterUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=900",
        description: "The town of Chanderi is gripped by terror as a headless demon known as Sarkata starts abducting modern independent women."
    },
    {
        id: 3,
        title: "Singham Again",
        language: "Hindi",
        genre: "Action / Thriller",
        certificate: "U/A",
        durationMinutes: 160,
        posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900",
        description: "DCP Bajirao Singham leads the high-stakes cross-border mission with the cop universe to save his family and defeat a terror cell."
    },
    {
        id: 1,
        title: "Kalki 2898 AD",
        language: "Hindi",
        genre: "Sci-Fi / Action",
        certificate: "U/A",
        durationMinutes: 181,
        posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=900",
        description: "In a dystopian post-apocalyptic future, immortal warriors clash to protect the divine child destined to defeat the supreme ruler."
    },
    {
        id: 4,
        title: "Devara: Part 1",
        language: "Telugu, Hindi",
        genre: "Action / Drama",
        certificate: "U/A",
        durationMinutes: 178,
        posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900",
        description: "A fearless warrior from the coastal lands rises to safeguard his people from deceit, greed and ruthless sea pirates."
    }
];

const CITY_THEATRES = {
    "Nashik": { id: 4, name: "PVR: City Mall", address: "City Centre Mall, Lawate Nagar, Nashik", city: "Nashik" },
    "Bengaluru": { id: 3, name: "INOX: Megaplex", address: "Phoenix Marketcity, Whitefield, Bengaluru", city: "Bengaluru" },
    "Mumbai": { id: 2, name: "INOX: R-City", address: "R-City Mall, LBS Marg, Ghatkopar West, Mumbai", city: "Mumbai" },
    "Delhi": { id: 1, name: "PVR: Select CITYWALK", address: "A-3, District Centre, Saket, New Delhi", city: "Delhi" }
};

const CITY_SCHEDULES = {
    "Nashik": [
        { movieTitle: "Jailer 2", times: ["10:15", "14:30", "18:45", "22:15"], prices: [220, 280, 350, 300] },
        { movieTitle: "Kalki 2898 AD", times: ["11:00", "19:30"], prices: [280, 360] },
        { movieTitle: "Stree 2", times: ["13:00", "21:00"], prices: [200, 260] }
    ],
    "Mumbai": [
        { movieTitle: "Jawan", times: ["10:30", "15:00", "19:15"], prices: [250, 320, 420] },
        { movieTitle: "Pushpa 2: The Rule", times: ["12:00", "16:45", "21:30"], prices: [300, 380, 450] },
        { movieTitle: "Devara: Part 1", times: ["13:30", "18:00", "22:45"], prices: [240, 300, 360] },
        { movieTitle: "Jailer 2", times: ["17:15", "21:00"], prices: [320, 400] }
    ],
    "Bengaluru": [
        { movieTitle: "Kalki 2898 AD", times: ["09:45", "14:15", "18:30"], prices: [240, 320, 400] },
        { movieTitle: "Jailer 2", times: ["11:30", "17:00", "21:45"], prices: [280, 360, 440] },
        { movieTitle: "Stree 2", times: ["15:30", "20:30"], prices: [220, 290] },
        { movieTitle: "Pushpa 2: The Rule", times: ["13:15", "19:45"], prices: [260, 350] }
    ],
    "Delhi": [
        { movieTitle: "Stree 2", times: ["10:00", "13:45", "18:00", "22:15"], prices: [260, 340, 420, 380] },
        { movieTitle: "Jawan", times: ["11:15", "16:30", "21:00"], prices: [280, 360, 450] },
        { movieTitle: "Pushpa 2: The Rule", times: ["14:30", "19:30"], prices: [300, 400] },
        { movieTitle: "Devara: Part 1", times: ["12:45", "17:45"], prices: [250, 320] }
    ]
};

// ======================================================
// STATE MANAGEMENT
// ======================================================

const savedProfile = JSON.parse(localStorage.getItem("movieverse_profile") || localStorage.getItem("bookmyshow_profile") || "null");

const state = {
    movies: [...FALLBACK_MOVIES],
    shows: [],
    showsLoaded: false,
    selectedShow: null,
    selectedSeats: [],
    selectedDate: dateKey(new Date()),
    activeFilter: "All",
    profile: savedProfile,
    pendingShowId: null,
    heroIndex: 0
};

let heroInterval = null;

// ======================================================
// DOM HELPER
// ======================================================

const $ = (selector) => document.querySelector(selector);

// ======================================================
// DATE / TIME / FORMATTING UTILS
// ======================================================

function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}


function formatDateLabel(dateStr) {
    if (!dateStr) return "Today";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    } catch (e) {
        return String(dateStr);
    }
}

function formatTime(isoString) {
    if (!isoString) return "";
    try {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch {
        return isoString;
    }
}


function maskPhone(phone) {
    if (!phone) return "";
    const clean = String(phone).replace(/\D/g, "");
    if (clean.length >= 10) {
        return clean.slice(0, 2) + "XXXXXX" + clean.slice(-2);
    } else if (clean.length >= 4) {
        return clean.slice(0, 2) + "XXXX" + clean.slice(-1);
    }
    return "XXXXXXXXXX";
}

function formatMoney(amount) {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function escapeHtml(str = "") {
    return String(str).replace(/[&<>'"]/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    }[char]));
}

// ======================================================
// API CLIENT
// ======================================================

async function fetchJson(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s safety timeout

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                "Content-Type": "application/json"
            },
            signal: controller.signal,
            ...options
        });
        clearTimeout(timeoutId);

        const text = await response.text();
        let data = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = {};
        }

        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP ${response.status}: Request failed`);
        }

        return data;
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

// ======================================================
// DYNAMIC SHOW GENERATOR (Never Blank Guarantee)
// ======================================================

function generateDynamicShows(cityName, dateStr) {
    const theatre = CITY_THEATRES[cityName] || CITY_THEATRES["Nashik"];
    const movies = state.movies.length > 0 ? state.movies : FALLBACK_MOVIES;
    const schedule = CITY_SCHEDULES[cityName] || CITY_SCHEDULES["Nashik"];

    const generated = [];
    let counter = (theatre.id || 1) * 1000;

    schedule.forEach((item, itemIdx) => {
        let movie = movies.find(m => m.title && m.title.toLowerCase().includes(item.movieTitle.toLowerCase().split(":")[0].trim()));
        if (!movie) movie = movies[itemIdx % movies.length];

        item.times.forEach((timeStr, tIdx) => {
            counter++;
            const price = item.prices[tIdx] || 250;
            const startsAt = `${dateStr}T${timeStr}:00`;

            const availableSeats = [];
            for (let i = 0; i < 100; i++) {
                const row = String.fromCharCode(65 + Math.floor(i / 10));
                const col = (i % 10) + 1;
                availableSeats.push(`${row}${col}`);
            }

            generated.push({
                id: counter,
                movie: movie,
                theatre: theatre,
                startsAt: startsAt,
                ticketPrice: price,
                totalSeats: 100,
                availableSeatLabels: availableSeats
            });
        });
    });

    return generated;
}

// ======================================================
// HERO SECTION WITH AUTO-ROTATION (Every 5.5 seconds)
// ======================================================

const HERO_ROTATION_INTERVAL = 5200; // 5.2s rotation with comfortable reading pacing

function getHeroMovies() {
    if (state.movies && state.movies.length > 0) {
        return state.movies;
    }
    return FALLBACK_MOVIES;
}

function getCityFilteredMovies() {
    const selectedCity = $("#citySelect") ? $("#citySelect").value : "Nashik";
    const cityLower = selectedCity.trim().toLowerCase();
    const expectedTheatre = (CITY_THEATRES[selectedCity]?.name || "").trim().toLowerCase();

    const cityShows = (state.shows || []).filter(s => {
        const theatreCity = (s.theatre?.city || "").trim().toLowerCase();
        const theatreName = (s.theatre?.name || "").trim().toLowerCase();
        return theatreCity === cityLower || theatreName === expectedTheatre;
    });

    if (cityShows.length > 0) {
        const cityMovieIds = new Set(cityShows.map(s => Number(s.movie?.id)).filter(Boolean));
        if (cityMovieIds.size > 0) {
            const filtered = state.movies.filter(m => cityMovieIds.has(Number(m.id)));
            if (filtered.length > 0) return filtered;
        }
    }
    return state.movies && state.movies.length > 0 ? state.movies : FALLBACK_MOVIES;
}

function updateHeroContent(movie) {
    if (!movie) return;

    const heroImage = $("#heroImage");
    heroImage.src = movie.posterUrl || "images/jailer2_poster.jpg";
    heroImage.onerror = () => {
        heroImage.src = "https://images.unsplash.com/photo-1631540376030-acb6beacf09d?w=1600";
    };
    heroImage.alt = `${movie.title} Poster`;

    $("#heroTitle").textContent = movie.title;
    $("#heroDescription").textContent = movie.description || "Experience the ultimate theatrical blockbuster on the grand screen with Dolby Atmos sound.";
    $("#heroLanguage").textContent = movie.language || "Now Showing";
    $("#heroGenre").textContent = movie.genre || "Action / Drama";
    $("#heroCertificate").textContent = movie.certificate || "U/A";

    const rating = (8.9 + (state.heroIndex % 5) * 0.1).toFixed(1);
    $("#heroRating").innerHTML = `★ ${rating}/10 <small>(420K+ Votes)</small>`;

    if (movie.durationMinutes) {
        const hrs = Math.floor(movie.durationMinutes / 60);
        const mins = movie.durationMinutes % 60;
        $("#heroDuration").textContent = `${hrs}h ${mins}m`;
    } else {
        $("#heroDuration").textContent = "2h 48m";
    }

    // Hero Book Button Action
    $("#heroBookButton").onclick = () => {
        $("#showtimesSection").scrollIntoView({ behavior: "smooth" });
        const show = state.shows.find(s => s.movie?.id === movie.id);
        if (show) {
            openSeatModal(show.id);
        } else {
            showToast(`Showtimes for ${movie.title} displayed below.`, true);
        }
    };

    // Hero Overview Button Action
    const overviewBtn = $("#heroOverviewButton");
    if (overviewBtn) {
        overviewBtn.onclick = () => {
            openMovieDetailModal(movie.id);
        };
    }

    // Render switcher dots
    const activeMovies = getHeroMovies();
    const dotsContainer = $("#heroCarouselDots");
    if (dotsContainer) {
        dotsContainer.innerHTML = activeMovies.slice(0, 6).map((m, idx) => `
            <button class="dot-btn ${idx === state.heroIndex ? 'active' : ''}" data-idx="${idx}" type="button" aria-label="Slide to ${escapeHtml(m.title)}"></button>
        `).join("");

        dotsContainer.querySelectorAll(".dot-btn").forEach(btn => {
            btn.onclick = () => {
                state.heroIndex = Number(btn.dataset.idx);
                renderHero(false);
                restartHeroAutoRotate();
            };
        });
    }
}

function renderHero(isAuto = false) {
    const activeMovies = getHeroMovies();
    if (!activeMovies.length) return;

    if (state.heroIndex >= activeMovies.length) {
        state.heroIndex = 0;
    }

    let movie = activeMovies[state.heroIndex];
    const heroImage = $("#heroImage");
    const heroContent = $(".hero-content");

    if (heroImage) {
        // Smooth cinematic crossfade & zoom effect
        heroImage.classList.add("crossfade-out");
        if (heroContent) heroContent.classList.add("hero-content-shift");

        setTimeout(() => {
            updateHeroContent(movie);
            heroImage.classList.remove("crossfade-out");
            if (heroContent) {
                setTimeout(() => heroContent.classList.remove("hero-content-shift"), 40);
            }
        }, 320);
    } else {
        updateHeroContent(movie);
    }
}

function startHeroAutoRotate() {
    stopHeroAutoRotate();
    const moviesList = getHeroMovies();
    if (!moviesList || moviesList.length <= 1) return;

    heroInterval = setInterval(() => {
        const currentList = getHeroMovies();
        if (!currentList || currentList.length <= 1) return;
        state.heroIndex = (state.heroIndex + 1) % Math.min(currentList.length, 6);
        renderHero(true);
    }, HERO_ROTATION_INTERVAL);
}

function stopHeroAutoRotate() {
    if (heroInterval) {
        clearInterval(heroInterval);
        heroInterval = null;
    }
}

function restartHeroAutoRotate() {
    stopHeroAutoRotate();
    startHeroAutoRotate();
}

// Pause rotation on hover
// Pause rotation ONLY when hovering interactive CTA buttons, NOT entire backdrop
const heroCtas = $(".hero-cta-group");
if (heroCtas) {
    heroCtas.addEventListener("mouseenter", stopHeroAutoRotate);
    heroCtas.addEventListener("mouseleave", startHeroAutoRotate);
}

// ======================================================
// MOVIES SECTION & SEARCH WITH REDIRECT & FEEDBACK
// ======================================================

function renderMovies() {
    const selectedCity = $("#citySelect") ? $("#citySelect").value : "Nashik";
    const nowShowingCityLabel = $("#nowShowingCityLabel");
    if (nowShowingCityLabel) {
        nowShowingCityLabel.textContent = selectedCity;
    }

    const cityMovies = getCityFilteredMovies();
    const query = $("#searchInput") ? $("#searchInput").value.toLowerCase().trim() : "";

    const filtered = cityMovies.filter(movie => {
        const text = `${movie.title || ""} ${movie.genre || ""} ${movie.language || ""}`.toLowerCase();
        const matchesQuery = text.includes(query);

        const matchesFilter = (state.activeFilter === "All")
            || (movie.language && movie.language.toLowerCase().includes(state.activeFilter.toLowerCase()))
            || (movie.genre && movie.genre.toLowerCase().includes(state.activeFilter.toLowerCase()));

        return matchesQuery && matchesFilter;
    });

    const grid = $("#movieGrid");

    if (!filtered.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <p>No movies currently showing matching "<strong>${escapeHtml(query)}</strong>".</p>
                <button class="btn-primary" style="margin-top: 14px;" type="button" onclick="clearSearchFilter()">Reset Search Filter</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map((movie, index) => {
        const rating = (8.7 + (index % 5) * 0.2).toFixed(1);
        const fallbackPoster = (movie.title || "").toLowerCase().includes("jailer")
            ? "images/jailer2_poster.jpg"
            : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900";
        const poster = movie.posterUrl || fallbackPoster;

        return `
            <article class="movie-card" data-movie-id="${movie.id}" style="animation-delay: ${index * 60}ms">
                <div class="movie-poster-wrap" onclick="openMovieDetailModal(${movie.id})">
                    <img class="movie-poster" src="${escapeHtml(poster)}" alt="${escapeHtml(movie.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900'">
                    <span class="poster-badge">${escapeHtml(movie.certificate || "U/A")}</span>
                    <span class="poster-rating">★ ${rating}</span>
                </div>

                <div class="movie-details">
                    <h3 class="movie-title" title="${escapeHtml(movie.title)}" onclick="openMovieDetailModal(${movie.id})">${escapeHtml(movie.title)}</h3>
                    <p class="movie-subtitle">${escapeHtml(movie.language || "")} • ${escapeHtml(movie.genre || "")}</p>
                    <p class="movie-desc">${escapeHtml(movie.description || "Exciting theatrical experience in your city.")}</p>
                    
                    <div class="card-action-bar">
                        <button class="btn-card-book" data-movie-id="${movie.id}" type="button">
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                <path d="M7 15h0"></path>
                                <path d="M2 9.5h20"></path>
                            </svg>
                            <span>Book Tickets</span>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    // Book Ticket Buttons in Cards
    document.querySelectorAll(".btn-card-book").forEach(btn => {
        btn.onclick = () => {
            const movieId = Number(btn.dataset.movieId);
            $("#showtimesSection").scrollIntoView({ behavior: "smooth" });

            const targetShow = state.shows.find(s => Number(s.movie?.id) === movieId);
            if (targetShow) {
                openSeatModal(targetShow.id);
            } else {
                showToast("Available showtimes listed below for this movie in your city.", true);
            }
        };
    });
}

function clearSearchFilter() {
    $("#searchInput").value = "";
    state.activeFilter = "All";
    document.querySelectorAll(".filter-pill").forEach(p => p.classList.toggle("active", p.dataset.filter === "All"));
    executeSearch(false);
}

function executeSearch(shouldScroll = true) {
    const query = $("#searchInput").value.trim();
    renderMovies();

    const banner = $("#searchResultsBanner");

    if (query) {
        const cards = document.querySelectorAll(".movie-card");
        const count = cards.length;

        if (count > 0 && !$(".empty-state")) {
            banner.hidden = false;
            banner.style.display = "flex";
            banner.innerHTML = `
                <span>Found <strong>${count}</strong> movie(s) matching "<strong>${escapeHtml(query)}</strong>"</span>
                <span class="btn-clear-search" id="clearSearchBannerBtn">Clear Search</span>
            `;
            $("#clearSearchBannerBtn").onclick = clearSearchFilter;

            cards.forEach(card => {
                card.classList.remove("search-highlight");
                void card.offsetWidth;
                card.classList.add("search-highlight");
            });

            if (shouldScroll) {
                $("#moviesSection").scrollIntoView({ behavior: "smooth", block: "start" });
                showToast(`Found ${count} movie(s) matching "${query}".`, true);
            }
        } else {
            banner.hidden = false;
            banner.style.display = "flex";
            banner.innerHTML = `
                <span>No movies matching "<strong>${escapeHtml(query)}</strong>"</span>
                <span class="btn-clear-search" id="clearSearchBannerBtn">Show All Movies</span>
            `;
            $("#clearSearchBannerBtn").onclick = clearSearchFilter;

            if (shouldScroll) {
                $("#moviesSection").scrollIntoView({ behavior: "smooth", block: "start" });
                showToast(`No movies found for "${query}".`, false);
            }
        }
    } else {
        banner.hidden = true;
        banner.style.display = "none";
    }
}

async function loadMovies() {
    try {
        const movies = await fetchJson("/movies");
        console.log("MOVIES FETCHED FROM DATABASE:", movies);

        let list = Array.isArray(movies) && movies.length > 0 ? movies : FALLBACK_MOVIES;

        list.sort((a, b) => {
            const aJ = (a.title || "").toLowerCase().includes("jailer");
            const bJ = (b.title || "").toLowerCase().includes("jailer");
            if (aJ && !bJ) return -1;
            if (!aJ && bJ) return 1;
            return 0;
        });

        state.movies = list;
    } catch (err) {
        console.warn("Backend sleeping or unreachable. Using fallback movies:", err.message);
        state.movies = [...FALLBACK_MOVIES];
    } finally {
        // Smoothly update movie list without resetting or flickering the hero banner!
        renderMovies();
    }
}

// ======================================================
// MOVIE OVERVIEW & DETAILS MODAL
// ======================================================

function openMovieDetailModal(movieId) {
    const movie = state.movies.find(m => Number(m.id) === Number(movieId)) || FALLBACK_MOVIES[0];
    if (!movie) return;

    const modal = $("#movieDetailModal");
    if (!modal) return;

    const fallbackPoster = (movie.title || "").toLowerCase().includes("jailer")
        ? "images/jailer2_poster.jpg"
        : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900";

    $("#detailPoster").src = movie.posterUrl || fallbackPoster;
    $("#detailPoster").onerror = () => {
        $("#detailPoster").src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900";
    };
    $("#detailPoster").alt = movie.title;
    $("#detailCertificate").textContent = movie.certificate || "U/A";
    $("#detailMovieTitle").textContent = movie.title;
    $("#detailLanguage").textContent = movie.language || "Hindi";
    $("#detailGenre").textContent = movie.genre || "Action";

    const rating = (8.9 + (movie.id % 5) * 0.1).toFixed(1);
    $("#detailRating").textContent = `★ ${rating}/10`;

    if (movie.durationMinutes) {
        const hrs = Math.floor(movie.durationMinutes / 60);
        const mins = movie.durationMinutes % 60;
        $("#detailDuration").textContent = `${hrs}h ${mins}m`;
    } else {
        $("#detailDuration").textContent = "2h 45m";
    }

    $("#detailDescription").textContent = movie.description || "An extraordinary cinematic masterpiece presented on the grand screen with immersive sound.";

    const city = $("#citySelect").value;
    $("#detailCityLabel").textContent = city;

    // Filter shows for this movie in current city
    const movieShows = state.shows.filter(s => Number(s.movie?.id) === Number(movie.id));
    const slotsContainer = $("#detailShowtimeSlots");

    if (movieShows.length > 0) {
        slotsContainer.innerHTML = movieShows.map(show => `
            <button class="slot-btn" data-show-id="${show.id}" type="button">
                <span class="slot-time">${formatTime(show.startsAt)}</span>
                <span class="slot-price">${formatMoney(show.ticketPrice)}</span>
            </button>
        `).join("");

        slotsContainer.querySelectorAll(".slot-btn").forEach(btn => {
            btn.onclick = () => {
                closeModals();
                openSeatModal(Number(btn.dataset.showId));
            };
        });

        $("#detailBookButton").onclick = () => {
            closeModals();
            openSeatModal(movieShows[0].id);
        };
    } else {
        slotsContainer.innerHTML = `<span class="no-seat-text">Showtimes active for today. Tap below to pick seats.</span>`;
        $("#detailBookButton").onclick = () => {
            closeModals();
            $("#showtimesSection").scrollIntoView({ behavior: "smooth" });
        };
    }

    modal.hidden = false;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

// ======================================================
// DATE PICKER (7 Days from Current Date)
// ======================================================

function renderDates() {
    const dates = Array.from({ length: 7 }, (_, i) => new Date(Date.now() + i * 86400000));

    $("#datePicker").innerHTML = dates.map((date, idx) => {
        const key = dateKey(date);
        const dayName = idx === 0 ? "Today" : date.toLocaleDateString([], { weekday: "short" });
        const dayNumber = date.getDate();
        const isActive = key === state.selectedDate;

        return `
            <button class="date-btn ${isActive ? 'active' : ''}" data-date="${key}" type="button">
                <span class="day-label">${dayName}</span>
                <span class="date-num">${dayNumber}</span>
            </button>
        `;
    }).join("");

    document.querySelectorAll(".date-btn").forEach(btn => {
        btn.onclick = () => {
            state.selectedDate = btn.dataset.date;
            renderDates();
            loadShows();
        };
    });
}

// ======================================================
// SHOWTIMES & THEATRES (Distinct Lineups per City)
// ======================================================

function renderShows() {
    const container = $("#showList");
    const city = $("#citySelect").value;
    const cityLower = city.trim().toLowerCase();
    $("#currentCityLabel").textContent = city;

    // Filter strictly for shows in this selected city
    let cityShows = state.shows.filter(s => {
        const theatreCity = (s.theatre?.city || "").trim().toLowerCase();
        const theatreName = (s.theatre?.name || "").trim().toLowerCase();
        const expectedTheatre = (CITY_THEATRES[city]?.name || "").trim().toLowerCase();
        return theatreCity === cityLower || theatreName === expectedTheatre;
    });

    if (!cityShows.length) {
        cityShows = generateDynamicShows(city, state.selectedDate);
        state.shows = cityShows;
    }

    // Group shows by Theatre -> Movie
    const grouped = {};
    cityShows.forEach(show => {
        const theatreId = show.theatre?.id || "unknown";
        if (!grouped[theatreId]) {
            grouped[theatreId] = {
                theatre: show.theatre,
                movies: {}
            };
        }
        const movieId = show.movie?.id || "unknown";
        if (!grouped[theatreId].movies[movieId]) {
            grouped[theatreId].movies[movieId] = {
                movie: show.movie,
                shows: []
            };
        }
        grouped[theatreId].movies[movieId].shows.push(show);
    });

    container.innerHTML = Object.values(grouped).map(theatreGroup => {
        const theatre = theatreGroup.theatre;
        const movieGroups = Object.values(theatreGroup.movies);

        return `
            <article class="theatre-show-card">
                <div class="theatre-info-col">
                    <h3 class="theatre-name">${escapeHtml(theatre?.name || "Cinema")}</h3>
                    <p class="theatre-address">${escapeHtml(theatre?.address || theatre?.Address || "")}</p>
                    <div class="theatre-perks">
                        <span class="perk-pill">M-Ticket</span>
                        <span class="perk-pill">Dolby Atmos</span>
                    </div>
                </div>

                <div class="theatre-movie-group">
                    ${movieGroups.map(mg => `
                        <div class="group-movie-item">
                            <div class="group-movie-title">
                                <h4>${escapeHtml(mg.movie?.title || "")}</h4>
                                <span>${escapeHtml(mg.movie?.language || "")} • ${escapeHtml(mg.movie?.genre || "")}</span>
                            </div>
                            <div class="time-slot-grid">
                                ${mg.shows.map(show => `
                                    <button class="slot-btn" data-show-id="${show.id}" type="button">
                                        <span class="slot-time">${formatTime(show.startsAt)}</span>
                                        <span class="slot-price">${formatMoney(show.ticketPrice)}</span>
                                    </button>
                                `).join("")}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </article>
        `;
    }).join("");

    // Time Slot Click Handlers
    document.querySelectorAll(".slot-btn").forEach(btn => {
        btn.onclick = () => {
            const showId = Number(btn.dataset.showId);
            openSeatModal(showId);
        };
    });
}

// In-memory cache for ultra-fast instant switching between cities & dates
const showsCache = {};

async function loadShows() {
    const selectedCity = $("#citySelect").value;
    const cacheKey = `${selectedCity}_${state.selectedDate}`;

    // 1. INSTANT ZERO-LAG RENDER: Render immediately from cache or dynamic generator in 0ms
    if (showsCache[cacheKey]) {
        state.shows = showsCache[cacheKey];
    } else {
        state.shows = generateDynamicShows(selectedCity, state.selectedDate);
        showsCache[cacheKey] = state.shows;
    }
    
    state.showsLoaded = true;
    renderShows();
    renderMovies();
    // HERO IS UNTOUCHED - continues smooth rotation without jumping

    // 2. Background cloud synchronization
    try {
        const cityParam = encodeURIComponent(selectedCity);
        const backendShows = await fetchJson(`/shows?city=${cityParam}&date=${state.selectedDate}`);
        if (Array.isArray(backendShows) && backendShows.length > 0) {
            const cityLower = selectedCity.trim().toLowerCase();
            const filteredBackend = backendShows.filter(s => {
                const tCity = (s.theatre?.city || "").trim().toLowerCase();
                return !tCity || tCity === cityLower;
            });
            if (filteredBackend.length > 0) {
                state.shows = filteredBackend;
                showsCache[cacheKey] = filteredBackend;
                renderShows();
                renderMovies();
            }
        }
    } catch (err) {
        // Smoothly retain instant shows
    }
}

// ======================================================
// UNIFIED SEAT RESERVATION ENGINE (Derived from Real Bookings)
// ======================================================

function normalizeStr(str) {
    return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeTime(t) {
    if (!t) return "";
    const str = String(t).trim();
    if (str.includes("T")) {
        const timePart = str.split("T")[1];
        if (timePart) {
            const parts = timePart.split(":");
            return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
        }
    }
    const match = str.match(/(\d{1,2})[:.](\d{2})\s*(am|pm)?/i);
    if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2];
        const meridiem = (match[3] || "").toLowerCase();
        if (meridiem === "pm" && h < 12) h += 12;
        if (meridiem === "am" && h === 12) h = 0;
        return `${String(h).padStart(2, "0")}:${m}`;
    }
    return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseSeatLabels(seatLabel) {
    if (!seatLabel) return [];
    if (Array.isArray(seatLabel)) return seatLabel.map(s => String(s).toUpperCase().trim()).filter(Boolean);
    if (typeof seatLabel === "string") return seatLabel.split(",").map(s => String(s).toUpperCase().trim()).filter(Boolean);
    return [];
}

function getAllActiveProfileBookings() {
    const list = [];
    if (state.profile?.id) {
        const profileBookings = JSON.parse(localStorage.getItem(`bms_bookings_${state.profile.id}`) || "[]");
        list.push(...profileBookings);
    }
    try {
        const masterBookings = JSON.parse(localStorage.getItem("bms_master_bookings") || "[]");
        if (Array.isArray(masterBookings)) {
            masterBookings.forEach(mb => {
                if (!list.some(existing => String(existing.id) === String(mb.id))) {
                    list.push(mb);
                }
            });
        }
    } catch (e) {}
    if (Array.isArray(activeBookingsList) && activeBookingsList.length > 0) {
        activeBookingsList.forEach(b => {
            if (!list.some(existing => String(existing.id) === String(b.id))) {
                list.push(b);
            }
        });
    }
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("bms_bookings_") || key === "bms_bookings")) {
            try {
                const arr = JSON.parse(localStorage.getItem(key) || "[]");
                if (Array.isArray(arr)) {
                    arr.forEach(b => {
                        if (!list.some(existing => String(existing.id) === String(b.id))) {
                            list.push(b);
                        }
                    });
                }
            } catch (e) {}
        }
    }
    return list;
}

function getOccupiedSeatsForCurrentShow() {
    const show = state.selectedShow;
    if (!show) return new Set();

    const showMovieNorm = normalizeStr(show.movie?.title);
    const showCityNorm = normalizeStr(show.theatre?.city || $("#citySelect")?.value);
    const showTimeNorm = normalizeTime(show.startsAt);
    const showIdStr = String(show.id);

    const occupiedSeats = new Set();

    // 1. Backend availableSeatLabels: seats missing from it are already reserved in MySQL!
    if (Array.isArray(show.availableSeatLabels) && show.availableSeatLabels.length > 0 && show.availableSeatLabels.length < Number(show.totalSeats || 100)) {
        const availSet = new Set(show.availableSeatLabels.map(s => String(s).toUpperCase().trim()));
        const total = Number(show.totalSeats || 100);
        for (let i = 0; i < total; i++) {
            const row = String.fromCharCode(65 + Math.floor(i / 10));
            const col = (i % 10) + 1;
            const label = `${row}${col}`;
            if (!availSet.has(label)) {
                occupiedSeats.add(label);
            }
        }
    }

    // 2. Local persistent reserved seats store (bms_reserved_seats)
    try {
        const reservedMap = JSON.parse(localStorage.getItem("bms_reserved_seats") || "{}");
        if (Array.isArray(reservedMap[showIdStr])) {
            reservedMap[showIdStr].forEach(s => occupiedSeats.add(String(s).toUpperCase().trim()));
        }
        const sig = `${showMovieNorm}_${showCityNorm}_${showTimeNorm}`;
        if (Array.isArray(reservedMap[sig])) {
            reservedMap[sig].forEach(s => occupiedSeats.add(String(s).toUpperCase().trim()));
        }
    } catch (e) {}

    // 3. Derived directly from CONFIRMED bookings in active state & storage
    const allBookings = getAllActiveProfileBookings();
    const cancelledIds = getCancelledIds();

    allBookings.forEach(b => {
        if (!b) return;
        const isCancelled = (b.status || "").toUpperCase() === "CANCELLED" || cancelledIds.has(String(b.id));
        if (isCancelled) return; // Cancelled bookings NEVER occupy seats!

        const isConfirmed = (b.status || "CONFIRMED").toUpperCase() === "CONFIRMED";
        if (isConfirmed) {
            const bMovieNorm = normalizeStr(b.movieTitle);
            const bCityNorm = normalizeStr(b.theatreCity || b.city);
            const bTimeNorm = normalizeTime(b.showtime || (b.startsAt ? formatTime(b.startsAt) : ""));
            const bShowIdStr = String(b.showId || b.ShowId || "");

            const idMatches = bShowIdStr && (bShowIdStr === showIdStr);
            const detailsMatch = bMovieNorm && showMovieNorm && (bMovieNorm === showMovieNorm) &&
                (!bTimeNorm || !showTimeNorm || bTimeNorm === showTimeNorm) &&
                (!bCityNorm || !showCityNorm || bCityNorm === showCityNorm);

            if (idMatches || detailsMatch) {
                const seats = parseSeatLabels(b.seatLabel);
                seats.forEach(s => occupiedSeats.add(s));
            }
        }
    });

    return occupiedSeats;
}

function getReservedSeats(showId) {
    return Array.from(getOccupiedSeatsForCurrentShow());
}

function getReleasedSeats(showId) {
    return [];
}

function markSeatsReserved(showId, seats, movieTitle = "", showtime = "", city = "") {
    try {
        const all = JSON.parse(localStorage.getItem("bms_reserved_seats") || "{}");
        const seatsArr = parseSeatLabels(seats);

        if (showId) {
            const current = new Set(all[String(showId)] || []);
            seatsArr.forEach(s => current.add(s));
            all[String(showId)] = Array.from(current);
        }

        if (movieTitle) {
            const sig = `${normalizeStr(movieTitle)}_${normalizeStr(city || $("#citySelect")?.value)}_${normalizeTime(showtime)}`;
            const currentSig = new Set(all[sig] || []);
            seatsArr.forEach(s => currentSig.add(s));
            all[sig] = Array.from(currentSig);
        }

        localStorage.setItem("bms_reserved_seats", JSON.stringify(all));
    } catch (e) {}
}

function releaseSeats(showId, seats, movieTitle = "", showtime = "", city = "") {
    try {
        const all = JSON.parse(localStorage.getItem("bms_reserved_seats") || "{}");
        const toRelease = new Set(parseSeatLabels(seats));

        if (showId && all[String(showId)]) {
            all[String(showId)] = all[String(showId)].filter(s => !toRelease.has(s));
        }

        if (movieTitle) {
            const sig = `${normalizeStr(movieTitle)}_${normalizeStr(city || $("#citySelect")?.value)}_${normalizeTime(showtime)}`;
            if (all[sig]) {
                all[sig] = all[sig].filter(s => !toRelease.has(s));
            }
        }

        localStorage.setItem("bms_reserved_seats", JSON.stringify(all));
    } catch (e) {}
}

// ======================================================
// SEAT SELECTION & BOOKING MODAL
// ======================================================

function openSeatModal(showId) {
    state.selectedShow = state.shows.find(s => Number(s.id) === Number(showId));
    if (!state.selectedShow) {
        showToast("Showtime details could not be found.", false);
        return;
    }

    state.selectedSeats = [];
    const show = state.selectedShow;

    $("#modalTitle").textContent = show.movie?.title || "Select Seats";
    $("#modalSubtitle").textContent = `${show.theatre?.name || "Theatre"} • ${formatTime(show.startsAt)}`;
    $("#modalTicketPrice").textContent = formatMoney(show.ticketPrice);

    renderSeatMap();

    $("#bookingModal").hidden = false;
    $("#bookingModal").style.display = "flex";
    document.body.style.overflow = "hidden";
}

function renderSeatMap() {
    const show = state.selectedShow;
    if (!show) return;
    const total = Number(show.totalSeats || 100);
    const seatLabels = [];

    for (let i = 0; i < total; i++) {
        const row = String.fromCharCode(65 + Math.floor(i / 10));
        const col = (i % 10) + 1;
        seatLabels.push(`${row}${col}`);
    }

    // True occupied seats derived directly from CONFIRMED bookings
    const occupiedSeats = getOccupiedSeatsForCurrentShow();

    const seatGrid = $("#seatGrid");
    seatGrid.innerHTML = seatLabels.map(label => {
        const isOccupied = occupiedSeats.has(label);
        const isSelected = state.selectedSeats.includes(label);

        return `
            <button class="seat-item ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}"
                    ${isOccupied ? 'disabled' : ''}
                    data-seat="${label}"
                    type="button"
                    aria-label="Seat ${label}">
                ${label}
            </button>
        `;
    }).join("");

    // Seat Click Handlers
    document.querySelectorAll(".seat-item:not(.occupied)").forEach(btn => {
        btn.onclick = () => {
            const seat = btn.dataset.seat;
            if (state.selectedSeats.includes(seat)) {
                state.selectedSeats = state.selectedSeats.filter(s => s !== seat);
            } else {
                if (state.selectedSeats.length >= 8) {
                    showToast("Maximum 8 seats allowed per booking.", false);
                    return;
                }
                state.selectedSeats.push(seat);
            }
            renderSeatSelectionSummary();
            renderSeatMap();
        };
    });

    renderSeatSelectionSummary();
}

function renderSeatSelectionSummary() {
    const list = $("#selectedSeatsList");
    if (!state.selectedSeats.length) {
        list.innerHTML = `<span class="no-seat-text">None selected</span>`;
    } else {
        list.innerHTML = state.selectedSeats.map(s => `<span class="seat-chip">${s}</span>`).join("");
    }

    const price = Number(state.selectedShow?.ticketPrice || 0);
    const total = state.selectedSeats.length * price;
    $("#totalAmount").textContent = formatMoney(total);

    $("#continueButton").disabled = state.selectedSeats.length === 0;
}

// Continue Button in Seat Modal
$("#continueButton").onclick = () => {
    if (!state.profile) {
        state.pendingShowId = state.selectedShow?.id;
        closeModals();
        openAccountModal();
        showToast("Please sign in or create an account to proceed.", false);
        return;
    }

    openConfirmationModal();
};

// ======================================================
// BOOKING CONFIRMATION MODAL
// ======================================================

function openConfirmationModal() {
    const show = state.selectedShow;
    if (!show || !state.profile) return;

    $("#confirmMovieTitle").textContent = show.movie?.title || "";
    $("#confirmTheatreName").textContent = show.theatre?.name || "";
    $("#confirmShowtime").textContent = formatTime(show.startsAt);
    const contactInfo = state.profile.email || maskPhone(state.profile.phone);
    $("#bookingProfileLabel").textContent = `Booking for ${state.profile.name} (${contactInfo})`;
    $("#formSeats").textContent = state.selectedSeats.join(", ");

    const total = state.selectedSeats.length * Number(show.ticketPrice || 0);
    $("#formTotal").textContent = formatMoney(total);
    $("#bookingError").textContent = "";

    $("#bookingModal").hidden = true;
    $("#bookingModal").style.display = "none";

    $("#customerModal").hidden = false;
    $("#customerModal").style.display = "flex";
}

$("#customerForm").onsubmit = async (e) => {
    e.preventDefault();
    const btn = $("#customerForm button[type='submit']");
    const errorEl = $("#bookingError");
    errorEl.textContent = "";

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span>Confirming booking...</span>`;

    const show = state.selectedShow;
    const total = state.selectedSeats.length * Number(show.ticketPrice || 0);

    try {
        let result = null;

        // Try backend API confirmation if show exists in database
        try {
            result = await fetchJson(`/bookings/shows/${show.id}`, {
                method: "POST",
                body: JSON.stringify({
                    profileId: state.profile.id,
                    seatLabel: state.selectedSeats
                })
            });
        } catch (apiErr) {
            console.warn("Backend booking API:", apiErr.message);
            // Local confirmation for dynamic persistent shows
            result = {
                id: Date.now(),
                movieTitle: show.movie?.title || "Movie",
                theatreName: show.theatre?.name || "Cinema",
                seatLabel: [...state.selectedSeats],
                totalAmount: total,
                status: "CONFIRMED"
            };
        }

        // Mark seats as reserved with showId and signature
        markSeatsReserved(show.id, state.selectedSeats, show.movie?.title, show.startsAt, show.theatre?.city);

        const newBookingRecord = {
            id: result.id || Date.now(),
            bookedAt: result.bookedAt || new Date().toISOString(),
            showId: show.id,
            ShowId: show.id,
            movieTitle: show.movie?.title || "Movie",
            theatreName: show.theatre?.name || "Cinema",
            theatreCity: show.theatre?.city || $("#citySelect")?.value || "Nashik",
            showtime: formatTime(show.startsAt) || "10:15 AM",
            showDate: state.selectedDate ? formatDateLabel(state.selectedDate) : "Today",
            screen: show.screenName || "Audi 2",
            movieMeta: `${show.movie?.language || 'Hindi'} • ${show.movie?.genre || 'Action'} • ${show.movie?.certificate || 'U/A'}`,
            seatLabel: parseSeatLabels(state.selectedSeats),
            totalAmount: total,
            status: "CONFIRMED",
            ticketCode: `MV-${Math.floor(100000 + Math.random() * 900000)}`
        };

        const profileIdKey = state.profile?.id || "default";
        const localBookings = JSON.parse(localStorage.getItem(`bms_bookings_${profileIdKey}`) || "[]");
        localBookings.unshift(newBookingRecord);
        localStorage.setItem(`bms_bookings_${profileIdKey}`, JSON.stringify(localBookings));

        try {
            const masterBookings = JSON.parse(localStorage.getItem("bms_master_bookings") || "[]");
            masterBookings.unshift(newBookingRecord);
            localStorage.setItem("bms_master_bookings", JSON.stringify(masterBookings));
        } catch (e) {}

        if (Array.isArray(activeBookingsList)) {
            activeBookingsList.unshift(newBookingRecord);
        }

        closeModals();
        loadShows();
        loadBookingHistory();
        openTicketDetailModal(newBookingRecord);
        showToast(`🎉 Booking Confirmed! E-Ticket generated for ${show.movie?.title}!`, true);
    } catch (err) {
        console.error("BOOKING FALLBACK:", err);
        markSeatsReserved(show?.id, state.selectedSeats, show?.movie?.title, show?.startsAt, show?.theatre?.city);

        const fallbackBooking = {
            id: Date.now(),
            bookedAt: new Date().toISOString(),
            showId: show?.id,
            ShowId: show?.id,
            movieTitle: show?.movie?.title || "Movie",
            theatreName: show?.theatre?.name || "Cinema",
            theatreCity: show?.theatre?.city || $("#citySelect")?.value || "Nashik",
            showtime: formatTime(show?.startsAt) || "10:15 AM",
            showDate: state.selectedDate ? formatDateLabel(state.selectedDate) : "Today",
            screen: show?.screenName || "Audi 2",
            movieMeta: `${show?.movie?.language || 'Hindi'} • ${show?.movie?.genre || 'Action'} • ${show?.movie?.certificate || 'U/A'}`,
            seatLabel: parseSeatLabels(state.selectedSeats),
            totalAmount: total,
            status: "CONFIRMED",
            ticketCode: `MV-${Math.floor(100000 + Math.random() * 900000)}`
        };

        const profileIdKey = state.profile?.id || "default";
        const localBookings = JSON.parse(localStorage.getItem(`bms_bookings_${profileIdKey}`) || "[]");
        localBookings.unshift(fallbackBooking);
        localStorage.setItem(`bms_bookings_${profileIdKey}`, JSON.stringify(localBookings));

        try {
            const masterBookings = JSON.parse(localStorage.getItem("bms_master_bookings") || "[]");
            masterBookings.unshift(fallbackBooking);
            localStorage.setItem("bms_master_bookings", JSON.stringify(masterBookings));
        } catch (e) {}

        if (Array.isArray(activeBookingsList)) {
            activeBookingsList.unshift(fallbackBooking);
        }

        closeModals();
        loadShows();
        loadBookingHistory();
        openTicketDetailModal(fallbackBooking);
        showToast(`🎉 Booking Confirmed! E-Ticket generated for ${show?.movie?.title}!`, true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};

// ======================================================
// USER PROFILE & AUTHENTICATION
// ======================================================

// ======================================================
// RESILIENT LOCAL PROFILE STORE (Zero-Downtime Guarantee)
// ======================================================

const LOCAL_PROFILES_KEY = "movieverse_registered_profiles";

function cleanPhoneNumber(input) {
    if (!input) return "";
    let clean = String(input).replace(/\D/g, "");
    if (clean.length === 12 && clean.startsWith("91")) {
        clean = clean.slice(2);
    } else if (clean.length === 11 && clean.startsWith("0")) {
        clean = clean.slice(1);
    }
    return clean;
}

function getLocalProfiles() {
    try {
        const stored = JSON.parse(localStorage.getItem(LOCAL_PROFILES_KEY) || "[]");
        if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) {}
    // Pre-seed known profiles matching MySQL database for instant login
    const initialProfiles = [
        { id: 1, name: "Satyam Pandey", email: "satyampandey.sp18@gmail.com", phone: "9569671854" },
        { id: 2, name: "John Doe", email: "john@example.com", phone: "9876543210" },
        { id: 3, name: "Valid User", email: "user_1789760234523@test.com", phone: "9876518494" },
        { id: 4, name: "Adarsh Jaiswal", email: "aj9415@gmail.com", phone: "7275170954" },
        { id: 5, name: "Priya Sharma", email: "priya.sharma99@gmail.com", phone: "9123456780" }
    ];
    try {
        localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(initialProfiles));
    } catch (e) {}
    return initialProfiles;
}

function saveLocalProfile(profile) {
    if (!profile) return;
    const list = getLocalProfiles();
    const cleanEmail = (profile.email || "").toLowerCase().trim();
    const cleanPhone = cleanPhoneNumber(profile.phone);
    const cleanP = {
        id: profile.id || Date.now(),
        name: profile.name || "User",
        email: cleanEmail,
        phone: cleanPhone
    };
    const index = list.findIndex(p => 
        (cleanP.id && p.id && String(p.id) === String(cleanP.id)) ||
        (cleanEmail && p.email && p.email.toLowerCase() === cleanEmail) ||
        (cleanPhone && p.phone && cleanPhoneNumber(p.phone) === cleanPhone)
    );
    if (index >= 0) {
        list[index] = { ...list[index], ...cleanP };
    } else {
        list.push(cleanP);
    }
    try {
        localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(list));
    } catch (e) {}
}

function findLocalProfile(identifier) {
    const raw = String(identifier || "").trim().toLowerCase();
    const phone = cleanPhoneNumber(raw);
    const list = getLocalProfiles();
    return list.find(p => 
        (p.email && p.email.toLowerCase() === raw) ||
        (phone && cleanPhoneNumber(p.phone) === phone) ||
        (raw && p.phone === raw)
    );
}

function switchAuthTab(tab) {
    const loginTab = $("#loginTab");
    const createTab = $("#createTab");
    const loginForm = $("#profileLoginForm");
    const createForm = $("#profileCreateForm");

    $("#profileLoginError").textContent = "";
    $("#profileCreateError").textContent = "";

    if (tab === "create") {
        createTab?.classList.add("active");
        loginTab?.classList.remove("active");
        
        if (loginForm) {
            loginForm.hidden = true;
            loginForm.setAttribute("hidden", "");
            loginForm.style.display = "none";
        }
        if (createForm) {
            createForm.hidden = false;
            createForm.removeAttribute("hidden");
            createForm.style.display = "flex";
        }
        setTimeout(() => $("#profileName")?.focus(), 60);
    } else {
        loginTab?.classList.add("active");
        createTab?.classList.remove("active");

        if (createForm) {
            createForm.hidden = true;
            createForm.setAttribute("hidden", "");
            createForm.style.display = "none";
        }
        if (loginForm) {
            loginForm.hidden = false;
            loginForm.removeAttribute("hidden");
            loginForm.style.display = "flex";
        }
        setTimeout(() => $("#profileIdentifier")?.focus(), 60);
    }
}

function updateProfileUI() {
    const profile = state.profile;
    const nameLabel = $("#profileNameLabel");
    const avatar = $("#profileAvatarText");
    const authBox = $("#profileAuth");
    const view = $("#profileView");

    if (profile && profile.name) {
        if (nameLabel) nameLabel.textContent = profile.name.split(" ")[0] || "User";
        if (avatar) avatar.textContent = profile.name.charAt(0).toUpperCase() || "U";

        if (authBox) {
            authBox.hidden = true;
            authBox.setAttribute("hidden", "");
            authBox.style.display = "none";
        }

        if (view) {
            view.hidden = false;
            view.removeAttribute("hidden");
            view.style.display = "block";
        }

        $("#profileDisplayName").textContent = profile.name;
        const maskedPhone = profile.phone ? maskPhone(profile.phone) : "";
        $("#profileDisplayContact").textContent = maskedPhone ? `${profile.email} • ${maskedPhone}` : (profile.email || "");
        $("#profileBadgeLetter").textContent = profile.name.charAt(0).toUpperCase() || "U";
        loadBookingHistory();
    } else {
        if (nameLabel) nameLabel.textContent = "Sign In";
        if (avatar) avatar.textContent = "U";

        if (authBox) {
            authBox.hidden = false;
            authBox.removeAttribute("hidden");
            authBox.style.display = "block";
        }

        if (view) {
            view.hidden = true;
            view.setAttribute("hidden", "");
            view.style.display = "none";
        }

        switchAuthTab("login");
    }
}

function setProfile(profile) {
    if (!profile) return;
    state.profile = profile;
    localStorage.setItem("movieverse_profile", JSON.stringify(profile));
    localStorage.setItem("bookmyshow_profile", JSON.stringify(profile));
    saveLocalProfile(profile);
    updateProfileUI();

    if (state.pendingShowId) {
        const id = state.pendingShowId;
        state.pendingShowId = null;
        closeModals();
        openSeatModal(id);
    }
}

function openAccountModal() {
    const modal = $("#accountModal");
    if (modal) {
        modal.hidden = false;
        modal.removeAttribute("hidden");
        modal.style.display = "flex";
    }
    document.body.style.overflow = "hidden";
    updateProfileUI();
}

// Auth Tab click bindings
$("#loginTab").onclick = () => switchAuthTab("login");
$("#createTab").onclick = () => switchAuthTab("create");

// Quick Login Submit
$("#profileLoginForm").onsubmit = async (e) => {
    e.preventDefault();
    const errorEl = $("#profileLoginError");
    errorEl.textContent = "";

    const identifier = $("#profileIdentifier").value.trim();
    if (!identifier) {
        errorEl.textContent = "Please enter your email or 10-digit mobile number.";
        return;
    }

    const submitBtn = $("#profileLoginForm button[type='submit']");
    const origBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "<span>Signing in...</span>";

    try {
        let profile = null;

        // 1. Attempt Backend Database Login
        try {
            const cleanId = identifier.includes("@") ? identifier.toLowerCase() : cleanPhoneNumber(identifier);
            profile = await fetchJson(`/profiles/login?identifier=${encodeURIComponent(cleanId || identifier)}`);
        } catch (apiErr) {
            console.warn("Backend login attempt:", apiErr.message);
            // If backend returned a 404 resource not found from server
            if (apiErr.message && apiErr.message.includes("No profile found")) {
                // Also check local store in case registered offline
                const localUser = findLocalProfile(identifier);
                if (localUser) {
                    profile = localUser;
                } else {
                    throw new Error("No account found with this email or mobile. Click 'Create Account' tab above to register.");
                }
            } else {
                // If network failure / connection refused / timeout / offline, check local fallback store
                const localUser = findLocalProfile(identifier);
                if (localUser) {
                    profile = localUser;
                } else {
                    if (apiErr.name === "AbortError" || String(apiErr.message || "").includes("Failed to fetch") || String(apiErr.message || "").includes("NetworkError")) {
                        throw new Error("Backend offline. Account not found locally. Please click 'Create Account' tab to create your profile.");
                    }
                    throw apiErr;
                }
            }
        }

        if (profile) {
            saveLocalProfile(profile);
            setProfile(profile);
            showToast(`Welcome back, ${profile.name}!`, true);
            closeModals();
        }
    } catch (err) {
        errorEl.textContent = err.message || "Account not found. Please click 'Create Account' tab above to register.";
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
    }
};

// Create Profile Submit
$("#profileCreateForm").onsubmit = async (e) => {
    e.preventDefault();
    const errorEl = $("#profileCreateError");
    errorEl.textContent = "";

    const nameVal = $("#profileName").value.trim();
    const emailVal = $("#profileEmail").value.trim().toLowerCase();
    const phoneInput = $("#profilePhone").value.trim();
    const cleanPhone = cleanPhoneNumber(phoneInput);

    if (!nameVal) {
        errorEl.textContent = "Please enter your full name.";
        return;
    }

    if (!emailVal || !emailVal.includes("@") || !emailVal.includes(".")) {
        errorEl.textContent = "Please enter a valid email address.";
        return;
    }

    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 15) {
        errorEl.textContent = "Please enter a valid 10-digit mobile number.";
        return;
    }

    const newProfile = {
        name: nameVal,
        email: emailVal,
        phone: cleanPhone
    };

    const submitBtn = $("#profileCreateForm button[type='submit']");
    const origBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "<span>Creating account in database...</span>";

    try {
        let profile = null;

        // 1. Attempt Backend Database Creation
        try {
            profile = await fetchJson("/profiles", {
                method: "POST",
                body: JSON.stringify(newProfile)
            });
        } catch (apiErr) {
            console.warn("Backend registration attempt:", apiErr.message);
            const errMsg = String(apiErr.message || "");

            // If account already exists with this email or phone in database, log them in!
            if (errMsg.includes("already exists") || errMsg.includes("Conflict") || errMsg.includes("409")) {
                try {
                    showToast("Account already exists with this detail. Logging you in...", true);
                    const existing = await fetchJson(`/profiles/login?identifier=${encodeURIComponent(newProfile.email)}`).catch(() => 
                        fetchJson(`/profiles/login?identifier=${encodeURIComponent(newProfile.phone)}`)
                    );
                    if (existing) {
                        saveLocalProfile(existing);
                        setProfile(existing);
                        showToast(`Welcome back, ${existing.name}! Logged into your account.`, true);
                        closeModals();
                        return;
                    }
                } catch (loginErr) {}
            }

            // If network error / backend offline, use local resilient store
            if (apiErr.name === "AbortError" || errMsg.includes("Failed to fetch") || errMsg.includes("NetworkError")) {
                const existingLocal = findLocalProfile(newProfile.email) || findLocalProfile(newProfile.phone);
                if (existingLocal) {
                    profile = existingLocal;
                    showToast(`Welcome back, ${existingLocal.name}! Logged into your local account.`, true);
                } else {
                    profile = {
                        id: Date.now(),
                        name: newProfile.name,
                        email: newProfile.email,
                        phone: newProfile.phone
                    };
                    showToast(`Account created successfully! Welcome, ${profile.name}.`, true);
                }
            } else {
                throw apiErr;
            }
        }

        if (profile) {
            saveLocalProfile(profile);
            setProfile(profile);
            showToast(`Account created & signed in! Welcome, ${profile.name}.`, true);
            closeModals();
        }
    } catch (err) {
        errorEl.textContent = err.message || "Could not create account in database. Please verify details.";
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
    }
};

// Logout
$("#logoutButton").onclick = () => {
    state.profile = null;
    localStorage.removeItem("movieverse_profile");
    localStorage.removeItem("bookmyshow_profile");
    updateProfileUI();
    showToast("Signed out successfully.", true);
};

// ======================================================
// BOOKING HISTORY & CANCELLATION
// ======================================================

let bookingHistoryReqSeq = 0;
let isCancellingInProgress = false;

function getCancelledIds() {
    if (!state.profile?.id) return new Set();
    try {
        const arr = JSON.parse(localStorage.getItem(`bms_cancelled_ids_${state.profile.id}`) || "[]");
        return new Set(arr.map(String));
    } catch (e) {
        return new Set();
    }
}

async function loadBookingHistory() {
    if (!state.profile) return;
    const historyContainer = $("#bookingHistory");
    const cancelledIds = getCancelledIds();

    // 1. Gather all local bookings across profile key, master key, default key, and active memory
    const localBookingsMap = new Map();
    const addBookingToMap = (b) => {
        if (!b || (!b.id && !b.movieTitle)) return;
        const sId = String(b.id || `loc_${b.movieTitle}_${parseSeatLabels(b.seatLabel).join('_')}`);
        if (localBookingsMap.has(sId)) {
            const existing = localBookingsMap.get(sId);
            localBookingsMap.set(sId, { ...existing, ...b });
        } else {
            localBookingsMap.set(sId, b);
        }
    };

    try {
        const pBookings = JSON.parse(localStorage.getItem(`bms_bookings_${state.profile.id}`) || "[]");
        if (Array.isArray(pBookings)) pBookings.forEach(addBookingToMap);
    } catch (e) {}

    try {
        const mBookings = JSON.parse(localStorage.getItem("bms_master_bookings") || "[]");
        if (Array.isArray(mBookings)) mBookings.forEach(addBookingToMap);
    } catch (e) {}

    try {
        const defBookings = JSON.parse(localStorage.getItem("bms_bookings_default") || "[]");
        if (Array.isArray(defBookings)) defBookings.forEach(addBookingToMap);
    } catch (e) {}

    if (Array.isArray(activeBookingsList)) {
        activeBookingsList.forEach(addBookingToMap);
    }

    const localBookings = Array.from(localBookingsMap.values());

    // Instant 0ms render from local bookings with cancelled IDs applied
    const initialList = localBookings.map(b => cancelledIds.has(String(b.id)) ? { ...b, status: "CANCELLED" } : b);
    renderBookingCards(initialList);

    // Track request sequence to prevent background race condition from resetting cancelled status
    const reqSeq = ++bookingHistoryReqSeq;

    // 2. Fetch backend bookings and merge seamlessly with rich local data
    try {
        const backendBookings = await fetchJson(`/profiles/${state.profile.id}/bookings`);
        
        // Discard response if another action happened in the meantime
        if (reqSeq !== bookingHistoryReqSeq) {
            return;
        }

        const list = Array.isArray(backendBookings) ? backendBookings : [];
        const freshCancelledIds = getCancelledIds();

        const combined = [];
        const processBooking = (b) => {
            if (!b) return;
            const isCancelled = b.status === "CANCELLED" || freshCancelledIds.has(String(b.id));
            const status = isCancelled ? "CANCELLED" : (b.status || "CONFIRMED");
            const cleanB = { ...b, status };

            const bId = String(cleanB.id || "");
            const bSeats = parseSeatLabels(cleanB.seatLabel).sort().join(",");
            const bMovie = normalizeStr(cleanB.movieTitle);

            const existingIdx = combined.findIndex(item => {
                const iId = String(item.id || "");
                if (bId && iId && bId === iId) return true;

                const iSeats = parseSeatLabels(item.seatLabel).sort().join(",");
                const iMovie = normalizeStr(item.movieTitle);

                // Match if same movie & same seats
                if (bMovie && iMovie && bMovie === iMovie && bSeats && iSeats && bSeats === iSeats) {
                    return true;
                }
                return false;
            });

            if (existingIdx !== -1) {
                const existing = combined[existingIdx];
                const cancelled = existing.status === "CANCELLED" || status === "CANCELLED" ||
                                  freshCancelledIds.has(String(existing.id)) || freshCancelledIds.has(String(cleanB.id));

                let finalId = existing.id;
                if (Number(cleanB.id) < 1000000 && Number(cleanB.id) > 0) {
                    finalId = cleanB.id;
                }

                combined[existingIdx] = {
                    ...cleanB,
                    ...existing,
                    id: finalId,
                    status: cancelled ? "CANCELLED" : "CONFIRMED",
                    theatreName: existing.theatreName || cleanB.theatreName || cleanB.threatreName || existing.threatreName || "PVR: City Mall",
                    theatreCity: existing.theatreCity || cleanB.theatreCity || $("#citySelect")?.value || "Nashik",
                    showtime: existing.showtime || cleanB.showtime || (cleanB.startsAt ? formatTime(cleanB.startsAt) : "") || "10:15 AM",
                    showDate: existing.showDate || cleanB.showDate || formatBookingDate(cleanB.bookedAt || existing.bookedAt),
                    screen: existing.screen || cleanB.screen || "Audi 2 (Dolby Atmos)",
                    movieMeta: existing.movieMeta || cleanB.movieMeta || "Hindi • 2D • U/A",
                    seatLabel: parseSeatLabels(existing.seatLabel).length > 0 ? parseSeatLabels(existing.seatLabel) : parseSeatLabels(cleanB.seatLabel),
                    totalAmount: existing.totalAmount || cleanB.totalAmount || 0,
                    ticketCode: existing.ticketCode || cleanB.ticketCode || `MV-${String(finalId).slice(-6)}`
                };

                if (cancelled) {
                    freshCancelledIds.add(String(existing.id));
                    freshCancelledIds.add(String(cleanB.id));
                    freshCancelledIds.add(String(finalId));
                }
                return;
            }

            combined.push(cleanB);
        };

        list.forEach(processBooking);
        localBookings.forEach(processBooking);

        localStorage.setItem(`bms_cancelled_ids_${state.profile.id}`, JSON.stringify(Array.from(freshCancelledIds)));
        renderBookingCards(combined);
    } catch (err) {
        if (reqSeq === bookingHistoryReqSeq) {
            renderBookingCards(initialList);
        }
    }
}

let activeBookingsList = [];

function formatBookingDate(val) {
    if (!val) return "Today, 26 Oct";
    if (Array.isArray(val)) {
        const [y, m, d] = val;
        return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? "Today, 26 Oct" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
}

function getBookingTimestamp(b) {
    if (!b) return 0;
    if (b.bookedAt) {
        if (Array.isArray(b.bookedAt)) {
            const [y, m, d, hr = 0, min = 0, sec = 0] = b.bookedAt;
            return new Date(y, m - 1, d, hr, min, sec).getTime();
        }
        const t = new Date(b.bookedAt).getTime();
        if (!isNaN(t) && t > 0) return t;
    }
    if (b.createdAt) {
        const t = new Date(b.createdAt).getTime();
        if (!isNaN(t) && t > 0) return t;
    }
    const num = Number(b.id);
    if (!isNaN(num) && num > 0) return num;
    return 0;
}

function openTicketDetailModal(booking) {
    if (!booking) return;
    state.currentModalBooking = booking;

    // If profile modal is open, temporarily hide it and remember to return to it
    const accountModal = $("#accountModal");
    const wasAccountModalOpen = accountModal && !accountModal.hidden && accountModal.style.display !== "none";
    state.returnToAccountModal = wasAccountModalOpen;
    if (wasAccountModalOpen) {
        accountModal.hidden = true;
        accountModal.setAttribute("hidden", "");
        accountModal.style.display = "none";
    }

    const theatre = booking.theatreName || booking.threatreName || "PVR: City Mall";
    const city = booking.theatreCity || booking.city || $("#citySelect")?.value || "Nashik";
    const showtime = booking.showtime || (booking.startsAt ? formatTime(booking.startsAt) : "10:15 AM");
    const showDate = booking.showDate || formatBookingDate(booking.bookedAt);
    const screen = booking.screen || "Audi 2 (Dolby Atmos)";
    const seatArr = parseSeatLabels(booking.seatLabel);
    const seats = seatArr.length > 0 ? seatArr.join(", ") : "A1";
    const ticketCode = booking.ticketCode || `MV-${String(booking.id).slice(-6) || "849201"}`;
    const isConfirmed = (booking.status || "CONFIRMED").toUpperCase() === "CONFIRMED";

    $("#ticketMovieTitle").textContent = booking.movieTitle || "Movie";
    $("#ticketMovieMeta").textContent = booking.movieMeta || "Hindi, Tamil • 2D • U/A";
    $("#ticketTheatreName").textContent = theatre;
    $("#ticketCityName").textContent = city;
    $("#ticketShowtime").textContent = showtime;
    $("#ticketShowDate").textContent = showDate;
    $("#ticketSeats").textContent = seats;
    $("#ticketScreen").textContent = screen;
    $("#ticketTotalAmount").textContent = formatMoney(booking.totalAmount);
    $("#ticketBookingCode").textContent = ticketCode;

    const statusBadge = $("#ticketStatusBadge");
    if (statusBadge) {
        statusBadge.textContent = isConfirmed ? "CONFIRMED" : "CANCELLED";
        statusBadge.className = `status-badge ${isConfirmed ? 'confirmed' : 'cancelled'}`;
    }

    // Centered Cancel button inside E-Ticket pass
    const modalCancelBtn = $("#modalCancelTicketBtn");
    if (modalCancelBtn) {
        modalCancelBtn.style.display = isConfirmed ? "inline-flex" : "none";
    }

    const modal = $("#ticketDetailModal");
    if (modal) {
        modal.hidden = false;
        modal.removeAttribute("hidden");
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}

// Unified cancellation engine: handles 1-click execution for all matching seats/records
async function cancelBookingById(bookingId, triggerBtn = null) {
    if (!bookingId || !state.profile?.id) return false;
    if (isCancellingInProgress) return false;

    isCancellingInProgress = true;

    try {
        // Ask confirmation: If YES -> cancel; if NO -> cancel nothing, stay right on My Bookings
        const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
        if (!confirmCancel) {
            if (triggerBtn) {
                triggerBtn.disabled = false;
            }
            return false;
        }

        // IMMEDIATELY INVALIDATE any in-flight background booking history queries!
        bookingHistoryReqSeq++;

        if (triggerBtn) {
            triggerBtn.disabled = true;
            triggerBtn.textContent = "Cancelling...";
        }

        const localBookings = JSON.parse(localStorage.getItem(`bms_bookings_${state.profile.id}`) || "[]");
        const targetBooking = (activeBookingsList || []).find(b => String(b.id) === String(bookingId)) ||
                              localBookings.find(b => String(b.id) === String(bookingId)) ||
                              (state.currentModalBooking && String(state.currentModalBooking.id) === String(bookingId) ? state.currentModalBooking : null);

        const matchingIds = new Set([String(bookingId)]);

        // 1. Release seats immediately
        if (targetBooking) {
            const showId = targetBooking.showId || targetBooking.ShowId || targetBooking.show?.id || state.selectedShow?.id;
            const seats = parseSeatLabels(targetBooking.seatLabel);
            if (seats.length > 0) {
                releaseSeats(showId, seats, targetBooking.movieTitle, targetBooking.showtime, targetBooking.theatreCity);
            }

            // Cancel any duplicate records for the exact same seats
            const targetMovie = normalizeStr(targetBooking.movieTitle);
            const targetSeatsSet = new Set(seats);

            (activeBookingsList || []).forEach(b => {
                const bMovie = normalizeStr(b.movieTitle);
                const bSeats = parseSeatLabels(b.seatLabel);
                const sameMovie = targetMovie && bMovie && targetMovie === bMovie;
                const sameSeats = bSeats.length > 0 && bSeats.every(s => targetSeatsSet.has(s)) && targetSeatsSet.size === bSeats.length;
                if (sameMovie && sameSeats) {
                    matchingIds.add(String(b.id));
                }
            });

            localBookings.forEach(b => {
                const bMovie = normalizeStr(b.movieTitle);
                const bSeats = parseSeatLabels(b.seatLabel);
                const sameMovie = targetMovie && bMovie && targetMovie === bMovie;
                const sameSeats = bSeats.length > 0 && bSeats.every(s => targetSeatsSet.has(s)) && targetSeatsSet.size === bSeats.length;
                if (sameMovie && sameSeats) {
                    matchingIds.add(String(b.id));
                }
            });
        }

        // 2. Persist cancelled IDs in localStorage so backend never reverts them
        const cancelledIds = getCancelledIds();
        matchingIds.forEach(id => cancelledIds.add(String(id)));
        localStorage.setItem(`bms_cancelled_ids_${state.profile.id}`, JSON.stringify(Array.from(cancelledIds)));

        // 3. Update localBookings storage
        const updatedLocal = localBookings.map(b => matchingIds.has(String(b.id)) ? { ...b, status: "CANCELLED" } : b);
        localStorage.setItem(`bms_bookings_${state.profile.id}`, JSON.stringify(updatedLocal));

        try {
            const masterBookings = JSON.parse(localStorage.getItem("bms_master_bookings") || "[]");
            const updatedMaster = masterBookings.map(b => matchingIds.has(String(b.id)) ? { ...b, status: "CANCELLED" } : b);
            localStorage.setItem("bms_master_bookings", JSON.stringify(updatedMaster));
        } catch (e) {}

        // 4. Instantly update activeBookingsList and re-render cards in 0ms (1-click guaranteed!)
        if (Array.isArray(activeBookingsList)) {
            activeBookingsList = activeBookingsList.map(b => matchingIds.has(String(b.id)) ? { ...b, status: "CANCELLED" } : b);
            renderBookingCards(activeBookingsList);
        }

        // 5. Update E-Ticket modal if open
        if (state.currentModalBooking && matchingIds.has(String(state.currentModalBooking.id))) {
            state.currentModalBooking.status = "CANCELLED";
            const statusBadge = $("#ticketStatusBadge");
            if (statusBadge) {
                statusBadge.textContent = "CANCELLED";
                statusBadge.className = "status-badge cancelled";
            }
            const modalCancelBtn = $("#modalCancelTicketBtn");
            if (modalCancelBtn) modalCancelBtn.style.display = "none";
        }

        showToast("Booking cancelled & seats released immediately!", true);

        // 6. Refresh shows & seat map cache so seats immediately turn green in 0ms
        if (typeof showsCache !== "undefined") {
            for (let k in showsCache) delete showsCache[k];
        }
        loadShows();

        // 7. Send backend cancellation asynchronously in the background
        matchingIds.forEach(id => {
            try {
                fetchJson(`/bookings/${id}/cancel`, {
                    method: "POST",
                    body: JSON.stringify(state.profile.id)
                }).catch(() => {});
            } catch (err) {}
        });

        return true;
    } finally {
        setTimeout(() => {
            isCancellingInProgress = false;
        }, 400);
    }
}

function renderBookingCards(list) {
    const historyContainer = $("#bookingHistory");
    if (!historyContainer) return;

    if (!Array.isArray(list) || !list.length) {
        historyContainer.innerHTML = `<div class="empty-state">No bookings found in your account.</div>`;
        return;
    }

    // Always keep the latest (newest) booking at the very top of My Bookings
    const validList = list.filter(b => b && (b.movieTitle || b.id));
    if (!validList.length) {
        historyContainer.innerHTML = `<div class="empty-state">No bookings found in your account.</div>`;
        return;
    }

    const sortedList = [...validList].sort((a, b) => {
        const timeA = getBookingTimestamp(a);
        const timeB = getBookingTimestamp(b);
        if (timeB !== timeA) return timeB - timeA;
        return (Number(b.id) || 0) - (Number(a.id) || 0); // Newest first
    });

    activeBookingsList = sortedList;

    historyContainer.innerHTML = sortedList.map((b, idx) => {
        const seatArr = parseSeatLabels(b.seatLabel);
        const seats = seatArr.length > 0 ? seatArr.join(", ") : "A1";
        const isConfirmed = (b.status || "CONFIRMED").toUpperCase() === "CONFIRMED";
        const theatre = b.theatreName || b.threatreName || "PVR: City Mall";
        const city = b.theatreCity || b.city || $("#citySelect")?.value || "Nashik";
        const showtime = b.showtime || (b.startsAt ? formatTime(b.startsAt) : "10:15 AM");
        const showDate = b.showDate || formatBookingDate(b.bookedAt);
        const screen = b.screen || "Audi 2 (Dolby Atmos)";

        return `
            <div class="booking-ticket-card" id="bookingCard-${idx}">
                <div class="ticket-header">
                    <strong>${escapeHtml(b.movieTitle || "Movie")}</strong>
                    <span class="status-badge ${isConfirmed ? 'confirmed' : 'cancelled'}">
                        ${escapeHtml(isConfirmed ? "CONFIRMED" : "CANCELLED")}
                    </span>
                </div>
                <div class="ticket-location-row">
                    <span class="ticket-theatre-text">📍 ${escapeHtml(theatre)}${city ? ', ' + escapeHtml(city) : ''}</span>
                </div>
                <div class="ticket-info-grid">
                    <div class="ticket-info-item">
                        <span class="ticket-label">SHOWTIME</span>
                        <span class="ticket-value">🕒 ${escapeHtml(showtime)}</span>
                    </div>
                    <div class="ticket-info-item">
                        <span class="ticket-label">DATE</span>
                        <span class="ticket-value">📅 ${escapeHtml(showDate)}</span>
                    </div>
                    <div class="ticket-info-item">
                        <span class="ticket-label">SEATS</span>
                        <span class="ticket-value">🎟️ ${escapeHtml(seats)} <small style="color:var(--text-muted);">(${escapeHtml(screen)})</small></span>
                    </div>
                    <div class="ticket-info-item">
                        <span class="ticket-label">TOTAL PAID</span>
                        <span class="ticket-value-price">${formatMoney(b.totalAmount)}</span>
                    </div>
                </div>

                <div class="ticket-card-actions-centered">
                    <button class="btn-view-ticket" data-booking-index="${idx}" type="button">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M7 15h0"></path><path d="M12 15h0"></path></svg>
                        <span>View E-Ticket Details</span>
                    </button>
                    ${isConfirmed ? `
                        <button class="btn-cancel-ticket btn-cancel-centered" data-booking-id="${b.id}" type="button">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            <span>Cancel Ticket</span>
                        </button>
                    ` : `
                        <span class="cancelled-badge-pill">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line></svg>
                            <span>Cancelled</span>
                        </span>
                    `}
                </div>
            </div>
        `;
    }).join("");

    // Open digital E-Ticket on clicking View E-Ticket Details
    document.querySelectorAll(".btn-view-ticket").forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const idx = Number(btn.dataset.bookingIndex);
            if (activeBookingsList[idx]) {
                openTicketDetailModal(activeBookingsList[idx]);
            }
        };
    });
}

// ======================================================
// MODAL CLOSE & OVERLAYS
// ======================================================

function closeModals() {
    const modals = [$("#bookingModal"), $("#customerModal"), $("#accountModal"), $("#movieDetailModal"), $("#ticketDetailModal")];
    modals.forEach(m => {
        if (m) {
            m.hidden = true;
            m.style.display = "none";
        }
    });
    document.body.style.overflow = "";
}

$("#closeModalButton").onclick = closeModals;
$("#closeCustomerButton").onclick = closeModals;
$("#closeAccountButton").onclick = closeModals;

const closeDetailBtn = $("#closeDetailButton");
if (closeDetailBtn) {
    closeDetailBtn.onclick = closeModals;
}

document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.onclick = (e) => {
        if (e.target === overlay) closeModals();
    };
});

// ======================================================
// TOAST NOTIFICATIONS
// ======================================================

function showToast(message, isSuccess = true) {
    const toast = $("#successToast");
    const msg = $("#toastMessage");
    msg.textContent = message;

    toast.style.borderColor = isSuccess ? "var(--emerald)" : "var(--brand-red)";
    toast.style.borderLeftColor = isSuccess ? "var(--emerald)" : "var(--brand-red)";
    $(".toast-icon").textContent = isSuccess ? "✓" : "!";
    $(".toast-icon").style.backgroundColor = isSuccess ? "var(--emerald)" : "var(--brand-red)";

    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 4500);
}

// ======================================================
// KEYBOARD SHORTCUTS & EVENT LISTENERS
// ======================================================

$("#searchInput").oninput = () => executeSearch(false);

$("#searchInput").onkeydown = (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        executeSearch(true);
    }
};

const searchSubmitBtn = $("#searchButton");
if (searchSubmitBtn) {
    searchSubmitBtn.onclick = () => executeSearch(true);
}

$("#citySelect").onchange = () => {
    const selectedCity = $("#citySelect").value;
    const nowShowingCityLabel = $("#nowShowingCityLabel");
    if (nowShowingCityLabel) {
        nowShowingCityLabel.textContent = selectedCity;
    }
    const currentCityLabel = $("#currentCityLabel");
    if (currentCityLabel) {
        currentCityLabel.textContent = selectedCity;
    }
    // Hero carousel is untouched - maintains smooth rotation!
    loadShows();
};

$("#profileButton").onclick = openAccountModal;

// Movie Filter Pills
document.querySelectorAll(".filter-pill").forEach(pill => {
    pill.onclick = () => {
        state.activeFilter = pill.dataset.filter;
        document.querySelectorAll(".filter-pill").forEach(p => p.classList.toggle("active", p === pill));
        executeSearch(false);
    };
});

// Shortcut Key '/' for Search, 'Esc' to Close Modals
window.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== $("#searchInput")) {
        e.preventDefault();
        $("#searchInput").focus();
    } else if (e.key === "Escape") {
        closeModals();
    }
});

// ======================================================
// APP INITIALIZATION
// ======================================================

// Pre-warm dynamic shows for all cities so city switching is instant 0ms
["Nashik", "Bengaluru", "Mumbai", "Delhi"].forEach(city => {
    const key = `${city}_${state.selectedDate}`;
    if (!showsCache[key]) {
        showsCache[key] = generateDynamicShows(city, state.selectedDate);
    }
});

updateProfileUI();
renderDates();
renderHero(false);
startHeroAutoRotate();
loadMovies();
loadShows();



// ======================================================
// BULLETPROOF TICKET MODAL HANDLERS (Direct & Delegated)
// ======================================================

function closeTicketModalOnly() {
    const modal = document.getElementById("ticketDetailModal");
    if (modal) {
        modal.hidden = true;
        modal.setAttribute("hidden", "");
        modal.style.display = "none";
    }
    if (state.returnToAccountModal) {
        state.returnToAccountModal = false;
        openAccountModal();
    } else {
        document.body.style.overflow = "";
    }
}

// Global click delegation guarantees every button click always fires
document.addEventListener("click", (e) => {
    const target = e.target;
    
    // Close / Done button
    // Modal Cancel button inside E-Ticket pass
    if (target.closest("#modalCancelTicketBtn")) {
        e.preventDefault();
        e.stopPropagation();
        if (state.currentModalBooking) {
            cancelBookingById(state.currentModalBooking.id, target.closest("#modalCancelTicketBtn"));
        }
        return;
    }

    // Delegated cancel button (1-click guaranteed execution!)
    const cancelCardBtn = target.closest(".btn-cancel-ticket");
    if (cancelCardBtn) {
        e.preventDefault();
        e.stopPropagation();
        const bookingId = cancelCardBtn.dataset.bookingId;
        if (bookingId) {
            cancelBookingById(bookingId, cancelCardBtn);
        }
        return;
    }

    if (target.closest("#closeTicketButton") || target.closest("#closeTicketDoneBtn")) {
        e.preventDefault();
        e.stopPropagation();
        closeTicketModalOnly();
        return;
    }
    
    // My Bookings button
    if (target.closest("#viewAllBookingsBtn")) {
        e.preventDefault();
        e.stopPropagation();
        closeTicketModalOnly();
        state.returnToAccountModal = false;
        openAccountModal();
        return;
    }
    
    // Clicking on modal background overlay to close
    if (target.id === "ticketDetailModal") {
        closeTicketModalOnly();
        return;
    }
});

// Escape key to close modal
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        const modal = document.getElementById("ticketDetailModal");
        if (modal && !modal.hidden && modal.style.display !== "none") {
            closeTicketModalOnly();
        }
    }
});

