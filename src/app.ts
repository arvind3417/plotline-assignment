import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { httpResponse } from "./helpers";
import { userRouter } from "./routes/userRoutes";
import { authRouter } from "./routes/authRoutes";
import { productRouter } from "./routes/productRoutes";
// import { cartController } from "./controllers/cartController";
import { routeNotFound } from "./middleware/routeNotFound";
import { errorHandler } from "./middleware/errorHandler";

import { PORT, BASEURL } from "./constants";


import { connectDB } from "./db";
import { billController } from "./controllers/billController";
import { ServiceRouter } from "./routes/serviceRoutes";
import { cartRouter } from "./routes/cartRoutes";
import { billRouter } from "./routes/billRoutes";

// Use express app 
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
// app.get("/users/:userId/totalbill", billController)
app.use('/users',cartRouter)
app.use('/users',billRouter)

app.use(`${BASEURL}/services`, ServiceRouter);

app.use(`${BASEURL}/products`, productRouter);
app.use(`${BASEURL}/auth`, authRouter); 
app.use(`${BASEURL}/users`, userRouter);
app.use("/ok", (_req, res) =>
  res.status(200).send(httpResponse(true, "OK", {}))
);

// Custom middleware
app.use(routeNotFound);
app.use(errorHandler);

const port = process.env.PORT || PORT;

try {
  // connect to database
  if (!process.env.CONNECTIONSTR)
    throw new Error("No connection string found in .env file");
  connectDB(process.env.CONNECTIONSTR);

  // Server setup
  app.listen(port, () => {
    console.log(`Server listening on: http://localhost:${port}/`);
  });
} catch (error) {
  console.error(error);
}
