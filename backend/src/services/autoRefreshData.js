const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');

const runAutoRefresh = async () => {
    try {
        console.log("[Auto-Refresh] Checking showtime data...");
        
        const now = new Date();
        
        // 1. Check if there is any showtime in the future
        const futureShowtime = await prisma.showtime.findFirst({
            where: { startTime: { gte: now } }
        });
        
        if (futureShowtime) {
            console.log("[Auto-Refresh] Data is up to date. Skipping refresh.");
            return; 
        }
        
        console.log("[Auto-Refresh] All showtimes are in the past. Starting data refresh...");
        
        // 2. Find the latest showtime
        const latestShowtime = await prisma.showtime.findFirst({
            orderBy: { startTime: 'desc' }
        });
        
        if (!latestShowtime) {
            console.log("[Auto-Refresh] No showtimes found in the database to refresh.");
            return;
        }

        // 3. Calculate days to shift (Current time - Latest showtime + 15 days for a 2-week buffer)
        const diffTime = now.getTime() - latestShowtime.startTime.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 15;
        
        // 4. Update all showtimes using PostgreSQL interval
        await prisma.$executeRawUnsafe(`UPDATE "Showtime" SET "startTime" = "startTime" + interval '${diffDays} days', "endTime" = "endTime" + interval '${diffDays} days'`);
        
        console.log(`[Auto-Refresh] Success! Shifted all showtimes forward by ${diffDays} days.`);
    } catch (error) {
        console.error("[Auto-Refresh] Error during data refresh:", error);
    }
};

const initAutoRefresh = () => {
    // Run immediately when the server starts
    runAutoRefresh();
    
    // Schedule a cron job to run every day at midnight (00:00)
    cron.schedule('0 0 * * *', () => {
        console.log("[Cronjob] Running midnight data refresh...");
        runAutoRefresh();
    });
};

module.exports = { initAutoRefresh, runAutoRefresh };
