import UserModel from '../models/user-model.js'
import jwt from 'jsonwebtoken';

// CRUD - Create, Read, Update, Delete

// ES6 arrow function format
export const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getUserById = async (req, res) => {
    try {
        // Find a user by MongoDB ID.
        // Password is excluded by the model's select: false setting.
        const user = await UserModel.findById(req.params.id);

        // Return 404 if no matching user exists.
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Return the requested user.
        return res.status(200).json(user);

    } catch (error) {
        // Handle an invalid MongoDB ObjectId.
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

// Create a new user account.
export const createUser = async (req, res) => {
    try {
        // Extract the expected fields from the request body.
        const { name, email, password } = req.body ?? {};

        // Validate the required fields.
        if (
            typeof name !== 'string' ||
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: 'Name, email, and password are required'
            });
        }

        // Create a user using only the permitted fields.
        const newUser = new UserModel({
            name,
            email,
            password
        });

        // Save the user. The pre-save hook hashes the password.
        const savedUser = await newUser.save();

        // Remove the password hash from the response.
        const userResponse = savedUser.toObject();
        delete userResponse.password;

        return res.status(201).json(userResponse);

    } catch (error) {

        // MongoDB duplicate-key error (for example, duplicate email).
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Email address already registered'
            });
        }

        // Handle schema validation errors.
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error('Create user error:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        // Retrieve the user, including the normally hidden password.
        const user = await UserModel.findById(req.params.id)
            .select('+password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Update only the fields explicitly permitted.
        if (req.body.name !== undefined) {
            user.name = req.body.name;
        }

        if (req.body.email !== undefined) {
            user.email = req.body.email;
        }

        // Updating the password through save() triggers bcrypt hashing.
        if (req.body.password !== undefined) {
            user.password = req.body.password;
        }

        // Save changes and execute the pre-save middleware.
        const updatedUser = await user.save();

        // Remove the password hash before sending the response.
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        return res.status(200).json(userResponse);

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Email address already registered'
            });
        }

        console.error('Update user error:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Authenticate a user and generate a JWT.
export const loginUser = async (req, res) => {
    try {
        // Extract the login credentials from the request body.
        const { email, password } = req.body ?? {};

        // Validate the supplied credentials.
        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        // Find the user by email.
        // +password explicitly includes the normally hidden password hash.
        const user = await UserModel.findOne({
            email: email.trim().toLowerCase()
        }).select('+password');

        // Reject an unknown email address.
        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Compare the supplied password with the stored hash.
        const isMatch = await user.comparePassword(password);

        // Reject an incorrect password.
        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Ensure the JWT signing secret is configured.
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');

            return res.status(500).json({
                message: 'Authentication configuration error'
            });
        }

        // Generate a signed JWT containing the user's MongoDB ID.
        const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        // Return the JWT without exposing the password hash.
        return res.status(200).json({
            message: 'Login successful',
            token,
            tokenType: 'Bearer',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};
