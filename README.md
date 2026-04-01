# Krypt Secure File Sharing

Krypt is a secure file sharing web application built with Node.js, Express, React, TypeScript, and SQLite. It allows users to register, log in, upload files, share files with other users, download files, and track activity logs. Files are encrypted automatically before storage to provide secure handling.

## Features

- User registration and login
- Secure session-based authentication
- Automatic file encryption during upload
- Download original decrypted files
- Download encrypted `.enc` files
- Share files with other registered users
- View files shared with you
- Activity logs for login, upload, download, and sharing actions
- Clean modern dashboard UI

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express
- Database: SQLite
- Encryption: AES-256-GCM
- Styling: Custom CSS

## Project Structure

```bash
file sharing and authentication/
|
|-- frontend/                 # React frontend
|-- public/                   # Express backend files
|-- uploads/                  # Stored encrypted uploaded files
|-- app_data.db               # SQLite database
|-- SETUP_STEPS.txt           # Setup guide
|-- PRD_Secure_File_Sharing.md
|-- package.json
|-- view_db.js                # Utility to inspect database data
```

## How It Works

1. A user registers and logs in.
2. When a file is uploaded, the backend automatically encrypts it.
3. The encrypted file is stored on the server.
4. The owner can share the file with another registered user.
5. Users can:
   - download the normal decrypted file
   - download the encrypted `.enc` version
6. All important actions are recorded in activity logs.

## Setup

### 1. Open terminal in the project folder

```bash
cd "d:\Cyber security project\file sharing and authentication"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the frontend

```bash
npm run client:build
```

### 4. Start the application

```bash
npm start
```

### 5. Open in browser

```bash
http://127.0.0.1:5000
```

## Demo Flow

1. Register two users
2. Log in with the first user
3. Upload a file
4. Share the file with the second user
5. Log in with the second user
6. View the shared file
7. Download the file normally
8. Download the encrypted `.enc` file
9. Open logs to see recorded actions

## Encrypted File Support

The application provides two download options:

- `Download`: downloads the original decrypted file
- `Download Encrypted`: downloads the encrypted file in `.enc` format

### How to inspect the encrypted file

You can open the `.enc` file using:

- VS Code
- Notepad++
- HxD (recommended on Windows for hex view)

The encrypted file will appear unreadable, which is expected because it is protected binary data.

## Notes

- Files are encrypted automatically by the backend before storage.
- Encrypted files are stored in the `uploads` folder.
- SQLite database data is stored locally in `app_data.db`.
- Activity logs help track important user actions.

## Deploy On Render

This project is ready for Render using the included `render.yaml`.

### What Render needs

- A Node web service
- A persistent disk for:
  - the SQLite database
  - uploaded encrypted files

### Deploy steps

1. Push this project to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Connect your GitHub repository.
4. Render will detect `render.yaml` automatically.
5. Deploy the service.

### Render configuration included

- Build command: `npm install && npm run client:build`
- Start command: `npm start`
- Persistent disk mounted at `/opt/render/project/data`
- `DATA_DIR` environment variable set automatically
- `SESSION_SECRET` generated automatically

### Important

- This app should be deployed on Render with a persistent disk.
- Without persistent storage, SQLite data and uploaded files will be lost on restart or redeploy.

## Future Improvements

- Per-user encryption key management
- File preview support
- Password reset flow
- Admin dashboard
- Better access control and audit filtering

## Author

Developed as a secure file sharing and authentication project.
