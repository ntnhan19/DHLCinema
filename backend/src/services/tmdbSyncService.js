const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');
const seatService = require('./seatService'); // Import seatService

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const ORIGINAL_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

// Lấy danh sách thể loại từ TMDb và đồng bộ vào DB
async function syncGenres() {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
            params: { api_key: TMDB_API_KEY, language: 'vi-VN' }
        });
        
        const genres = response.data.genres;
        for (const genre of genres) {
            await prisma.genre.upsert({
                where: { name: genre.name },
                update: {},
                create: { id: genre.id, name: genre.name }
            }).catch(async (e) => {
                await prisma.genre.upsert({
                    where: { name: genre.name },
                    update: {},
                    create: { name: genre.name }
                });
            });
        }
        
        console.log("[TMDb Sync] Đồng bộ thể loại thành công!");
        
        const allGenres = await prisma.genre.findMany();
        const genreMap = {};
        allGenres.forEach(g => genreMap[g.name] = g.id);
        
        const tmdbToDbMap = {};
        genres.forEach(g => {
            tmdbToDbMap[g.id] = genreMap[g.name];
        });
        
        return tmdbToDbMap;
    } catch (error) {
        console.error("[TMDb Sync] Lỗi khi đồng bộ thể loại:", error.response?.data || error.stack);
        return {};
    }
}

async function syncMovies() {
    if (!TMDB_API_KEY) {
        console.error("[TMDb Sync] Thiếu TMDB_API_KEY trong file .env");
        return;
    }

    console.log("[TMDb Sync] Bắt đầu đồng bộ phim từ TMDb...");
    try {
        const tmdbGenreMap = await syncGenres();

        // 1. Fetch Now Playing
        const nowPlayingRes = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
            params: { api_key: TMDB_API_KEY, language: 'vi-VN', page: 1, region: 'VN' }
        });
        
        // 2. Fetch Upcoming
        const upcomingRes = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
            params: { api_key: TMDB_API_KEY, language: 'vi-VN', page: 1, region: 'VN' }
        });

        // Xử lý phim Đang chiếu (Now Playing)
        const nowPlayingMovies = nowPlayingRes.data.results.slice(0, 10);
        await processMovies(nowPlayingMovies, tmdbGenreMap, true);

        // Xử lý phim Sắp chiếu (Upcoming)
        const upcomingMovies = upcomingRes.data.results.slice(0, 5);
        await processMovies(upcomingMovies, tmdbGenreMap, false);

        // Dọn dẹp dữ liệu cũ (Xóa suất chiếu/phim quá hạn)
        await cleanupOldData();

        console.log("[TMDb Sync] Hoàn tất đồng bộ dữ liệu phim!");
    } catch (error) {
        console.error("[TMDb Sync] Lỗi khi đồng bộ phim:", error.response?.data || error.stack);
    }
}

async function cleanupOldData() {
    console.log("[TMDb Sync] Bắt đầu dọn dẹp dữ liệu cũ...");
    const now = new Date();
    // Giữ lại dữ liệu 7 ngày qua, xóa những gì cũ hơn
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    try {
        // 1. Tìm các suất chiếu đã kết thúc trước 7 ngày trước
        const oldShowtimes = await prisma.showtime.findMany({
            where: { endTime: { lt: sevenDaysAgo } }
        });

        if (oldShowtimes.length > 0) {
            const oldShowtimeIds = oldShowtimes.map(st => st.id);
            
            // Xóa Ticket liên quan (nếu có)
            await prisma.ticket.deleteMany({
                where: { showtimeId: { in: oldShowtimeIds } }
            });

            // Xóa Ghế
            await prisma.seat.deleteMany({
                where: { showtimeId: { in: oldShowtimeIds } }
            });

            // Xóa Suất chiếu
            await prisma.showtime.deleteMany({
                where: { id: { in: oldShowtimeIds } }
            });
            console.log(`[TMDb Sync] Đã xóa ${oldShowtimes.length} suất chiếu cũ và dữ liệu liên quan.`);
        }

        // 2. Xóa các Phim cũ (Release trước đây 30 ngày) MÀ KHÔNG CÒN suất chiếu nào
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const oldMovies = await prisma.movie.findMany({
            where: {
                releaseDate: { lt: thirtyDaysAgo },
                showtimes: { none: {} } // Không có suất chiếu nào liên kết
            }
        });

        if (oldMovies.length > 0) {
            const oldMovieIds = oldMovies.map(m => m.id);
            
            // Đảm bảo không xóa phim nếu có Reviews (xóa review trước)
            await prisma.review.deleteMany({
                where: { movieId: { in: oldMovieIds } }
            });

            await prisma.movie.deleteMany({
                where: { id: { in: oldMovieIds } }
            });
            console.log(`[TMDb Sync] Đã xóa ${oldMovies.length} phim cũ không còn chiếu.`);
        }
        
    } catch (error) {
        console.error("[TMDb Sync] Lỗi khi dọn dẹp:", error.message);
    }
}

async function processMovies(movies, genreMap, isNowPlaying) {
    const now = new Date();
    const halls = await prisma.hall.findMany({ take: 3 });

    for (const movie of movies) {
        if (!movie.poster_path) continue;

        // Fetch thêm chi tiết (đạo diễn, diễn viên, trailer)
        let director = "Đang cập nhật";
        let mainActors = "Đang cập nhật";
        let trailerUrl = null;
        let duration = 120;

        try {
            const detailsRes = await axios.get(`${TMDB_BASE_URL}/movie/${movie.id}`, {
                params: { api_key: TMDB_API_KEY, language: 'vi-VN', append_to_response: 'credits,videos' }
            });
            const details = detailsRes.data;
            
            duration = details.runtime || 120;
            
            if (details.credits && details.credits.crew) {
                const dir = details.credits.crew.find(c => c.job === 'Director');
                if (dir) director = dir.name;
            }
            if (details.credits && details.credits.cast) {
                mainActors = details.credits.cast.slice(0, 4).map(c => c.name).join(', ') || "Đang cập nhật";
            }
            if (details.videos && details.videos.results) {
                const trailer = details.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');
                if (trailer) trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
            }
        } catch (err) {
            console.error(`[TMDb Sync] Lỗi khi lấy chi tiết phim ${movie.id}`);
        }

        const movieGenres = (movie.genre_ids || [])
            .map(id => genreMap[id])
            .filter(id => id !== undefined)
            .map(id => ({ id }));

        let releaseDate = new Date(movie.release_date || now);
        
        if (isNowPlaying && releaseDate > now) {
            releaseDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        } else if (!isNowPlaying && releaseDate <= now) {
            releaseDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        }

        const movieData = {
            title: movie.title,
            description: movie.overview || "Đang cập nhật...",
            releaseDate: releaseDate,
            poster: IMAGE_BASE_URL + movie.poster_path,
            bannerImage: movie.backdrop_path ? ORIGINAL_IMAGE_BASE_URL + movie.backdrop_path : null,
            duration: duration,
            director: director,
            mainActors: mainActors,
            trailerUrl: trailerUrl,
        };

        const savedMovie = await prisma.movie.upsert({
            where: { id: movie.id },
            update: {
                ...movieData,
                genres: { set: [], connect: movieGenres }
            },
            create: {
                id: movie.id,
                ...movieData,
                genres: { connect: movieGenres }
            }
        }).catch(async (e) => {
            return await prisma.movie.create({
                data: {
                    ...movieData,
                    genres: { connect: movieGenres }
                }
            });
        });

        // Xóa suất chiếu & Ghế cũ để tránh quá tải DB
        const oldShowtimes = await prisma.showtime.findMany({ where: { movieId: savedMovie.id } });
        for (const st of oldShowtimes) {
            await prisma.seat.deleteMany({ where: { showtimeId: st.id } });
        }
        await prisma.showtime.deleteMany({
            where: { movieId: savedMovie.id }
        });

        // Tạo suất chiếu VÀ GHẾ nếu là phim Đang Chiếu
        if (isNowPlaying && halls.length > 0) {
            for (let day = 0; day < 3; day++) {
                const targetDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
                targetDate.setMinutes(0, 0, 0);
                
                const hours = [10, 14, 19];
                
                for (let i = 0; i < hours.length; i++) {
                    const hall = halls[i % halls.length];
                    const startTime = new Date(targetDate);
                    startTime.setHours(hours[i]);
                    
                    const endTime = new Date(startTime);
                    endTime.setMinutes(startTime.getMinutes() + duration);

                    // 1. Tạo showtime
                    const showtime = await prisma.showtime.create({
                        data: {
                            movieId: savedMovie.id,
                            hallId: hall.id,
                            startTime: startTime,
                            endTime: endTime,
                            price: 80000 + (hours[i] >= 18 ? 10000 : 0)
                        }
                    });

                    // 2. TẠO GHẾ (CRITICAL FIX)
                    await seatService.generateSeats(showtime.id, hall);
                }
            }
        }
    }
}

const initTMDbSync = () => {
    syncMovies();
    cron.schedule('0 1 * * *', () => {
        console.log("[Cronjob] Bắt đầu đồng bộ TMDb API lúc 1AM...");
        syncMovies();
    });
};

module.exports = { initTMDbSync, syncMovies };
