const app = require('./app');
/* const { connectDB } = require('./config/db');
const { initQueues } = require('./services/bullQueue'); */

/* connectDB();
initQueues(); */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
