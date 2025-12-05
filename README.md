# BDC Messenger — Realtime Full-Stack Chat Application

**Author:** Mohd Saad Mohd Shakeel
**Course:** Bachelor of Computer Application
**Date:** November 19, 2025
**Contact:** msaadm96@gmail.com

---

## Abstract

BDC Messenger is a realtime web-based chat application demonstrating end-to-end full-stack development using a modern MERN-style stack and Socket.io for live messaging. The app features secure authentication, persistent messaging with image attachments, online presence, and basic call signaling. It is built with a focus on clean architecture, modular code, and responsive design.

---

## Objectives

The primary objectives of this project are:

1. Implement secure user authentication using JWT cookie-based sessions
2. Build realtime messaging using Socket.io with message persistence in MongoDB
3. Provide profile management and image uploads via Cloudinary integration
4. Deliver a responsive frontend with TailwindCSS and DaisyUI components

---

## Key Features

### Authentication & User Management
- User signup, login, and logout functionality
- Password reset mechanism (development token-based)
- Secure JWT-based session management

### Messaging System
- One-to-one messaging with text and image support
- Message persistence in MongoDB for chat history
- Real-time message delivery using Socket.io

### User Presence & Profile
- Online presence listing to show active users
- Real-time new-message notifications
- Profile updates including:
  - Profile picture management
  - Name and about section
  - Phone number information

### Advanced Features
- Optional WebRTC call signaling
- Offer/answer/ICE candidate exchange via Socket.io
- Image attachments with cloud storage

---

## Tech Stack & Tools

### Frontend Technologies
- React (Vite): Modern build tool for fast development
- TailwindCSS: Utility-first CSS framework
- DaisyUI: Component library built on Tailwind
- React Router: Client-side routing
- Zustand: Lightweight state management
- Axios: HTTP client for API requests

### Backend Technologies
- Node.js (ESM): JavaScript runtime with ES module support
- Express: Web application framework
- Socket.io: Real-time bidirectional communication
- Mongoose: MongoDB object modeling

### Supporting Services & Libraries
- Cloudinary: Cloud-based image hosting service
- bcryptjs: Password hashing library
- jsonwebtoken: JWT implementation for authentication
- react-hot-toast: Toast notification system

---

## Architecture Overview

### High-Level Architecture

The application follows a client-server architecture with real-time capabilities:

1. Client (SPA): Single Page Application built with React
2. REST API: HTTP endpoints at `/api/*` for CRUD operations
3. WebSocket Layer: Socket.io for real-time events and messaging
4. Database: MongoDB for persistent data storage
5. Cloud Storage: Cloudinary for image hosting

### Communication Flow

```
Client (React) <---> REST API (/api/*) <---> MongoDB
       |                                        ^
       |                                        |
       +---> Socket.io <---> Server <-----------+
                              |
                              v
                         Cloudinary
```

The server attaches Socket.io to the same HTTP server, enabling both REST and WebSocket communication on a single port. Images are uploaded to Cloudinary and stored as URLs in message documents.

---

## Core Data Models

### User Model

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  fullName: String (required),
  password: String (hashed, required),
  profilePic: String (URL),
  username: String (unique, required),
  about: String,
  phone: String,
  resetPasswordToken: String,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Message Model

```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  text: String,
  image: String (URL),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## Installation & Setup

### Prerequisites

Before installation, ensure you have:

- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB URI (MongoDB Atlas recommended)
- Cloudinary Account (optional, for image uploads)

### Installation Steps

1. Install dependencies

```bash
# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

2. Configure Environment Variables

Create `.env` files in both frontend and backend directories with required configurations:

**Backend `.env`:**
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000
```

3. Run the application

```bash
# Start backend server
cd backend
npm start

# In a new terminal, start frontend
cd frontend
npm run dev
```

4. Access the application

Open your browser and navigate to: **http://localhost:5173**

---

## Testing & Debugging

### Testing Strategies

1. API Testing
   - Use browser DevTools Network tab to inspect `/api/auth/*` and `/api/messages/*` responses
   - Verify HTTP status codes and response payloads
   - Test authentication flow (signup → login → logout)

2. Real-time Testing
   - Open multiple browser windows/tabs to simulate different users
   - Test message delivery and online presence updates
   - Monitor Socket.io connection status

3. Backend Monitoring
   - Monitor backend terminal for database connection logs
   - Review controller logs for request processing
   - Check error messages and stack traces

### Common Issues & Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Port conflicts | Port 5000 already in use | Kill existing process: `npx kill-port 5000` |
| Missing environment variables | `.env` file not configured | Verify all required variables are set |
| PostCSS/Tailwind errors | Build configuration issues | Clear node_modules and reinstall |
| Database connection failure | Invalid MongoDB URI | Check connection string and network access |
| Image upload failure | Cloudinary credentials missing | Verify Cloudinary API keys in `.env` |

---

## Future Work & Enhancements

### Planned Features

1. Group Chat Functionality
   - Multi-user conversations
   - Group management (add/remove members)
   - Group profile pictures and names

2. Message Read Receipts
   - Track message delivery status
   - Display read/unread indicators
   - Typing indicators for active conversations

3. Enhanced File Attachments
   - Support for documents (PDF, DOCX)
   - Video and audio file sharing
   - File size limits and validation

4. Improved WebRTC Integration
   - Voice and video calling UI
   - Call history and duration tracking
   - Screen sharing capabilities

5. Deployment & DevOps
   - Docker containerization
   - CI/CD pipeline setup
   - Production-ready configuration
   - Load balancing and scaling strategies

### Technical Improvements

- Performance Optimization: Implement message pagination and lazy loading
- Security Enhancements: Add rate limiting and input sanitization
- Testing Coverage: Unit tests, integration tests, and E2E testing
- Accessibility: WCAG compliance and keyboard navigation
- Internationalization: Multi-language support

---

## Conclusion

BDC Messenger successfully demonstrates the implementation of a modern, real-time chat application using industry-standard technologies. The project showcases proficiency in full-stack development, real-time communication protocols, and cloud service integration. Through this application, key concepts of authentication, WebSocket communication, and database design have been applied in a practical context.

The modular architecture and clean code practices employed in this project provide a solid foundation for future enhancements and scalability. This project serves as a comprehensive demonstration of modern web development capabilities for the Bachelor of Computer Application curriculum.

---

## References & Resources

- Socket.io Documentation: https://socket.io/docs/
- MongoDB Documentation: https://docs.mongodb.com/
- React Documentation: https://react.dev/
- Express.js Guide: https://expressjs.com/
- Cloudinary API: https://cloudinary.com/documentation
- JWT Best Practices: https://jwt.io/introduction

---

**Prepared for Submission/Demo**
**Institution:** [Late Babanrao Deshmukh College Camp Amravati]
**Department:** Bachlor Computer Application
**Academic Year:** 2025-2026


<<<<<<< HEAD
# BDC_MESSENGER_APP_
This Is My Final Year College Project 
=======
# BDC Messenger — Realtime Full-Stack Chat Application

**Author:** Mohd Saad Mohd Shakeel  
**Course:** Bachelor of Computer Application  
**Date:** November 19, 2025  
**Contact:** msaadm96@gmail.com

---

## Abstract

BDC Messenger is a realtime web-based chat application demonstrating end-to-end full-stack development using a modern MERN-style stack and Socket.io for live messaging. The app features secure authentication, persistent messaging with image attachments, online presence, and basic call signaling. It is built with a focus on clean architecture, modular code, and responsive design.

---

## Objectives

The primary objectives of this project are:

1. **Implement secure user authentication** using JWT cookie-based sessions
2. **Build realtime messaging** using Socket.io with message persistence in MongoDB
3. **Provide profile management** and image uploads via Cloudinary integration
4. **Deliver a responsive frontend** with TailwindCSS and DaisyUI components

---

## Key Features

### Authentication & User Management
- User signup, login, and logout functionality
- Password reset mechanism (development token-based)
- Secure JWT-based session management

### Messaging System
- One-to-one messaging with text and image support
- Message persistence in MongoDB for chat history
- Real-time message delivery using Socket.io

### User Presence & Profile
- Online presence listing to show active users
- Real-time new-message notifications
- Profile updates including:
  - Profile picture management
  - Name and about section
  - Phone number information

### Advanced Features
- Optional WebRTC call signaling
- Offer/answer/ICE candidate exchange via Socket.io
- Image attachments with cloud storage

---

## Tech Stack & Tools

### Frontend Technologies
- **React (Vite):** Modern build tool for fast development
- **TailwindCSS:** Utility-first CSS framework
- **DaisyUI:** Component library built on Tailwind
- **React Router:** Client-side routing
- **Zustand:** Lightweight state management
- **Axios:** HTTP client for API requests

### Backend Technologies
- **Node.js (ESM):** JavaScript runtime with ES module support
- **Express:** Web application framework
- **Socket.io:** Real-time bidirectional communication
- **Mongoose:** MongoDB object modeling

### Supporting Services & Libraries
- **Cloudinary:** Cloud-based image hosting service
- **bcryptjs:** Password hashing library
- **jsonwebtoken:** JWT implementation for authentication
- **react-hot-toast:** Toast notification system

---

## Architecture Overview

### High-Level Architecture

The application follows a client-server architecture with real-time capabilities:

1. **Client (SPA):** Single Page Application built with React
2. **REST API:** HTTP endpoints at `/api/*` for CRUD operations
3. **WebSocket Layer:** Socket.io for real-time events and messaging
4. **Database:** MongoDB for persistent data storage
5. **Cloud Storage:** Cloudinary for image hosting

### Communication Flow

```
Client (React) <---> REST API (/api/*) <---> MongoDB
       |                                        ^
       |                                        |
       +---> Socket.io <---> Server <-----------+
                              |
                              v
                         Cloudinary
```

The server attaches Socket.io to the same HTTP server, enabling both REST and WebSocket communication on a single port. Images are uploaded to Cloudinary and stored as URLs in message documents.

---

## Core Data Models

### User Model

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  fullName: String (required),
  password: String (hashed, required),
  profilePic: String (URL),
  username: String (unique, required),
  about: String,
  phone: String,
  resetPasswordToken: String,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Message Model

```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  text: String,
  image: String (URL),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## Installation & Setup

### Prerequisites

Before installation, ensure you have:

- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
- **MongoDB URI** (MongoDB Atlas recommended)
- **Cloudinary Account** (optional, for image uploads)

### Installation Steps

1. **Install Dependencies**

```bash
# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

2. **Configure Environment Variables**

Create `.env` files in both frontend and backend directories with required configurations:

**Backend `.env`:**
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000
```

3. **Run the Application**

```bash
# Start backend server
cd backend
npm start

# In a new terminal, start frontend
cd frontend
npm run dev
```

4. **Access the Application**

Open your browser and navigate to: **http://localhost:5173**

---

## Testing & Debugging

### Testing Strategies

1. **API Testing**
   - Use browser DevTools Network tab to inspect `/api/auth/*` and `/api/messages/*` responses
   - Verify HTTP status codes and response payloads
   - Test authentication flow (signup → login → logout)

2. **Real-time Testing**
   - Open multiple browser windows/tabs to simulate different users
   - Test message delivery and online presence updates
   - Monitor Socket.io connection status

3. **Backend Monitoring**
   - Monitor backend terminal for database connection logs
   - Review controller logs for request processing
   - Check error messages and stack traces

### Common Issues & Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Port conflicts | Port 5000 already in use | Kill existing process: `npx kill-port 5000` |
| Missing environment variables | `.env` file not configured | Verify all required variables are set |
| PostCSS/Tailwind errors | Build configuration issues | Clear node_modules and reinstall |
| Database connection failure | Invalid MongoDB URI | Check connection string and network access |
| Image upload failure | Cloudinary credentials missing | Verify Cloudinary API keys in `.env` |

---

## Future Work & Enhancements

### Planned Features

1. **Group Chat Functionality**
   - Multi-user conversations
   - Group management (add/remove members)
   - Group profile pictures and names

2. **Message Read Receipts**
   - Track message delivery status
   - Display read/unread indicators
   - Typing indicators for active conversations

3. **Enhanced File Attachments**
   - Support for documents (PDF, DOCX)
   - Video and audio file sharing
   - File size limits and validation

4. **Improved WebRTC Integration**
   - Voice and video calling UI
   - Call history and duration tracking
   - Screen sharing capabilities

5. **Deployment & DevOps**
   - Docker containerization
   - CI/CD pipeline setup
   - Production-ready configuration
   - Load balancing and scaling strategies

### Technical Improvements

- **Performance Optimization:** Implement message pagination and lazy loading
- **Security Enhancements:** Add rate limiting and input sanitization
- **Testing Coverage:** Unit tests, integration tests, and E2E testing
- **Accessibility:** WCAG compliance and keyboard navigation
- **Internationalization:** Multi-language support

---

## Conclusion

BDC Messenger successfully demonstrates the implementation of a modern, real-time chat application using industry-standard technologies. The project showcases proficiency in full-stack development, real-time communication protocols, and cloud service integration. Through this application, key concepts of authentication, WebSocket communication, and database design have been applied in a practical context.

The modular architecture and clean code practices employed in this project provide a solid foundation for future enhancements and scalability. This project serves as a comprehensive demonstration of modern web development capabilities for the Bachelor of Computer Application curriculum.

---

## References & Resources

- **Socket.io Documentation:** https://socket.io/docs/
- **MongoDB Documentation:** https://docs.mongodb.com/
- **React Documentation:** https://react.dev/
- **Express.js Guide:** https://expressjs.com/
- **Cloudinary API:** https://cloudinary.com/documentation
- **JWT Best Practices:** https://jwt.io/introduction

---

**Prepared for Submission/Demo**  
**Institution:** [Late Babanrao Deshmukh College Camp Amravati]  
**Department:** Bachlor Computer Application  
**Academic Year:** 2025-2026
>>>>>>> f0d8b44 (Initial commit)
