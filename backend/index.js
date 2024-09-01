import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';
// import app from './app.js';

dotenv.config();

(async () => {
    try {
        // Connect to the database
        await connectDB();

        // Handle errors on the app
        app.on('error', (error) => {
            console.error('Server Error:', error);
            throw error;
        });

        // Set the port from the environment variable or default to 5000
        const PORT = process.env.PORT || 5000;

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Database connection error:', error);
    }
})();
