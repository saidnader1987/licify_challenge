const path = require("path");
const express = require("express");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const projectRouter = require("./routers/projectRouter");
const userRouter = require("./routers/userRouter");
const quotationRouter = require("./routers/quotationRouter");

const app = express();

// CORS
app.use(
  cors({
    origin: "*",
  })
);

// SERVING STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// DEVELOPMENT LOGGING MIDDLEWARE
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// BODY PARSING MIDDLEWARE
app.use(express.json());

// DATA SANITIZATION MIDDLEWARE
app.use(mongoSanitize());

// ROUTERS
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/quotations", quotationRouter);

app.all("*", (req, res, next) => {
  next(
    new AppError(
      `No se encontró la ruta ${req.originalUrl} en el servidor`,
      404
    )
  );
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
