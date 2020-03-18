import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const connectDB = () => {
	const { MONGO_URI = '' } = process.env;
	mongoose
		.connect(MONGO_URI, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true
		})
		.then(() => {
			console.log('MongoDB Connected');
		})
		.catch(err => console.log(err));
};

export default connectDB;
