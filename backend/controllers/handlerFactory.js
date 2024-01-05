const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);
    const doc = await query;
    if (!doc) {
      return next(
        new AppError(
          `No se encontro un documento para el id: ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const query = Model.find();
    const doc = await query;
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: doc,
    });
  });

exports.restrictToOwnerGetOne = (Model, ownerField) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);
    const doc = await query;

    if (!doc) {
      return next(
        new AppError(
          `No se encontro un documento para el id: ${req.params.id}`,
          404
        )
      );
    }

    if (
      ownerField &&
      doc[ownerField] &&
      doc[ownerField]._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(
        new AppError("No tienes permisos para acceder a este documento", 403)
      );
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
