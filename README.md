# Job Application Tracker

This project is a web application built with Node.js (Express) and SQLite. It is designed to demonstrate common web security vulnerabilities such as SQL Injection, Cross-Site Scripting (XSS), and Sensitive Data Exposure. Secure and Insecure versions are seperated into their own equal branches away from main for comparison.

## Requirements
- Node.js (v18+ recommended)
- SQLite3 (installed via the Node.js package)
- Git (optional, for cloning the repository)

## Getting Started
1. **Clone the Repository:**  
   Clone the repository to your local machine.  

2. **Install Dependencies:**  
   Install the necessary Node.js packages by running:  
   `npm install`
   In the repo folder.
   If you have issues with the bcrypt module, run:  
   `npm install bcrypt --build-from-source`

4. **Initialize the Server:**  
   Run the server.bat file located in the root folder.
   The application will then be available at [http://localhost:3000](http://localhost:3000).

## Usage
- When you navigate to [http://localhost:3000](http://localhost:3000), the application redirects you to the login page where you can log in or register using the shared form.
- After logging in, users can add and manage job applications.
- Admin functionality (view logs, list/delete users) is accessible via specific admin login.

## License
This project is licensed under the MIT License.
