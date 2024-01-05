const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Por favor dinos tu nombre"],
  },
  company: {
    type: String,
    required: [true, "Por favor dinos el nombre de tu compañía"],
  },
  email: {
    type: String,
    required: [true, "Por favor brindanos tu correo electrónico"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "No es un correo elctrónico valido"],
  },
  role: {
    type: String,
    required: [true, "Se debe escoger un rol entre constructor y proveedor"],
    enum: {
      values: ["constructor", "proveedor"],
      message:
        'El rol `{VALUE}` no es válido. Solo se permite "constructor" o "proveedor".',
    },
  },
  password: {
    type: String,
    required: [true, "Por favor suministra una contraseña"],
    minlength: [8, "La contraseña debe tener por lo menos 8 caracteres"],
    validate: [
      {
        validator: function (val) {
          return /[0-9]/.test(val);
        },
        message: "La contraseña debe tener un número",
      },
      {
        validator: function (val) {
          return /[a-z]/.test(val);
        },
        message: "La contraseña debe tener al menos una letra minúscula",
      },
      {
        validator: function (val) {
          return /[A-Z]/.test(val);
        },
        message: "La contraseña debe tener al menos una letra mayúscula",
      },
      {
        validator: function (val) {
          return /[.,€@_!#$%^&*()<>?/\|}{~:]/.test(val);
        },
        message: "La contraseña debe tener al menos un caracter especial",
      },
    ],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Por favor confirma tu contraseña"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Las contraseñas no coinciden",
    },
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(String(candidatePassword), userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
