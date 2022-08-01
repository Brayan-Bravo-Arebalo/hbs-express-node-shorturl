const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const { Schema } = mongoose;
const userSchema = new Schema({
  userName: {
    type: String,
    lowarcase: true,
    required: true,
  },
  email: {
    type: String,
    lowarcase: true,
    required: true,
    unique: true,
    index: { unique: true },
  },
  password: {
    type: String,
    requered: true,
  },
  tokenConfirm: {
    type: String,
    default: null,
  },
  CuentaConfirmada: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    defaild: null,
  },
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(user.password, salt);
    user.password = hash;
    next();
  } catch (error) {
    console.log(error);
    next();
  }
});

userSchema.methods.comparePassword = async function (canditePassword) {
  return await bcryptjs.compare(canditePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
