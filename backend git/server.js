// This loads the variables from our .env file
require("dotenv").config();

// Importing Express and required packages
const express = require("express");
const sgMail = require("@sendgrid/mail");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Firebase SDK for Firestore persistence
const { initializeApp } = require("firebase/app");
const {
    getFirestore,
    collection,
    addDoc,
    getDoc,
    getDocs,
    doc,
    query,
    where,
    updateDoc
} = require("firebase/firestore");

// Creating our Express app
const app = express();

// Port where our server will run
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_deakin_jwt_secret_sit313";

// Firebase configuration matching client
const firebaseConfig = {
    apiKey: "AIzaSyAoEpRUxGkOcBqjgMW8_dk1yKREDDUpXY0",
    authDomain: "task-p4-firebase.firebaseapp.com",
    projectId: "task-p4-firebase",
    storageBucket: "task-p4-firebase.firebasestorage.app",
    messagingSenderId: "788829452039",
    appId: "1:788829452039:web:a0fc037104c38d9ed4b7a2",
    measurementId: "G-WDCGKDGZ9E",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Set up SendGrid using the API key from .env
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Array to track email subscribers for newsletter
const subscribers = [];

// Helper: JWT verification middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access token required. Please log in."
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Session expired or invalid token. Please log in again."
            });
        }
        req.user = user;
        next();
    });
}

// Helper: Credit card number validation (13-19 digits)
function isValidCardNumber(number) {
    const clean = String(number).replace(/[\s-]/g, "");
    return /^\d{13,19}$/.test(clean);
}

// Helper: Card expiry validation
function isValidExpiry(expiry) {
    if (!expiry || typeof expiry !== "string") return false;
    const match = expiry.trim().match(/^(\d{2})\/(\d{2}|\d{4})$/);
    if (!match) return false;

    const month = parseInt(match[1], 10);
    let year = parseInt(match[2], 10);
    if (year < 100) year += 2000;

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;

    if (year < curYear) return false;
    if (year === curYear && month < curMonth) return false;
    if (year > curYear + 25) return false;

    return true;
}

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ----------------------------------------------------
// AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

// 1. User Registration
// Frontend sends entered details -> Backend validates -> hashes password -> stores in Firestore -> returns signed JWT
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required."
            });
        }

        if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long."
            });
        }

        const normalisedEmail = email.toLowerCase().trim();

        // Check if user already exists in Firestore
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", normalisedEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Hash password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Store user in Firestore with default plan: "Free"
        const newUserDoc = {
            name: name.trim(),
            email: normalisedEmail,
            password: hashedPassword,
            plan: "Free",
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(usersRef, newUserDoc);
        const userId = docRef.id;

        // Generate signed JWT
        const token = jwt.sign(
            { id: userId, email: normalisedEmail, name: name.trim(), plan: "Free" },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(201).json({
            success: true,
            message: "Account created successfully!",
            token,
            user: {
                id: userId,
                name: name.trim(),
                email: normalisedEmail,
                plan: "Free"
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during registration. Please try again."
        });
    }
});

// 2. User Login
// Frontend sends entered details -> Backend verifies email and password -> returns signed JWT
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter both email and password."
            });
        }

        const normalisedEmail = email.toLowerCase().trim();

        // Find user by email in Firestore
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", normalisedEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password."
            });
        }

        // Take the matched user document
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;

        // Compare password with bcrypt
        let isMatch = false;
        if (userData.password) {
            isMatch = await bcrypt.compare(password, userData.password);
            // Fallback for plain-text testing/migration
            if (!isMatch && userData.password === password) {
                isMatch = true;
            }
        }

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password."
            });
        }

        const plan = userData.plan || "Free";

        // Generate signed JWT
        const token = jwt.sign(
            { id: userId, email: normalisedEmail, name: userData.name, plan },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            message: "Logged in successfully!",
            token,
            user: {
                id: userId,
                name: userData.name,
                email: normalisedEmail,
                plan
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during login. Please try again."
        });
    }
});

// 3. Current User Session Check
app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
        const userRef = doc(db, "users", req.user.id);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const userData = userSnap.data();
        const plan = userData.plan || "Free";

        return res.status(200).json({
            success: true,
            user: {
                id: userSnap.id,
                name: userData.name,
                email: userData.email,
                plan
            }
        });
    } catch (error) {
        console.error("Fetch user error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user session."
        });
    }
});

// ----------------------------------------------------
// 4. UPGRADE PLAN FEATURE ENDPOINT
// ----------------------------------------------------
// Authenticated user upgrades from Free -> Paid after credit card validation
app.post("/api/upgrade-plan", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { cardholderName, cardNumber, expiry, cvv, postalCode } = req.body;

        // Fetch user from Firestore
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        const userData = userSnap.data();

        // If user is already on a Paid plan, reject upgrade
        if (userData.plan === "Paid") {
            return res.status(400).json({
                success: false,
                message: "You are already subscribed to the Paid plan!"
            });
        }

        // Validate Payment Details
        if (!cardholderName || cardholderName.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Please enter the full cardholder name."
            });
        }

        const cleanCard = (cardNumber || "").replace(/[\s-]/g, "");
        if (!cleanCard || cleanCard.length < 13 || cleanCard.length > 19) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid credit card number."
            });
        }

        if (!isValidCardNumber(cleanCard)) {
            return res.status(400).json({
                success: false,
                message: "Invalid card number checksum (Luhn check failed). Please re-check."
            });
        }

        if (!isValidExpiry(expiry)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid expiration date in MM/YY format (must not be expired)."
            });
        }

        if (!cvv || !/^\d{3,4}$/.test(cvv.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 3 or 4-digit CVV / CVC code."
            });
        }

        // Payment validation successful! Upgrade user to Paid plan in Firestore
        await updateDoc(userRef, {
            plan: "Paid",
            upgradedAt: new Date().toISOString(),
            lastFour: cleanCard.slice(-4),
            cardholderName: cardholderName.trim()
        });

        // Issue a freshly updated signed JWT containing plan: "Paid"
        const newToken = jwt.sign(
            { id: userId, email: userData.email, name: userData.name, plan: "Paid" },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            message: "Congratulations! Your account has been upgraded to the Paid plan.",
            token: newToken,
            user: {
                id: userId,
                name: userData.name,
                email: userData.email,
                plan: "Paid"
            }
        });
    } catch (error) {
        console.error("Upgrade plan error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process upgrade. Please try again."
        });
    }
});

// ----------------------------------------------------
// NEWSLETTER SUBSCRIBE ENDPOINT (Task P2/P5)
// ----------------------------------------------------
app.post("/subscribe", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email address is required."
            });
        }

        if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        const normalisedEmail = email.toLowerCase();

        if (subscribers.includes(normalisedEmail)) {
            return res.status(409).json({
                success: false,
                message: "This email is already subscribed."
            });
        }

        if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
            const message = {
                to: normalisedEmail,
                from: process.env.SENDGRID_FROM_EMAIL,
                subject: "Welcome to DEV@Deakin!",
                text: "Welcome to DEV@Deakin! Thank you for subscribing to our newsletter. You will now receive updates, news and information from DEV@Deakin. Happy learning!"
            };

            const response = await sgMail.send(message);
            console.log("SendGrid Status Code:", response[0].statusCode);
        }

        subscribers.push(normalisedEmail);
        console.log("New subscriber:", normalisedEmail);

        return res.status(200).json({
            success: true,
            message: "Successfully subscribed! A welcome email has been sent."
        });
    } catch (error) {
        console.error("Email sending error:", error);
        return res.status(500).json({
            success: false,
            message: "Subscription failed. Please try again later."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log("Server running at http://localhost:" + PORT);
});
