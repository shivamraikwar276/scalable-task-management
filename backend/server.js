require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[server] Listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
})();
