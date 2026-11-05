import express from 'express';
import { authenticateToken } from '../middleware/auth-middleware.js';
import { authorizeAdmin } from '../middleware/authorize-admin.js';

import {
    createProject,
    deleteProject,
    getAllProjects,
    getProjectById,
    updateProject
} from '../controllers/projects-controllers.js';

import {
  handleUpload,
  saveProjectImage
} from "../middleware/upload-middleware.js";

// Create an Express router for project-related endpoints.
const router = express.Router();

// READ: Public access.
router.get('/', getAllProjects);
router.get('/:id', getProjectById);

// CREATE: Authentication required.
router.post('/', authenticateToken, authorizeAdmin, createProject);

router.post("/upload", authenticateToken, authorizeAdmin, handleUpload, saveProjectImage);

// UPDATE: Authentication required.
router.put('/:id', authenticateToken, authorizeAdmin, updateProject);

// DELETE: Authentication required.
router.delete('/:id', authenticateToken, authorizeAdmin, deleteProject);

// Export the router for registration in server.js.
export default router;