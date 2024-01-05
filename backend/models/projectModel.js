const mongoose = require("mongoose");
const User = require("./userModel");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El proyecto debe tener un nombre"],
  },
  startDate: {
    type: Date,
    required: [true, "El proyecto debe tener una fecha de inicio"],
  },
  endDate: {
    type: Date,
    required: [true, "El proyecto debe tener una fecha de finalización"],
    validate: {
      validator: function (val) {
        if (this.startDate) return val > this.startDate;
        else return true;
      },
      message: "La fecha de finalización debe ser mayor a la fecha de inicio",
    },
  },
  images: {
    type: [String],
    validate: {
      validator: function (val) {
        return val.length > 0;
      },
      message: "El proyecto debe tener por lo menos una imágen",
    },
    required: [true, "Por favor adjunta al menos una imágen de referencia"],
  },
  items: [{ type: mongoose.Schema.ObjectId, ref: "Item" }],
  projectConstructor: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Un proyecto debe tener un constructor asociado"],
    validate: {
      validator: function (val) {
        return User.findById(val).then(
          (user) => user != null && user.role === "constructor"
        );
      },
      message:
        "El proyecto debe pertenecer a un usuario válido y debe ser un usuario constructor",
    },
  },
});

projectSchema.pre(/^find/, function (next) {
  this.populate({
    path: "projectConstructor",
    select: "company",
  }).populate({
    path: "items",
    select: "quantity quantityUnit description price",
  });
  next();
});

projectSchema.statics.validateProjectData = async function (projectData) {
  const validationObj = new this(projectData);
  const validationError = validationObj.validateSync();

  if (validationError) {
    throw validationError;
  }

  return validationObj;
};

projectSchema.index({ name: 1, projectConstructor: 1 }, { unique: true });

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
