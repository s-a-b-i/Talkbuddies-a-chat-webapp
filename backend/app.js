// Import the Express framework
import express from 'express';

// Import CORS middleware for handling cross-origin requests
import cors from 'cors';

// Import cookie-parser to parse cookies in requests
import cookieParser from 'cookie-parser';

// Create an instance of an Express application
const app = express();

// Allow requests from a specific origin (set in environment variables) and enable sending cookies and credentials with requests
app.use(cors({
    origin: process.env.CORS_ORIGIN,    
    credentials: true                   
}));

// Parse incoming JSON requests and limit the size to 16kb
app.use(express.json({limit: '16kb'}));

// Parse URL-encoded data (form data), allow nested objects, and limit size to 16kb
app.use(express.urlencoded({extended : true, limit : '16kb'}));

// Serve static files (e.g., HTML, CSS, JS) from the 'public' directory
app.use(express.static('public'));

// Enable cookie parsing to access cookies in requests
app.use(cookieParser());



// Export the Express app for use in other files
export { app };
