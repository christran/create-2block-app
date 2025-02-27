# 2BLOCK - Next.js Monorepo with Turborepo

This repository is a full-stack web application structured as a monorepo using Turborepo, built with Next.js. It includes a set of modern features such as Magic Link Authentication, Social Login, Subscriptions, File Uploading, and more. The project also supports both web and mobile platforms (iOS/Android) with the use of Expo.

[https://2block.co](https://2block.co)

## Features

### 🔑 Magic Link Authentication
Users can log in securely with a magic link sent to their email. This eliminates the need for passwords, making the authentication process simpler and more secure.

### 👥 Social Login
Users can sign up or log in using their social accounts. This includes integration with:
- Google
- GitHub
- Discord

### 🛡️ Users Roles and Protected Routes
Different user roles (e.g., admin, user) are implemented. The application uses role-based access control (RBAC) to ensure users can only access specific routes and functionalities based on their assigned role.

### 💳 Subscriptions and Billing with Stripe Integration
This project supports recurring payments and subscriptions via Stripe. Users can manage their billing and subscriptions seamlessly within the app.

### 📤 Single/Multipart File Uploading with S3 Storage
Users can upload single or multipart files. These files are stored securely in cloud storage solutions like Cloudflare R1 and Backblaze B2, ensuring scalability and reliability.

### 📱 Web and Native iOS/Android Applications
The project is designed to work across multiple platforms, including a web application and native mobile applications for iOS and Android, using Expo for React Native.

### 📧 Automated Marketing/Transactional Emails
The project integrates with AWS SES, Resend, and React Email for sending automated marketing emails, transactional emails, and notifications to users.

### 🔌 tRPC API
We use tRPC for building type-safe APIs, allowing seamless integration between the frontend and backend while maintaining full TypeScript safety.

### ⚙️ Rate Limiting
Rate limiting is implemented to protect the system from abuse and to ensure fair usage of the API endpoints.

## Technologies Used

- **Next.js**: A powerful React framework that provides server-side rendering and static site generation, improving performance and SEO for the web application.
- **Expo**: A framework and platform for universal React applications, enabling the development of native iOS and Android apps with React Native.
- **Turborepo**: A high-performance monorepo tool that helps to manage multiple projects in a single repository, optimizing the development and build process.
- **PostgreSQL**: The relational database used for storing application data.
- **DrizzleORM**: A lightweight ORM for TypeScript that is used to interact with the PostgreSQL database.
- **Cloudflare R1**: Object storage for storing user-uploaded files.
- **Backblaze B2**: Alternative cloud storage solution used for storing files.
- **AWS SES**: A scalable email sending service used for transactional emails.
- **Resend**: An email service provider used for marketing and transactional emails.
- **React Email**: A modern email rendering library used to design and send beautiful, responsive emails.
- **Stripe**: Integrated for handling payments, subscriptions, and billing.
- **tRPC**: A framework for building type-safe APIs that integrate seamlessly with the frontend.
- **Trigger.dev**: A tool for automating workflows in the backend, such as sending notifications or triggering events based on actions within the system.
