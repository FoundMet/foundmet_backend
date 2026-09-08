import mongoose from "mongoose";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "0.0.0.0"]);
async function connectionDb() {
  try {
    if (!process.env.MONGO_URI) {
      console.log("MongoUri Is Missing In .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDb Connected");
  } catch (error) {
    console.log("Mongodb Connection Error:", error);
  }
}
export default connectionDb;
