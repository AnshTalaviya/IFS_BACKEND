// Infiniumproject06
//mongodb+srv://praptivirugama08:Infiniumproject06@cluster0.3vtbriy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));
