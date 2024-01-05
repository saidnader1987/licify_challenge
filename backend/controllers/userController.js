const User = require("./../models/userModel");
const factory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Project = require("./../models/projectModel");

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.createUser = factory.createOne(User);

exports.getUserProjects = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  // Constructor user can't access this route if he is not the owner of the requested projects
  if (req.user.role === "constructor" && req.user.id !== userId) {
    {
      return next(
        new AppError("No tienes permisos para acceder a estos documentos", 403)
      );
    }
  }

  const projects = await Project.find({ projectConstructor: userId });

  res.status(200).json({
    status: "success",
    results: projects.length,
    data: projects,
  });
});
