const express = require("express");
const router = express.Router();

const { auth, isProvider } = require("../middleware/auth");
const { setProfile, getMatchedProviders,getProfile, verifyEnrollment } = require("../controller/Profile");


// Get provider profile (if it exists)
router.get("/getProfile", auth, getProfile);

// Verify enrollment number
router.post("/verifyEnrollment", auth, isProvider, verifyEnrollment);


//set profile (provider only)
router.post("/setprofile", auth, isProvider, setProfile)

router.post("/getMatchedProviders", getMatchedProviders)


module.exports = router