import express from "express";
import "dotenv/config";
import { authRouter } from "./routes/auth";
import { seedExercise } from "./utils/seed-exercise";
import { measurementRouter } from "./routes/measurements";
import { statusRouter } from "./routes/status";

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
seedExercise();

app.use("/auth", authRouter);
app.use("/measurement", measurementRouter);
app.use("/status", statusRouter);
