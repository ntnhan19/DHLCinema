const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');

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
                create: { id: genre.id, name: genre.name } // Force ID to match TMDb if possible, but auto-increment might conflict. 
                // Wait, if id is autoincrement, providing id might work or throw error. Better to just use name as unique.
            }).catch(async (e) => {
                // If ID conflict, just create without ID
                await prisma.genre.upsert({
                    where: { name: genre.name },
                    update: {},
                    create: { name: genre.name }
                });
            });
        }
        
        console.log("[TMDb Sync] Đồng bộ thể loại thành công!");
        
        // Trả về map để dễ tìm id thật trong DB
        const allGenres = await prisma.genre.findMany();
        const genreMap = {};
        allGenres.forEach(g => genreMap[g.name] = g.id);
        
        // Tạo map từ TMDb ID sang DB ID
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
        const nowPlayingMovies = nowPlayingRes.data.results.slice(0, 10); // Lấy 10 phim
        await processMovies(nowPlayingMovies, tmdbGenreMap, true);

        // Xử lý phim Sắp chiếu (Upcoming)
        const upcomingMovies = upcomingRes.data.results.slice(0, 5); // Lấy 5 phim
        await processMovies(upcomingMovies, tmdbGenreMap, false);

        console.log("[TMDb Sync] Hoàn tất đồng bộ dữ liệu phim!");
    } catch (error) {
        console.error("[TMDb Sync] Lỗi khi đồng bộ phim:", error.response?.data || error.stack);
    }
}

async function processMovies(movies, genreMap, isNowPlaying) {
    const now = new Date();
    
    // Lấy danh sách 3 rạp đầu tiên để tạo suất chiếu
    const halls = await prisma.hall.findMany({ take: 3 });

    for (const movie of movies) {
        // Bỏ qua phim không có poster
        if (!movie.poster_path) continue;

        // Map genres
        const movieGenres = (movie.genre_ids || [])
            .map(id => genreMap[id])
            .filter(id => id !== undefined)
            .map(id => ({ id }));

        let releaseDate = new Date(movie.release_date || now);
        
        // Đảm bảo logic releaseDate cho đúng tab:
        // Phim đang chiếu phải có releaseDate <= now
        // Phim sắp chiếu phải có releaseDate > now
        if (isNowPlaying && releaseDate > now) {
            releaseDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Hôm qua
        } else if (!isNowPlaying && releaseDate <= now) {
            releaseDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 ngày sau
        }

        // Upsert Movie
        const savedMovie = await prisma.movie.upsert({
            where: { id: movie.id }, // Dùng luôn ID của TMDb cho tiện
            update: {
                title: movie.title,
                description: movie.overview || "Đang cập nhật...",
                releaseDate: releaseDate,
                poster: IMAGE_BASE_URL + movie.poster_path,
                bannerImage: movie.backdrop_path ? ORIGINAL_IMAGE_BASE_URL + movie.backdrop_path : null,
                genres: { set: [], connect: movieGenres }
            },
            create: {
                id: movie.id,
                title: movie.title,
                description: movie.overview || "Đang cập nhật...",
                releaseDate: releaseDate,
                poster: IMAGE_BASE_URL + movie.poster_path,
                bannerImage: movie.backdrop_path ? ORIGINAL_IMAGE_BASE_URL + movie.backdrop_path : null,
                duration: 120, // Fake duration
                genres: { connect: movieGenres }
            }
        }).catch(async (e) => {
            // Nếu lỗi ID (ví dụ autoincrement conflict), tạo bằng ID tự động
            return await prisma.movie.create({
                data: {
                    title: movie.title,
                    description: movie.overview || "Đang cập nhật...",
                    releaseDate: releaseDate,
                    poster: IMAGE_BASE_URL + movie.poster_path,
                    bannerImage: movie.backdrop_path ? ORIGINAL_IMAGE_BASE_URL + movie.backdrop_path : null,
                    duration: 120,
                    genres: { connect: movieGenres }
                }
            });
        });

        // Xóa suất chiếu cũ (nếu có) để tạo mới cho sạch
        await prisma.showtime.deleteMany({
            where: { movieId: savedMovie.id }
        });

        // Tạo suất chiếu nếu là phim Đang Chiếu
        if (isNowPlaying && halls.length > 0) {
            const showtimesToCreate = [];
            
            // Tạo suất chiếu cho 3 ngày tới
            for (let day = 0; day < 3; day++) {
                const targetDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
                targetDate.setMinutes(0, 0, 0); // Tròn giờ
                
                // 3 suất mỗi ngày vào 10:00, 14:00, 19:00
                const hours = [10, 14, 19];
                
                for (let i = 0; i < hours.length; i++) {
                    const hall = halls[i % halls.length];
                    const startTime = new Date(targetDate);
                    startTime.setHours(hours[i]);
                    
                    const endTime = new Date(startTime);
                    endTime.setHours(startTime.getHours() + 2); // Cộng 2 tiếng

                    showtimesToCreate.push({
                        movieId: savedMovie.id,
                        hallId: hall.id,
                        startTime: startTime,
                        endTime: endTime,
                        price: 80000 + (hours[i] >= 18 ? 10000 : 0) // Tối đắt hơn 10k
                    });
                }
            }

            await prisma.showtime.createMany({
                data: showtimesToCreate
            });
        }
    }
}

const initTMDbSync = () => {
    // Chạy luôn lần đầu tiên
    syncMovies();
    
    // Đặt lịch chạy mỗi ngày lúc 01:00 AM
    cron.schedule('0 1 * * *', () => {
        console.log("[Cronjob] Bắt đầu đồng bộ TMDb API lúc 1AM...");
        syncMovies();
    });
};

module.exports = { initTMDbSync, syncMovies };
