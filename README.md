# Task Management Application

A comprehensive task management system built with Angular and Express.js, featuring real-time notifications, team collaboration, and role-based access control.

## Features

### Core Functionality
- **User Roles**: Admin and regular users with different access levels
- **Domain Management**: Organize teams by business domains
- **Team Management**: Create teams and manage team members
- **Activity/Task Management**: Create, assign, and track activities
- **Real-time Notifications**: Socket.io-powered live updates
- **File Attachments**: Support for document attachments on activities
- **Status Tracking**: Track activity progress with different status levels
- **Remarks System**: Add comments and updates to activities

### User Features
- **User Registration**: Register with Employee ID, Name, and Password
- **Team Visibility**: View teams you're part of
- **Activity Updates**: Change status and add remarks to assigned activities
- **Dashboard**: Overview of your teams and activities
- **Real-time Updates**: Instant notifications for changes

### Admin Features
- **Domain Creation**: Create and manage business domains
- **Team Creation**: Create teams and assign domains
- **Member Management**: Add/remove team members
- **Activity Creation**: Create activities and assign team members
- **System Overview**: Complete visibility of all teams and activities

## Technology Stack

### Frontend (Angular)
- Angular 20.x with standalone components
- Angular Material for UI components
- Tailwind CSS for styling
- Socket.io-client for real-time updates
- Reactive Forms for form handling
- HTTP interceptors for authentication

### Backend (Express.js)
- Express.js REST API
- Socket.io for real-time communication
- JWT for authentication
- Multer for file uploads
- bcryptjs for password hashing
- In-memory data storage (can be easily replaced with a database)

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```
   
   The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the root directory:
   ```bash
   cd ..
   ```

2. Install frontend dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the Angular development server:
   ```bash
   npm start
   ```
   
   The frontend will run on `http://localhost:4200`

## Default Credentials

The system comes with a default admin user:
- **Employee ID**: ADMIN001
- **Password**: password

## Key Features Implementation

### Real-time Updates
- Socket.io connection established on login
- Users automatically join team rooms
- Real-time notifications for team and activity changes

### Security
- JWT-based authentication
- Role-based access control
- Protected routes with guards
- API endpoint authorization

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Angular Material components
- Responsive grid layouts

## License

This project is licensed under the MIT License.
