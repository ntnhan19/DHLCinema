//backend/src/index.js
const dotenv = require('dotenv');
const { server } = require('./App');
const { initAutoRefresh } = require('./services/autoRefreshData');

dotenv.config();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Initialize auto refresh for showtimes
  initAutoRefresh();
});
