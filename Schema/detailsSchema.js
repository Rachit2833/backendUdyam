const mongoose = require("mongoose");

const detailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: [48, "Name cannot exceed 48 characters"],
    minlength: [4, "Name should be at least 4 characters"],
  },
  adharNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{12}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid 12-digit Aadhaar number!`,
    },
    unique: true,
  },
  panNumber: {
    type: String,
    uppercase: true,
    required: false,
    validate: {
      validator: function (v) {
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid PAN number!`,
    },
    unique: true,
  },
});

module.exports = mongoose.model("Detail", detailSchema);
