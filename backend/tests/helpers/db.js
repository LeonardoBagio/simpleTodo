const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function connect() {
	mongoServer = await MongoMemoryServer.create();
	await mongoose.connect(mongoServer.getUri());
}

async function clear() {
	const { collections } = mongoose.connection;
	for (const key of Object.keys(collections)) {
		await collections[key].deleteMany({});
	}
}

async function disconnect() {
	await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
	if (mongoServer) {
		await mongoServer.stop();
	}
}

module.exports = { connect, clear, disconnect };
