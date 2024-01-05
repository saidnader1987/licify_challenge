const { promisify } = require("util");

const jwt = require("jsonwebtoken");

const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exists
  if (!email || !password) {
    return next(
      new AppError("Por favor danos tu correo electrónico y contraseña", 400)
    );
  }
  // 2) Check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(
      new AppError("Correo electrónico o contraseña incorrectos", 401)
    );

  // 3) If everything is ok, send token to user
  createAndSendToken(user, 200, res);
});

// exports.logout = (req, res, next) => {
//   res.cookie("jwt", "logged-out", {
//     expires: new Date(Date.now() + 10 * 1000), // 10 seconds
//     httpOnly: true,
//   });
//   res.status(200).json({ status: "success" });
// };

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token and check if it exists
  let token = "";
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    return next(
      new AppError(
        "Por favor inicia sesión para que te podamos garantizar acceso",
        401
      )
    );

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "El usuario al que le pertenece este token ya no existe",
        401
      )
    );
  }

  // GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("No tienes permiso para realizar esta acción", 403)
      );
    next();
  };
};
