require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Import your routers
const authRoutes = require("./router/authRoutes");
const personalDetailsRouter = require("./router/personalDetailsRouter");
const investmentPreferencesRouter = require("./router/investmentPreferencesRouter");
const kycRoutes = require("./router/kycRoutes");
const completeFormRoutes = require("./router/completeFormRoutes");
const sendDetailsRoute = require("./router/sendDetailsRouter");



const app = express();

app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// For serving uploaded files (if any)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Connect to MongoDB (use your config file or inline here)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Use routes
app.use("/api", authRoutes);    
app.use("/api/personal_details", personalDetailsRouter);
app.use("/api", sendDetailsRoute);
app.use("/api/investment_preferences", investmentPreferencesRouter);
app.use("/api/kyc", kycRoutes);

app.use("/api/complete-form", completeFormRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
