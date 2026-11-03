import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserModel from '../models/user-model.js';

// Load environment variables.
dotenv.config({ path: './server/.env' });

async function seedAdmin() {
    try {
        const {
            MONGODB_URI,
            ADMIN_NAME,
            ADMIN_EMAIL,
            ADMIN_PASSWORD
        } = process.env;

        // Verify required configuration.
        if (
            !MONGODB_URI ||
            !ADMIN_NAME ||
            !ADMIN_EMAIL ||
            !ADMIN_PASSWORD
        ) {
            throw new Error('Missing administrator configuration');
        }

        // Connect to MongoDB.
        await mongoose.connect(MONGODB_URI);

        // Check whether the account already exists.
        const existingUser = await UserModel.findOne({
            email: ADMIN_EMAIL.trim().toLowerCase()
        });

        if (existingUser) {
            console.log('Account already exists. No changes made.');
            return;
        }

        // Create the administrator.
        const admin = new UserModel({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin'
        });

        // The User model's pre-save hook hashes the password.
        await admin.save();

        console.log('Administrator account created successfully.');

    } catch (error) {
        console.error('Administrator seeding failed:', error.message);
        process.exitCode = 1;

    } finally {
        // Close the MongoDB connection.
        await mongoose.disconnect();
    }
}

seedAdmin();