import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const connectDB = () => {
	const { MONGO_URI = '', NODE_ENV = '' } = process.env;

	mongoose
		.connect(MONGO_URI, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
			useFindAndModify: false
		})
		.then(() => {
			if (NODE_ENV !== 'test') {
				console.log('MongoDB Connected');
			}
		})
		.catch(err => console.log(err));
};

export default connectDB;
