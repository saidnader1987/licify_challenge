const mongoose = require("mongoose");
const User = require("./userModel");
const Project = require("./projectModel");
const AppError = require("../utils/appError");

const quotationSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "La oferta debe tener un proveedor asociado"],
    validate: {
      validator: function (val) {
        return User.findById(val).then(
          (user) => user != null && user.role === "proveedor"
        );
      },
      message:
        "El oferta debe pertenecer a un usuario válido y debe ser un usuario proveedor",
    },
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: "Project",
    required: [true, "La oferta debe tener un proyecto asociado"],
    validate: {
      validator: function (val) {
        return Project.findById(val).then((project) => project != null);
      },
      message: "La oferta debe tener un proyecto asociado",
    },
  },
  items: [
    {
      item: {
        type: mongoose.Schema.ObjectId,
        ref: "Item",
        required: [
          true,
          "Cada ítem de la oferta debe referenciar un ítem del proyecto",
        ],
      },
      quotedPrice: {
        type: Number,
        required: [true, "El item debe tener una cotización"],
        validate: {
          validator: function (val) {
            return val > 0;
          },
          message: "El precio debe ser mayor que cero",
        },
      },
    },
  ],
});

quotationSchema.pre(/^find/, function (next) {
  this.populate({
    path: "supplier",
    select: "company",
  })
    .populate({
      path: "items.item",
      select: "quantity quantityUnit description price",
    })
    .populate({
      path: "project",
      select: "name -projectConstructor -items",
    });
  next();
});

quotationSchema.pre("save", async function (next) {
  const project = await Project.findById(this.project).select("items").lean();

  if (!project) {
    return next(new Error("El proyecto asociado no existe"));
  }

  const projectItemIds = new Set(
    project.items.map((item) => item._id.toString())
  );
  const quotationItemIds = new Set(
    this.items.map((item) => item.item.toString())
  );

  if (!Array.from(projectItemIds).every((id) => quotationItemIds.has(id))) {
    return next(
      new AppError("No todos los ítems del proyecto están en la cotización")
    );
  }

  if (quotationItemIds.size !== this.items.length) {
    return next(new AppError("La cotización contiene ítems duplicados"));
  }

  next();
});

quotationSchema.index({ project: 1, supplier: 1 }, { unique: true });

const Quotation = mongoose.model("Quotation", quotationSchema);

module.exports = Quotation;
