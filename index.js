import express from "express";
import crypto from "crypto";
import ethers from "ethers";
import { connect } from "./connectDB.js";
import jwt from "jsonwebtoken";
import User from "./model/user.model.js";

const app = express();

app.use(express.json());
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  try {
    const message = "Welcome to the EJS template!";
    const data = { message };

    // Render the EJS template
    res.render("index", data);
  } catch (error) {
    console.error(error);
  }
});

connect();

// GET route to retrieve a nonce value for use in signing
app.get("/api/nonce", (req, res) => {
  // Generate a random 32-byte value to use as the nonce
  const nonce = crypto.randomBytes(32).toString("hex");
  // Return the nonce value as a JSON object in the response body
  res.json({ nonce });
});

const secretKey = "mySecretKey";

app.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    const { signedMessage, message, address } = req.body;
    const recoveredAddress = ethers.utils.verifyMessage(message, signedMessage);
    console.log("Recovermessage: ", recoveredAddress);
    if (recoveredAddress !== address) {
      return res.status(401).json({ error: "Invalid signature" });
    }
    const existUser = await User.findOne({ signature: signedMessage });
    if (existUser) {
      existUser.nonce = req.body.message.split(" ")[10];
      await existUser.save();
    } else {
      await User.create({
        signature: signedMessage,
        nonce: req.body.message.split(" ")[10],
      });
    }

    // Generate the JWT token
    const token = jwt.sign({ address, signature: signedMessage }, secretKey, {
      expiresIn: "10s",
    });
    console.log("Access Token:", token);
    // Send the JWT token to the frontend
    res.json(token);
  } catch (error) {
    console.log(error);
  }
});

// Endpoint for verifying the JWT token and logging in the user
app.post("/verify", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const token = authHeader.split(" ")[1];

    // Verify the JWT token
    const decoded = jwt.verify(token, secretKey);
    console.log("Decode: ", decoded);
    const currentTime = Math.floor(Date.now() / 1000);
    console.log(currentTime);
    if (decoded.exp < currentTime) {
      return res.json("tokenExpired");
    } else {
      await User.findOneAndUpdate(
        {
          signature: decoded.signature,
        },
        {
          $set: { nonce: "" },
        }
      );
      return res.json("ok");
    }
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Serve the success page
app.get("/success", async (req, res) => {
  try {
    res.render("success");
  } catch (error) {
    console.error(error);
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
