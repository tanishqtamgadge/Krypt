# Product Requirements Document

## Project Title
Secure File Sharing and Authentication System

## 1. Overview
This project is a secure file sharing web application built with Node.js, Express, React, and TypeScript. It allows registered users to log in, upload files, encrypt them before storage, share them with other registered users, and let authorized receivers download the files in decrypted form. The system also records user activity for tracking and auditing purposes.

## 2. Problem Statement
Traditional file sharing systems often store and transfer files without enough protection. This creates risks such as unauthorized access, data leakage, and file tampering. The project solves this by combining authentication, encryption, controlled sharing, and activity tracking in one system.

## 3. Objectives
- Provide secure user registration and login.
- Encrypt uploaded files before storing them.
- Allow users to share files only with registered users.
- Allow receivers to download shared files in decrypted form.
- Maintain an activity log for uploads, downloads, login, logout, and sharing.
- Provide a clean dashboard for managing uploads and shares.

## 4. Target Users
- Students
- Small teams
- Organizations needing secure internal file exchange
- Cybersecurity demonstration and academic project audiences

## 5. Key Features
### 5.1 User Authentication
- New users can register from a separate registration page.
- Existing users can log in using username and password.
- Passwords are stored securely in hashed form.

### 5.2 Dashboard
- After login, the user is redirected to the dashboard.
- The dashboard contains:
- Upload section
- User vault / uploaded files section
- Shared files section
- Recent activity section
- Left-side vertical navigation bar

### 5.3 Secure Upload
- Users can upload files from the dashboard.
- Uploaded files are encrypted before being stored in the `uploads` folder.
- File metadata is stored in the local SQLite database.

### 5.4 Secure Download
- Owners can download their uploaded files.
- Shared recipients can download files shared with them.
- Files are decrypted at the time of download.
- Integrity is checked before sending the file.

### 5.5 File Sharing
- A user can share an uploaded file with another registered user by entering their username.
- The receiver sees the shared file in their dashboard.

### 5.6 Audit Logs
- The system stores logs for:
- User registration
- Login
- Logout
- Upload
- Download
- Shared download
- Share activity

## 6. Functional Requirements
### 6.1 Registration
- The system shall allow a new user to create an account.
- The system shall reject duplicate usernames.

### 6.2 Login
- The system shall authenticate valid users.
- The system shall reject invalid login credentials.

### 6.3 Upload
- The system shall accept a selected file from the user.
- The system shall encrypt the file before saving it.
- The system shall save metadata such as filename, owner, upload time, and file size.

### 6.4 Sharing
- The system shall allow file owners to share files with registered users only.
- The system shall prevent duplicate sharing with the same receiver.

### 6.5 Download
- The system shall allow only authorized users to download files.
- The system shall decrypt the file before download.
- The system shall verify file integrity before sending the file.

### 6.6 Activity Monitoring
- The system shall store recent activity logs in the database.
- The system shall display recent logs on the dashboard.

## 7. Non-Functional Requirements
- Security: Password hashing and file encryption must be implemented.
- Usability: The interface must be simple and user-friendly.
- Performance: File upload and download should complete within reasonable time for typical files.
- Reliability: Files should remain accessible only to authorized users.
- Maintainability: Code should be modular and readable.

## 8. Technology Stack
- Frontend: React, TypeScript, CSS
- Backend: Node.js, Express
- Database: SQLite (`app_data.db`)
- Encryption: `cryptography` library using Fernet
- Password Hashing: `bcrypt`

## 9. Database Tables
### Users
- `id`
- `username`
- `password`

### Files
- `id`
- `filename`
- `owner`
- `encrypted_key`
- `file_hash`
- `file_size`
- `uploaded_at`

### Shared Files
- `id`
- `file_id`
- `owner`
- `shared_with`
- `created_at`

### Audit Logs
- `id`
- `username`
- `action`
- `target_type`
- `target_id`
- `details`
- `created_at`

## 10. User Flow
1. User opens the login page.
2. New user goes to register page and creates an account.
3. User logs in.
4. User reaches the dashboard.
5. User uploads a file.
6. The file is encrypted and stored.
7. The file appears in the uploaded section.
8. User shares the file with another registered user.
9. Receiver logs in and sees the file in the shared section.
10. Receiver downloads the file, and the system decrypts it before delivery.

## 11. Success Criteria
- Users can register and log in successfully.
- Files are encrypted before storage.
- Shared users can access only authorized files.
- Audit logs correctly record user actions.
- The dashboard clearly shows upload, share, and activity information.

## 12. Future Enhancements
- Folder upload support
- Download encrypted file option
- File delete option
- Search and filter in dashboard
- Email notifications for shared files
- Cloud database integration
- Supabase or PostgreSQL support

## 13. Conclusion
The Secure File Sharing and Authentication System is designed to provide safe file handling through authentication, encryption, controlled sharing, and user activity monitoring. It demonstrates core cybersecurity concepts in a practical web-based application and is suitable for academic projects and secure file exchange demonstrations.
