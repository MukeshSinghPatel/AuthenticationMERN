const mongoose = require('mongoose');

const connectDb = async() => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URL}`);
        console.log(`Database connected`);
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

module.exports = connectDb;