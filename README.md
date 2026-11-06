### Environment Configuration

The Express backend uses environment variables to configure its MongoDB connection, JWT authentication, and seeded administrator account.

1. Copy `server/.env.example` to `server/.env`.
2. Set `MONGODB_URI` to the MongoDB connection string.
3. Replace `JWT_SECRET` with a secure, randomly generated secret.
4. Configure the seeded administrator account using the following environment variables:

   ```env
   ADMIN_NAME=Administrator
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your-secure-password
   ```

5. Ensure MongoDB is running before starting the application.
6. Run `npm install` in the root, `client`, and `server` directories to install dependencies.
7. From the project root, run `npm run dev` to start the React frontend and Express backend.

The `.env` file is excluded from Git to protect sensitive configuration values.

### Seeded Administrator Account

The application supports a seeded administrator account for managing Projects, Qualifications, and Contacts.

Administrator credentials are configured using the `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` environment variables rather than being hardcoded in the application.

The administrator's password is hashed before being stored in MongoDB.

The administrator account is initialized through the application's administrator seeding process.

Once the administrator account has been initialized, the administrator can:

- Sign in using the configured email address and password.
- Access the protected Administrator Dashboard.
- Create, read, update, and delete Projects and Qualifications.
- View, update, and delete Contact messages.

Administrative API endpoints are protected using JWT authentication and role-based authorization middleware.

Requests without a valid JWT are rejected with HTTP `401 Unauthorized`, while authenticated regular users attempting restricted operations receive HTTP `403 Forbidden`.

### JWT Session Management

After successful sign-in, the application stores authentication information in browser `sessionStorage`.

The JWT is included in authenticated API requests using the `Authorization: Bearer <token>` header.

Signing out removes the authentication information from `sessionStorage`, preventing further use of that session's token by the application.

JWTs already issued by the backend remain cryptographically valid until expiration unless separately revoked or invalidated.