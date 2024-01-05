const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: [true, "El item debe tener una cantidad"],
    validate: {
      validator: function (val) {
        return val > 0;
      },
      message: "La cantidad debe ser mayor que cero",
    },
  },
  description: {
    type: String,
    required: [true, "El item debe tener una descripción"],
  },
  quantityUnit: {
    type: String,
    required: [true, "El item debe tener una unidad"],
  },
  price: {
    type: Number,
    required: [true, "El item debe tener un valor unitario"],
    validate: {
      validator: function (val) {
        return val > 0;
      },
      message: "El valor unitario debe ser mayor que cero",
    },
  },
});

itemSchema.statics.validateItemData = async function (itemData) {
  const validationObj = new this(itemData);
  const validationError = validationObj.validateSync();

  if (validationError) {
    throw validationError;
  }

  return validationObj;
};

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
