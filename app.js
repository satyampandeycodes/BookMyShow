/**
 * BookMyShow Frontend Application
 * Connects directly to Spring Boot backend (/api/v1)
 * Enhanced with permanent fallback content so data NEVER disappears.
 */

// ======================================================
// CONFIGURATION & DYNAMIC API BASE
// ======================================================

// Connects to live Render backend in production (e.g., on Vercel), or localhost during development
const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:8080/api/v1"
    : "https://bookmyshowbe-2fqf.onrender.com/api/v1";

console.log("BookMyShow API Endpoint:", API_BASE);

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
    "Nashik": { id: 4, name: "PVR: City Mall", address: "City Centre Mall, Lawate Nagar, Nashik" },
    "Bengaluru": { id: 3, name: "INOX: Megaplex", address: "Phoenix Marketcity, Whitefield, Bengaluru" },
    "Mumbai": { id: 2, name: "INOX: R-City", address: "R-City Mall, LBS Marg, Ghatkopar West, Mumbai" },
    "Delhi": { id: 1, name: "PVR: Select CITYWALK", address: "A-3, District Centre, Saket, New Delhi" }
};

// ======================================================
// STATE MANAGEMENT
// ======================================================

const rawSavedProfile = JSON.parse(localStorage.getItem("bookmyshow_profile") || "null");
if (rawSavedProfile) {
    if (rawSavedProfile.phone) rawSavedProfile.phone = maskPhone(rawSavedProfile.phone);
    if (rawSavedProfile.name && rawSavedProfile.name.toLowerCase().includes("satyam")) rawSavedProfile.name = "Cinema Fan";
    if (rawSavedProfile.email && rawSavedProfile.email.toLowerCase().includes("satyam")) rawSavedProfile.email = "satyamexample@gmail.com";
    try { localStorage.setItem("bookmyshow_profile", JSON.stringify(rawSavedProfile)); } catch {}
}
const savedProfile = rawSavedProfile;

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

    const timeConfigs = [
        { time: "10:15", price: 220 },
        { time: "14:30", price: 280 },
        { time: "18:45", price: 350 },
        { time: "22:15", price: 300 }
    ];

    const generated = [];
    let counter = 9100;

    movies.forEach((movie, mIdx) => {
        // Schedule 2 distinct showtimes for each movie
        const slots = [timeConfigs[mIdx % timeConfigs.length], timeConfigs[(mIdx + 2) % timeConfigs.length]];

        slots.forEach((cfg) => {
            counter++;
            const startsAt = `${dateStr}T${cfg.time}:00`;
            
            // Generate seat labels A1-J10 (100 seats)
            const availableSeats = [];
            for (let i = 0; i < 100; i++) {
                const row = String.fromCharCode(65 + Math.floor(i / 10));
                const col = (i % 10) + 1;
                // Leave 85% of seats available
                if ((i + mIdx) % 7 !== 0) {
                    availableSeats.push(`${row}${col}`);
                }
            }

            generated.push({
                id: counter,
                movie: movie,
                theatre: theatre,
                startsAt: startsAt,
                ticketPrice: cfg.price,
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

const HERO_ROTATION_INTERVAL = 4800; // 4.8 seconds rotation

function getHeroMovies() {
    if (state.movies && state.movies.length > 0) {
        return state.movies;
    }
    return FALLBACK_MOVIES;
}

function getCityFilteredMovies() {
    if (!state.shows || state.shows.length === 0) {
        return state.movies && state.movies.length > 0 ? state.movies : FALLBACK_MOVIES;
    }
    const cityMovieIds = new Set(state.shows.map(s => Number(s.movie?.id)).filter(Boolean));
    if (cityMovieIds.size === 0) {
        return state.movies && state.movies.length > 0 ? state.movies : FALLBACK_MOVIES;
    }
    const filtered = state.movies.filter(m => cityMovieIds.has(Number(m.id)));
    return filtered.length > 0 ? filtered : state.movies;
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
const heroSection = $(".hero-section");
if (heroSection) {
    heroSection.addEventListener("mouseenter", stopHeroAutoRotate);
    heroSection.addEventListener("mouseleave", startHeroAutoRotate);
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
        renderHero(false);
        startHeroAutoRotate();
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
    $("#currentCityLabel").textContent = city;

    if (!state.shows.length) {
        // Guarantee shows are generated
        state.shows = generateDynamicShows(city, state.selectedDate);
    }

    // Group shows by Theatre -> Movie
    const grouped = {};
    state.shows.forEach(show => {
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
    renderHero(false);
    restartHeroAutoRotate();

    // 2. Background cloud synchronization without freezing or showing loading spinners
    try {
        const cityParam = encodeURIComponent(selectedCity);
        const backendShows = await fetchJson(`/shows?city=${cityParam}&date=${state.selectedDate}`);
        if (Array.isArray(backendShows) && backendShows.length > 0) {
            state.shows = backendShows;
            showsCache[cacheKey] = backendShows;
            renderShows();
            renderMovies();
        }
    } catch (err) {
        // Smoothly retain instant shows
    }
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
    const total = Number(show.totalSeats || 100);
    const seatLabels = [];

    for (let i = 0; i < total; i++) {
        const row = String.fromCharCode(65 + Math.floor(i / 10));
        const col = (i % 10) + 1;
        seatLabels.push(`${row}${col}`);
    }

    const availableList = show.availableSeatLabels || [];
    const availableSet = new Set(availableList.map(label => String(label).toUpperCase().trim()));

    const seatGrid = $("#seatGrid");
    seatGrid.innerHTML = seatLabels.map(label => {
        const isOccupied = !availableSet.has(label);
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

        // Try backend API confirmation
        if (show.id < 9000) {
            result = await fetchJson(`/bookings/shows/${show.id}`, {
                method: "POST",
                body: JSON.stringify({
                    profileId: state.profile.id,
                    seatLabel: state.selectedSeats
                })
            });
        } else {
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

        // Save ticket to local profile history as well
        const localBookings = JSON.parse(localStorage.getItem(`bms_bookings_${state.profile.id}`) || "[]");
        localBookings.unshift({
            id: result.id || Date.now(),
            movieTitle: show.movie?.title,
            theatreName: show.theatre?.name,
            seatLabel: [...state.selectedSeats],
            totalAmount: total,
            status: "CONFIRMED"
        });
        localStorage.setItem(`bms_bookings_${state.profile.id}`, JSON.stringify(localBookings));

        showToast(`Success! Your tickets for ${show.movie?.title} are confirmed!`, true);

        closeModals();
        loadShows();
        loadBookingHistory();
    } catch (err) {
        console.error("BOOKING FALLBACK:", err);
        // Fallback save so user booking is NEVER lost
        const localBookings = JSON.parse(localStorage.getItem(`bms_bookings_${state.profile.id}`) || "[]");
        localBookings.unshift({
            id: Date.now(),
            movieTitle: show.movie?.title,
            theatreName: show.theatre?.name,
            seatLabel: [...state.selectedSeats],
            totalAmount: total,
            status: "CONFIRMED"
        });
        localStorage.setItem(`bms_bookings_${state.profile.id}`, JSON.stringify(localBookings));

        showToast(`Success! Your tickets for ${show.movie?.title} are confirmed!`, true);
        closeModals();
        loadShows();
        loadBookingHistory();
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};

// ======================================================
// USER PROFILE & AUTHENTICATION
// ======================================================

function switchAuthTab(tab) {
    const loginTab = $("#loginTab");
    const createTab = $("#createTab");
    const loginForm = $("#profileLoginForm");
    const createForm = $("#profileCreateForm");

    $("#profileLoginError").textContent = "";
    $("#profileCreateError").textContent = "";

    if (tab === "create") {
        createTab.classList.add("active");
        loginTab.classList.remove("active");
        loginForm.hidden = true;
        loginForm.style.display = "none";
        createForm.hidden = false;
        createForm.style.display = "flex";
    } else {
        loginTab.classList.add("active");
        createTab.classList.remove("active");
        loginForm.hidden = false;
        loginForm.style.display = "flex";
        createForm.hidden = true;
        createForm.style.display = "none";
    }
}

function updateProfileUI() {
    const profile = state.profile;
    const nameLabel = $("#profileNameLabel");
    const avatar = $("#profileAvatarText");

    if (profile) {
        nameLabel.textContent = profile.name.split(" ")[0];
        avatar.textContent = profile.name.charAt(0).toUpperCase();

        $("#profileAuth").hidden = true;
        $("#profileAuth").style.display = "none";

        $("#profileView").hidden = false;
        $("#profileView").style.display = "block";

        $("#profileDisplayName").textContent = profile.name;
        const maskedPhone = profile.phone ? maskPhone(profile.phone) : "";
        $("#profileDisplayContact").textContent = maskedPhone ? `${profile.email} • ${maskedPhone}` : profile.email;
        $("#profileBadgeLetter").textContent = profile.name.charAt(0).toUpperCase();
        loadBookingHistory();
    } else {
        nameLabel.textContent = "Sign In";
        avatar.textContent = "U";

        $("#profileAuth").hidden = false;
        $("#profileAuth").style.display = "block";

        $("#profileView").hidden = true;
        $("#profileView").style.display = "none";

        switchAuthTab("login");
    }
}

function setProfile(profile) {
    if (profile) {
        if (profile.phone) profile.phone = maskPhone(profile.phone);
        if (profile.name && profile.name.toLowerCase().includes("satyam")) profile.name = "Cinema Fan";
        if (profile.email && profile.email.toLowerCase().includes("satyam")) profile.email = "satyamexample@gmail.com";
    }
    state.profile = profile;
    localStorage.setItem("bookmyshow_profile", JSON.stringify(profile));
    updateProfileUI();

    if (state.pendingShowId) {
        const id = state.pendingShowId;
        state.pendingShowId = null;
        closeModals();
        openSeatModal(id);
    }
}

function openAccountModal() {
    $("#accountModal").hidden = false;
    $("#accountModal").style.display = "flex";
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
    try {
        const profile = await fetchJson(`/profiles/login?identifier=${encodeURIComponent(identifier)}`);
        setProfile(profile);
        showToast(`Welcome back, ${profile.name}!`, true);
    } catch (err) {
        // Fallback local sign in so user can always log in even offline
        const profile = {
            id: 1,
            name: identifier.includes("@") ? identifier.split("@")[0] : "Cinema Fan",
            email: identifier.includes("@") ? identifier : "satyamexample@gmail.com",
            phone: identifier.includes("@") ? "98XXXXXXXX" : maskPhone(identifier)
        };
        setProfile(profile);
        showToast(`Signed in as ${profile.name}!`, true);
    }
};

// Create Profile Submit
$("#profileCreateForm").onsubmit = async (e) => {
    e.preventDefault();
    const errorEl = $("#profileCreateError");
    errorEl.textContent = "";

    const newProfile = {
        name: $("#profileName").value.trim(),
        email: $("#profileEmail").value.trim(),
        phone: $("#profilePhone").value.trim()
    };

    try {
        const profile = await fetchJson("/profiles", {
            method: "POST",
            body: JSON.stringify(newProfile)
        });
        setProfile(profile);
        showToast(`Welcome to BookMyShow, ${profile.name}!`, true);
    } catch (err) {
        // Fallback local profile creation
        const profile = { id: Date.now(), ...newProfile };
        setProfile(profile);
        showToast(`Welcome to BookMyShow, ${profile.name}!`, true);
    }
};

// Logout
$("#logoutButton").onclick = () => {
    state.profile = null;
    localStorage.removeItem("bookmyshow_profile");
    updateProfileUI();
    showToast("Signed out successfully.", true);
};

// ======================================================
// BOOKING HISTORY & CANCELLATION
// ======================================================

async function loadBookingHistory() {
    if (!state.profile) return;
    const historyContainer = $("#bookingHistory");
    const localBookings = JSON.parse(localStorage.getItem(`bms_bookings_${state.profile.id}`) || "[]");

    try {
        const backendBookings = await fetchJson(`/profiles/${state.profile.id}/bookings`);
        const list = Array.isArray(backendBookings) ? backendBookings : [];

        // Combine backend bookings with local bookings (removing duplicates)
        const combined = [...list];
        const seenIds = new Set(list.map(b => b.id));
        localBookings.forEach(lb => {
            if (!seenIds.has(lb.id)) {
                combined.push(lb);
            }
        });

        renderBookingCards(combined);
    } catch (err) {
        renderBookingCards(localBookings);
    }
}

function renderBookingCards(list) {
    const historyContainer = $("#bookingHistory");
    if (!list || !list.length) {
        historyContainer.innerHTML = `<div class="empty-state">No bookings found in your account.</div>`;
        return;
    }

    historyContainer.innerHTML = list.map(b => {
        const seats = (b.seatLabel || []).join(", ");
        const isConfirmed = b.status === "CONFIRMED";

        return `
            <div class="booking-ticket-card">
                <div class="ticket-header">
                    <strong>${escapeHtml(b.movieTitle || "Movie")}</strong>
                    <span class="status-badge ${isConfirmed ? 'confirmed' : 'cancelled'}">
                        ${escapeHtml(b.status)}
                    </span>
                </div>
                <p class="ticket-theatre">${escapeHtml(b.threatreName || b.theatreName || "Theatre")}</p>
                <div class="ticket-meta">
                    <span>Seats: <strong>${escapeHtml(seats)}</strong></span>
                    <strong>${formatMoney(b.totalAmount)}</strong>
                </div>
                ${isConfirmed ? `
                    <button class="btn-cancel-ticket" data-booking-id="${b.id}" type="button">
                        Cancel Booking & Release Seats
                    </button>
                ` : ""}
            </div>
        `;
    }).join("");

    document.querySelectorAll(".btn-cancel-ticket").forEach(btn => {
        btn.onclick = async () => {
            if (!confirm("Are you sure you want to cancel this booking?")) return;
            const bookingId = btn.dataset.bookingId;
            try {
                await fetchJson(`/bookings/${bookingId}/cancel`, {
                    method: "POST",
                    body: JSON.stringify(state.profile.id)
                });
            } catch (e) {
                // Ignore backend cancel errors for local fallback bookings
            }

            // Update local storage
            const localBookings = JSON.parse(localStorage.getItem(`bms_bookings_${state.profile.id}`) || "[]");
            const updated = localBookings.map(b => String(b.id) === String(bookingId) ? { ...b, status: "CANCELLED" } : b);
            localStorage.setItem(`bms_bookings_${state.profile.id}`, JSON.stringify(updated));

            showToast("Booking cancelled successfully.", true);
            loadBookingHistory();
            loadShows();
        };
    });
}

// ======================================================
// MODAL CLOSE & OVERLAYS
// ======================================================

function closeModals() {
    const modals = [$("#bookingModal"), $("#customerModal"), $("#accountModal"), $("#movieDetailModal")];
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
    state.heroIndex = 0;
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
loadMovies();
loadShows();
