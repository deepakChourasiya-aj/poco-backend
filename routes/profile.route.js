const { cloudinary } = require("../configuration/cloudinary");
const { validRoleAuth } = require("../middlewares/validRoleAuth");
const { DoctorsProfile } = require("../models/profile.model");
const { User } = require("../models/user.model");
const { upload } = require("./saveToCloud");
const multer = require("multer");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const { Slots } = require("../models/slots");
const doctorProfileRoute = express.Router();

doctorProfileRoute.post(
  "/profile",
  validRoleAuth(["doctor"]),
  async (req, res) => {
    try {
      const token = req.headers.authorization || req.cookies.token;
      let decoded = jwt.verify(token, process.env.JWT_SECRET);
      const checkIsPresent = await User.findOne({ _id: decoded.userID });
      console.log(checkIsPresent);
      if (!checkIsPresent) {
        return res.send({ msg: "User not found" });
      }
      const image =
        "https://res.cloudinary.com/dztjvqlxe/image/upload/v1687435054/ywuvlqu93g6mumx2p2tf.jpg";
      const {
        doctorName,
        qualifications,
        speciality,
        experience,
        setfees,
        city,
      } = req.body;
      let doctor = new DoctorsProfile({
        doctorId: checkIsPresent._id,
        image,
        doctorName,
        qualifications,
        speciality,
        experience,
        setfees,
        city
      });
      let saved = await doctor.save();
      if (saved) {
        return res.status(201).send({ msg: "Doctor has been created", saved });
      } else {
        return res.status(500).send({ msg: "Server error try after sometime" });
      }
    } catch (error) {
      res.send({ msg: "server error" });
    }
  }
);

doctorProfileRoute.get("/doctor/:doctorId", async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const doctor = await DoctorsProfile.findOne({ doctorId });
    const slot = await Slots.findOne({ doctorId });
    if (doctor && slot) {
      return res.send({ msg: "doctor is available", data: { doctor, slot } });
    }
    if (doctor != null) {
      {
        return res.send({
          msg: "No slots is available for this doctor",
          data: { doctor },
        });
      }
    } else {
      return res.send({
        msg: "Doctor not found ",
      });
    }
  } catch (error) {
    console.log("error", error);
    res.send({ msg: "error", error: error });
  }
});

doctorProfileRoute.get("/alldoctors", async (req, res) => {
  try {
    const doctors = await DoctorsProfile.find({});
    console.log(doctors);
    res.send({ msg: "doctors", doctors: doctors });
  } catch (error) {
    console.log("error", error);
    res.send({ msg: "error", error: error });
  }
});

module.exports = {
  doctorProfileRoute,
};
