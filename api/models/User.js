const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required."],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required."],
      trim: true,
      validate: {
        validator: function (val) {
          const digitsOnly = val.replace(/\s+/g, "");
          return /^\d{9,13}$/.test(digitsOnly);
        },
        message: "Phone number must be 9 to 13 digits (spaces allowed).",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    consent: {
      type: Boolean,
      required: [true, "Privacy notice consent is required."],
      validate: {
        validator: (val) => val === true,
        message: "You must agree to the Privacy Notice.",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("User", userSchema);