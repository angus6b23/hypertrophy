import express from "express";
import "dotenv/config";
import { authRouter } from "./routes/auth";
import { seedExercise } from "./utils/seed-exercise";
import { measurementRouter } from "./routes/measurements";

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
seedExercise();

app.use("/auth", authRouter);
app.use("/measurement", measurementRouter);
