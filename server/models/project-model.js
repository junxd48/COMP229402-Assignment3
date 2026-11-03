import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        // The title of the portfolio project
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        // Image path used by the React Projects page.
        image: {
            type: String,
            trim: true
        },

        // Role performed in the project.
        role: {
            type: String,
            trim: true
        },

        // Project outcome or result.
        outcome: {
            type: String,
            trim: true
        },
        
        // Optional project start date.
        startDate: {
            type: Date
        },

        // Optional project end date.
        endDate: {
            type: Date
        },

        // Date the project was completed.
        completionDate: {
            type: Date,
            required: true
        }
    },
    {
        // Automatically maintain createdAt and updatedAt.
        timestamps: true
    }
);

export default mongoose.model("Project", projectSchema);

