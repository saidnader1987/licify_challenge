const fs = require("fs");
const util = require("util");
const path = require("path");

const multer = require("multer");
const sharp = require("sharp");

const Project = require("./../models/projectModel");
const Quotation = require("./../models/quotationModel");
const Item = require("./../models/itemModel");
const factory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const unlinkAsync = util.promisify(fs.unlink);
const deleteImages = async (images) => {
  const deletePromises = images.map((image) => {
    const imagePath = path.join(__dirname, `../public/img/projects/${image}`);
    return unlinkAsync(imagePath);
  });

  await Promise.all(deletePromises);
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(
      new AppError("Solo se permiten archivos de tipo imágen", 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProjectImages = upload.fields([{ name: "images", maxCount: 3 }]);

exports.resizeProjectImages = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.images || req.files.images.length === 0) {
    return next(
      new AppError("El proyecto debe incluir al menos una imágen", 400)
    );
  }

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `user-${req.user.id}-${Date.now()}-${i + 1}.jpg`;
      await sharp(file.buffer)
        .resize(600, 600)
        .toFormat("jpg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/projects/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
});

exports.getAllProjects = factory.getAll(Project);

exports.getProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(
      new AppError(
        `No se encontro un documento para el id: ${req.params.id}`,
        404
      )
    );
  }

  // Constructor user can only see his own projects. Other users can see them all
  if (
    req.user.role === "constructor" &&
    project.projectConstructor._id.toString() !== req.user.id
  ) {
    return next(
      new AppError("No tienes permisos para acceder a este documento", 403)
    );
  }

  res.status(200).json({
    status: "success",
    data: project,
  });
});

exports.getProjectQuotations = catchAsync(async (req, res, next) => {
  const projectId = req.params.projectId;

  // Constructor user can only see quotations of his own projects. This route is already restricted by the restrictTo middleware so suppliers can't access it
  if (req.user.role === "constructor") {
    const project = await Project.findById(projectId);
    if (!project || project.projectConstructor._id.toString() !== req.user.id) {
      return next(
        new AppError("No tienes permisos para acceder a este documento", 403)
      );
    }
  }

  const quotations = await Quotation.find({ project: projectId });

  res.status(200).json({
    status: "success",
    results: quotations.length,
    data: quotations,
  });
});

exports.getProjectSupplierQuotation = catchAsync(async (req, res, next) => {
  const projectId = req.params.projectId;
  const userId = req.params.userId;

  // Supplier user can only access this route if he is the owner of the requested quotations
  if (req.user.role === "proveedor" && userId !== req.user.id)
    return next(
      new AppError("No tienes permisos para acceder a estos documento", 403)
    );

  // Constructor user can only access this route if he is the project's owner
  if (req.user.role === "constructor") {
    const project = await Project.findById(projectId);
    if (!project || project.projectConstructor._id.toString() !== req.user.id) {
      return next(
        new AppError("No tienes permisos para acceder a estos documentos", 403)
      );
    }
  }

  const quotations = await Quotation.find({
    project: projectId,
    supplier: userId,
  });

  res.status(200).json({
    status: "success",
    results: quotations.length,
    data: quotations,
  });
});

exports.createProject = catchAsync(async (req, res, next) => {
  const { items: itemsData, ...projectData } = req.body;
  projectData.projectConstructor = req.user.id;

  try {
    // Validate that there are items in the request
    if (!req.body.items || req.body.items.length === 0) {
      throw new AppError("El proyecto debe tener por lo menos un item", 400);
    }

    // Validate all items
    for (const itemData of itemsData) {
      await Item.validateItemData(itemData);
    }

    // Validate project data
    await Project.validateProjectData(projectData);

    // All validations passed, create items and project
    const createdItems = await Promise.all(
      itemsData.map((item) => new Item(item).save())
    );
    const createdItemIds = createdItems.map((item) => item._id);
    const createdProject = await new Project({
      ...projectData,
      items: createdItemIds,
    }).save();

    res.status(201).json({
      status: "success",
      data: createdProject,
    });
  } catch (error) {
    // If images were saved, delete them
    if (req.body.images && req.body.images.length > 0) {
      await deleteImages(req.body.images);
    }
    // Forward the error
    next(error);
  }
});
