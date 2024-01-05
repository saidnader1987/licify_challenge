const Project = require("./../models/projectModel");
const Quotation = require("./../models/quotationModel");
const factory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.getAllQuotations = factory.getAll(Quotation);
exports.createQuotation = catchAsync(async (req, res, next) => {
  req.body.supplier = req.user.id;
  const quotation = await Quotation.create(req.body);
  res.status(201).json({
    status: "success",
    data: quotation,
  });
});

exports.getQuotation = catchAsync(async (req, res, next) => {
  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) {
    return next(
      new AppError(
        `No se encontro un documento para el id: ${req.params.id}`,
        404
      )
    );
  }

  // Supplier user can only access this route if he is the owner of the quotation
  if (
    req.user.role === "proveedor" &&
    quotation.supplier._id.toString() !== req.user.id
  ) {
    return next(
      new AppError("No tienes permisos para acceder a este documento", 403)
    );
  }

  // Constructor user can only access this route if he is the quoted project's owner
  if (req.user.role === "constructor") {
    const project = await Project.findById(quotation.project);
    if (!project || project.projectConstructor._id.toString() !== req.user.id) {
      return next(
        new AppError("No tienes permisos para acceder a este documento", 403)
      );
    }
  }

  res.status(200).json({
    status: "success",
    data: quotation,
  });
});
