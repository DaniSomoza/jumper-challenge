import mongoose from 'mongoose'

const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_PORT, MONGO_DB } = process.env

const connectToDatabase = async () => {
  try {
    const connectionString = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@mongo:${MONGO_PORT}/${MONGO_DB}?authSource=admin`

    await mongoose.connect(connectionString)

    console.log('Successfully connected MongoDB database.')
  } catch (error) {
    console.error('Failed to connect', error)
  }
}

export default connectToDatabase
