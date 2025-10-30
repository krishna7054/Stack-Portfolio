import express from "express";
import cors from "cors";
import routes from "./routes";
import rateLimiter from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors({ origin: "*" })); // Allow all origins for simplicity
app.use(express.json());
app.use(rateLimiter); // basic rate limiting for incoming requests

app.use("/api", routes);

app.use(errorHandler);

export default app;
