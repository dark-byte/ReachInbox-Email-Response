# ReachInbox Email Response: Intelligent Email Classifier and Auto-Responder

![ReachInbox Email Response](https://socialify.git.ci/dark-byte/ReachInbox-Email-Response/image?language=1&owner=1&name=1&stargazers=1&theme=Light)

**ReachInbox Email Response** is an intelligent email management tool designed to automate the process of classifying and responding to incoming emails. Leveraging the power of OpenAI's language models and BullMQ for task scheduling, ReachInbox Email Response seamlessly integrates with Gmail and Outlook accounts via OAuth, categorizes emails based on their content, assigns appropriate labels, and sends automated, context-aware responses. Built with TypeScript for enhanced type safety and maintainability, ReachInbox Email Response offers a streamlined solution for efficient inbox management.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [Demonstration](#demonstration)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- **OAuth Integration**: Securely connect and manage Gmail and Outlook accounts using OAuth 2.0.
- **Automated Email Classification**: Utilize OpenAI's language models to analyze and categorize incoming emails into predefined labels:
  - **Interested**
  - **Not Interested**
  - **More Information**
- **Automated Responses**: Generate and send context-aware responses based on email classification, enhancing communication efficiency.
- **Task Scheduling with BullMQ**: Handle email processing tasks asynchronously and reliably, ensuring scalability and performance.
- **Real-time Logging**: Monitor processed emails and responses through an intuitive frontend dashboard.
- **User Control**: Easily enable or disable the auto-reply functionality with simple UI buttons.
- **Secure and Scalable**: Built with TypeScript and Redis for type safety, performance, and scalability.

## Requirements

Before setting up the project, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Redis](https://redis.io/) (for BullMQ task management)
- Google and Outlook developer accounts for OAuth setup

## Technologies Used

- **Backend**:
  - [Node.js](https://nodejs.org/)
  - [Express](https://expressjs.com/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [BullMQ](https://docs.bullmq.io/) (Task Scheduler)
  - [ioredis](https://github.com/luin/ioredis) (Redis Client)
  - [google-auth-library](https://github.com/googleapis/google-auth-library-nodejs)
  - [googleapis](https://github.com/googleapis/google-api-nodejs-client)
  - [OpenAI](https://openai.com/)
  - [Express-Session](https://github.com/expressjs/session)
  - [connect-redis](https://github.com/tj/connect-redis)
  - [dotenv](https://github.com/motdotla/dotenv)

- **Frontend**:
  - HTML
  - CSS
  - Vanilla JavaScript

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/ReachInbox-Email-Response.git
   cd ReachInbox-Email-Response
   ```

2. **Install Dependencies**

   Navigate to the project root directory and install the necessary packages:

   ```bash
   npm install
   ```

3. **Configure Redis**

   Ensure that Redis is installed and running on your machine. You can download and install Redis from [here](https://redis.io/download).

   Start Redis:

   ```bash
   redis-server
   ```

## Configuration

1. **Environment Variables**

   Create a `.env` file in the root directory of the project and add the following configurations:

   ```env
   # Server Configuration
   PORT=3000
   SESSION_SECRET=your_session_secret

   # Redis Configuration
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

   # Outlook OAuth Configuration
   OUTLOOK_CLIENT_ID=your_outlook_client_id
   OUTLOOK_CLIENT_SECRET=your_outlook_client_secret
   OUTLOOK_REDIRECT_URI=http://localhost:3000/auth/outlook/callback

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

   - **Google OAuth**:
     - Obtain `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the [Google Cloud Console](https://console.cloud.google.com/).
     - Set the `GOOGLE_REDIRECT_URI` to `http://localhost:3000/auth/google/callback`.

   - **Outlook OAuth**:
     - Obtain `OUTLOOK_CLIENT_ID` and `OUTLOOK_CLIENT_SECRET` from the [Microsoft Azure Portal](https://portal.azure.com/).
     - Set the `OUTLOOK_REDIRECT_URI` to `http://localhost:3000/auth/outlook/callback`.

   - **OpenAI**:
     - Obtain your `OPENAI_API_KEY` from your [OpenAI account](https://platform.openai.com/account/api-keys).

2. **Frontend Configuration**

   If necessary, update frontend configurations such as API endpoints or origin URLs in `frontend/app.js` to match your setup.

## Running the Application

1. **Start the Backend Server**

   In the project root directory, run:

   ```bash
   npm run dev
   ```

   This command uses `nodemon` to watch for file changes and automatically restart the server.

   Output:

   ```
   Server running on port 3000
   ```

2. **Access the Frontend**

   Open your web browser and navigate to `http://localhost:3000`. You should see the ReachInbox Email Response dashboard.

## API Endpoints

The application exposes several API endpoints for managing email processing and auto-reply functionalities. All API routes are prefixed with `/api` and protected by authentication middleware.

### Authentication Routes

- **Google OAuth**

  - **Login**

    ```
    GET /auth/google
    ```

    Redirects the user to Google's OAuth 2.0 consent screen.

  - **Callback**

    ```
    GET /auth/google/callback
    ```

    Handles the OAuth 2.0 callback from Google and initializes user sessions.

- **Outlook OAuth**

  - **Login**

    ```
    GET /auth/outlook
    ```

    Redirects the user to Outlook's OAuth 2.0 consent screen.

  - **Callback**

    ```
    GET /auth/outlook/callback
    ```

    Handles the OAuth 2.0 callback from Outlook and initializes user sessions.

### Protected API Routes (`/api`)

- **Enable Auto-Reply**

  ```
  POST /api/enable-auto-reply
  ```

  Enables the auto-reply functionality by adding a recurring job to process unread emails every 5 minutes.

  **Response:**

  - `200 OK`: `{ success: true, message: 'Auto-reply enabled.' }`
  - `400 Bad Request`: `{ error: 'Authentication tokens not found.' }`
  - `500 Internal Server Error`: `{ error: 'Internal Server Error' }`

- **Disable Auto-Reply**

  ```
  POST /api/disable-auto-reply
  ```

  Disables the auto-reply functionality by removing the recurring job.

  **Response:**

  - `200 OK`: `{ message: 'Auto-reply disabled.' }`
  - `400 Bad Request`: `{ error: 'Auto-reply is not enabled.' }`
  - `500 Internal Server Error`: `{ error: 'Failed to disable auto-reply.' }`

- **Fetch Logs**

  ```
  GET /api/logs
  ```

  Retrieves logs of processed emails and generated responses.

  **Response:**

  - `200 OK`: `Array of log objects`
  - `500 Internal Server Error`: `{ error: 'Failed to fetch logs.' }`

- **Fetch Auto-Reply Status**

  ```
  GET /api/get-auto-reply-status
  ```

  Retrieves the current status of the auto-reply functionality.

  **Response:**

  - `200 OK`: `{ isEnabled: true | false }`
  - `500 Internal Server Error`: `{ error: 'Failed to fetch auto-reply status.' }`

- **Check Authentication**

  ```
  GET /api/check-auth
  ```

  Checks if the user is authenticated.

  **Response:**

  - `200 OK`: `{ isAuthenticated: true | false }`

## Usage

1. **Authenticate Your Email Accounts**

   - **Login with Google**:
     - Click the "Login with Google" button.
     - Authenticate your Google account via the OAuth consent screen.
     - Grant the necessary permissions for email access.

   - **Login with Outlook**:
     - Click the "Login with Outlook" button (if implemented).
     - Authenticate your Outlook account via the OAuth consent screen.
     - Grant the necessary permissions for email access.

2. **Enable Auto-Reply**

   - Upon successful authentication, the application automatically enables auto-reply.
   - You can manually enable or disable auto-reply using the "Enable Auto-Reply" and "Disable Auto-Reply" buttons respectively.

3. **Sending Emails**

   - Send emails to your connected Gmail or Outlook accounts from another account to test the auto-reply functionality.

4. **Monitoring Logs**

   - View processed emails and their classifications in the "Emails and Responses" section.
   - Logs include Email ID, Classification, Snippet, Generated Response, and Processing Timestamp.

## Demonstration

To showcase the working of ReachInbox Email Response:

1. **Connecting Email Accounts**

   - Authenticate both Gmail and Outlook accounts using OAuth.

2. **Sending Test Emails**

   - From another email account, send emails to the connected Gmail and Outlook accounts.

3. **Automatic Processing and Responding**

   - ReachInbox Email Response will automatically process incoming unread emails, classify them based on content, assign labels, and send appropriate responses.

4. **Viewing Logs**

   - Observe the generated logs in the frontend dashboard, showcasing the email processing workflow.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m 'Add Your Feature'
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeatureName
   ```

5. **Open a Pull Request**

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- [ReachInbox](https://reachinbox.com/) for the assignment and inspiration.
- [OpenAI](https://openai.com/) for providing powerful language models.
- [BullMQ](https://docs.bullmq.io/) for robust task scheduling.
- [Google APIs](https://developers.google.com/apis-explorer) for seamless email integrations.
- [Microsoft Graph](https://docs.microsoft.com/en-us/graph/overview) for Outlook email integrations.
