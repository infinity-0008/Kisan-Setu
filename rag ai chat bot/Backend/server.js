require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/db/db');

const port = process.env.PORT || 5000;

const startServer = async () => {
	try {
		await connectDB();

		app.listen(port, () => {
			console.log(`Server running on port ${port}`);
		});
	} catch (error) {
		console.error('Could not start server:', error.message);
		process.exit(1);
	}
};

startServer();
