# Apna Bazar - Full-Stack Indian Grocery Store

A beautiful, modern, full-stack Indian Grocery Store application built with **React (Vite)**, **Tailwind CSS**, and **Express.js (Node.js)**. 

Featuring traditional Indian categories: Staples & Grains, Spices & Masalas, Dairy & Fresh, Sweets & Snacks, and Beverages.

---

## Prerequisites (Node.js)

Since Node.js/NPM is not yet available in your environment, you will need to install it first to run this application:

1. **Download Node.js**: Visit [https://nodejs.org/](https://nodejs.org/) and download the **LTS (Long Term Support)** version.
2. **Install Node.js**: Run the installer and follow the prompt. This will automatically add `node`, `npm`, and `npx` to your command line.
3. **Verify installation**: Open a new terminal and type:
   ```bash
   node -v
   npm -v
   ```

---

## Project Structure

```text
Project grosary stor/
├── backend/
│   ├── data/
│   │   └── products.js       # Indian Product catalog list
│   ├── routes/
│   │   ├── orderRoutes.js    # Order processing API
│   │   └── productRoutes.js  # Product listing and filter API
│   ├── server.js             # Express.js server entry point
│   └── package.json          # Backend configuration & dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # ProductCard, CartModal, CheckoutForm
│   │   ├── context/          # CartContext state provider
│   │   ├── data/             # client-side offline product fallback
│   │   ├── App.jsx           # Main page structure & states
│   │   ├── index.css         # Custom styling & Tailwind directives
│   │   └── main.jsx          # React app entry point
│   ├── index.html            # Web entry point with Outfit & Inter fonts
│   ├── package.json          # React configuration & dependencies
│   ├── tailwind.config.js    # Tailwind color extension configuration
│   ├── postcss.config.js     # PostCSS configurations
│   └── vite.config.js        # Vite configurations
└── README.md                 # Project launch instructions (this file)
```

---

## Setup & Running the Application

Once you have installed Node.js, follow these simple commands:

### 1. Launch the Backend Server (Express)

Open a terminal or command prompt inside the `backend` folder and run:
```bash
cd backend
npm install
npm run start
```
*The backend server will launch on [http://localhost:5000](http://localhost:5000).*

### 2. Launch the Frontend App (React + Tailwind CSS)

Open a **separate** terminal or command prompt inside the `frontend` folder and run:
```bash
cd frontend
npm install
npm run dev
```
*The frontend application will start and run on [http://localhost:3000](http://localhost:3000).*

---

## Demo Fallback Design

If you open the frontend without running the backend, the application will **automatically fallback to an offline demo state** using the client-side data. Searching, filtering, adding items to the cart, modifying quantities, and placing checkout order details will still work flawlessly via local state simulation!
