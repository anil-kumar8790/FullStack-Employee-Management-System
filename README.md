# Employee Management System (EMS)

A full-stack Employee Management System built using **Angular, Node.js, Express.js, and PostgreSQL**. The application provides role-based access for administrators and employees, with authentication, employee management, department management, and password management features.

## 🚀 Features

### Admin
- Secure admin login.
- Admin dashboard.
- Add and manage employees.
- View employee details.
- Manage departments.
- Employee search and pagination.
- Role-based access control.

### Employee
- Secure employee login.
- View personal profile.
- Access employee dashboard.
- Change password.
- Forgot password and reset password functionality.

### Authentication & Security
- JWT-based authentication.
- Password hashing.
- Authentication guards and role guards.
- HTTP authentication interceptor.
- Backend authentication and validation middleware.
- Password setup and reset flow.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Angular 18 | Frontend |
| TypeScript | Frontend programming |
| HTML5, CSS3 | UI development |
| Node.js | Backend runtime |
| Express.js | REST API development |
| PostgreSQL | Database |
| JWT | Authentication |
| Git & GitHub | Version control |

## 📁 Project Structure

```text
FullStack-Employee-Management-System/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── utils/
│   ├── package.json
│   └── server.js
│
├── frontend/
│   └── employee-frontend/
│       ├── public/
│       ├── src/
│       │   └── app/
│       │       ├── admin/
│       │       ├── auth/
│       │       ├── guards/
│       │       ├── interceptors/
│       │       ├── layouts/
│       │       ├── models/
│       │       ├── pages/
│       │       └── services/
│       ├── angular.json
│       └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/anil-kumar8790/FullStack-Employee-Management-System.git
```

### 2. Backend Setup

Navigate to the backend folder:

```bash
cd FullStack-Employee-Management-System/backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the backend folder and configure your environment variables.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

Add any additional environment variables required by your backend email configuration.

Start the backend server using the start script defined in `backend/package.json`:

```bash
npm start
```

### 3. Frontend Setup

Open another terminal and navigate to:

```bash
cd FullStack-Employee-Management-System/frontend/employee-frontend
```

Install dependencies:

```bash
npm install
```

Start the Angular application:

```bash
ng serve
```

Open your browser:

```text
http://localhost:4200
```

## 🗄️ Database

This application uses PostgreSQL as its relational database.

Before running the application:

1. Install and start PostgreSQL.
2. Create the application database.
3. Configure the database credentials in the backend `.env` file.
4. Set up the required database tables and schema.

## 🔐 Security Notes

- Never commit `.env` files or actual credentials.
- Use strong JWT secrets.
- Store passwords securely using hashing.
- Keep backend authorization checks enabled.
- Validate all incoming API requests.

## 💻 GitHub Repository

[Full Stack Employee Management System](https://github.com/anil-kumar8790/FullStack-Employee-Management-System)

## 👨‍💻 Author

**Anil Kumar**

Full Stack Developer | Angular | Node.js | Express.js | PostgreSQL

---

⭐ If you find this project useful, consider giving the repository a star!



## 📸 Application Screenshots

### 1. Login Page
![Login Page](docs/screenshots/login.png)

### 2. Admin Dashboard
![Admin Dashboard](docs/screenshots/admin-dashboard.png)

### 3. Employee List
![Employee List](docs/screenshots/admin-employee-list.png)

### 4. Employee Profile
![Employee Profile](docs/screenshots/admin-employee-profile.png)

### 5. Department Management
![Department Management](docs/screenshots/admin-departments.png)

### 6. Settings Management
![Settings Management](docs/screenshots/admin-settings.png)