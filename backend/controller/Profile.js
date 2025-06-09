const User = require("../models/User");
const Profile = require("../models/Profile");
const { uploadToCloudinary } = require("../utils/uploadToCloudinary");
const { default: axios } = require("axios");
require("dotenv").config();
const FormData = require("form-data");
const mongoose = require('mongoose');


//profile set of advocate
exports.setProfile = async(req,res) => {
    try {
      //get user id
      const userId = req.user.id
  
      //profile pic
      const profilePic = req.files.image;
  
      //get details from req.body
      const {
        gender, 
        about, 
        contactNumber,
        experience,
        age,
        district,
        taluka,
        state,
        university,
        category,
        enrollmentNumber
      } = req.body
  
      //validate required fields
      if(
        !profilePic||
        !gender ||
        !enrollmentNumber ||
        !about ||
        !contactNumber ||
        !experience ||
        !age ||
        !district ||
        !taluka ||
        !university ||
        !category) {
          return res.status(400).json({
            success: false,
            message: "All fields are required",
          });
        }

        console.log("validated")
    console.log("district", district.toUpperCase());
      
      //capitalize words
      const capDistrict = district.toUpperCase()
      const capTaluka = taluka.toUpperCase()
      const BAR_COUNCIL_API = process.env.BAR_COUNCIL_API
      const barName = `${capTaluka} TALUKA   BAR ASSOCIATION,  ${capDistrict}`
      
      //fetch data from bar council
      try {
        //make form data
        const formData = new FormData();
        formData.append("barname", barName);

        console.log("formData", formData)
        
        //make api call
        const response = await axios.post(
            BAR_COUNCIL_API, 
            formData,
            {
                headers: {
                ...formData.getHeaders(),  
                }
            }
          );

          console.log("response", response)

        //find if user is enrolled
        const advocateList = response.data || [];
        const isEnrolled = advocateList.some(advocate => advocate.enrollmentNo == enrollmentNumber);

        if(!isEnrolled) {
            return res.status(400).json({
                success: false,
                message: "Enrollment number not found in Bar Council records",
            })
        }
      }
      catch(error) {
        return res.status(500).json({
          success: false,
          message: "Error while verifying enrollment number with Bar Council",
        })
      }
  
  
      //upload to cloudinary
      const response = await uploadToCloudinary(profilePic, process.env.FOLDER_NAME, 500)
  
      //change profile pic
      await User.findByIdAndUpdate(userId, {
        image: response.secure_url,
      })
  
      //get profile of that user
      const user = await User.findById(userId).populate("additionalDetails")
      const userProfileId = user.additionalDetails._id;
  
      console.log("userProfileId" , userProfileId);
  
      //update profile
      const updatedProfile = await Profile.findByIdAndUpdate(
        userProfileId,
        {
          gender, 
          about, 
          contactNumber,
          experience,
          age,
          district,
          taluka,
          state,
          university,
          category,
          enrollmentNumber
        },
        {
          new: true,
        }
      );
  
      //return response
      return res.status(200).json({
        success: true,
        message: "Profile set successfully",
        data: updatedProfile,
      })
    }
    catch(error) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong while setting profile",
      });
    }
}
  
//TODO: here we are accesssing all providers for now
exports.getMatchedProviders = async(req,res) => {
  try {
    console.log("req.body", req.body.query)
    const description = req.body.query
    const PYTHON_MATCHING = "http://127.0.0.1:6000/recommend"
    // const response = await apiConnector("POST", PYTHON_MATCHING,  
    // {
    //   description
    // })

    const response = await axios.post(PYTHON_MATCHING, {
      query: description
    })

    console.log("response", response.data.matched_lawyers)

    //get matched provider id
    const providerDetails = response.data.matched_lawyers

    //extract all the ids from the array of matched lawyers
    const providerIds = providerDetails.map(item => item.id)
    console.log("providerIds", providerIds)
    
    // Use the newer approach to convert string IDs to MongoDB ObjectIds
    const objectIds = providerIds.map(id => mongoose.Types.ObjectId.createFromHexString(id));
    
    console.log("objectIds", objectIds)
    
    // Query the database to find users where additionalDetails matches any ID in objectIds
    const providers = await User.find({ accountType: "Provider", additionalDetails: { $in: objectIds } }).populate("additionalDetails")

    console.log("providers", providers);

    return res.status(200).json({
      success: true,
      providers: providers,
      message: "Providers are fetched successfully"
    })
  }
  catch(error) {
    return res.status(400).json({
      success: false,
      message: "Error while fetching providers"
    })
  }
}
  
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the user
    const user = await User.findById(userId).populate("additionalDetails");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if provider has set their profile
    // For providers, check if they have the required fields
    if (user.accountType === "Provider") {
      const profile = await Profile.findById(user.additionalDetails);
      
      // Check if profile has necessary fields filled
      const isProfileComplete = profile && 
        profile.category && 
        profile.enrollmentNumber && 
        profile.contactNumber;
      
      return res.status(200).json({
        success: true,
        profile: isProfileComplete ? profile : null
      });
    }
    
    // For clients, return their profile data
    return res.status(200).json({
      success: true,
      profile: user.additionalDetails
    });
    
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message
    });
  }
};

// Verify enrollment number
exports.verifyEnrollment = async (req, res) => {
  try {
    const { enrollmentNumber } = req.body;
    
    if (!enrollmentNumber) {
      return res.status(400).json({
        success: false,
        message: "Enrollment number is required"
      });
    }
    
    // Here you would typically validate against a database of valid enrollment numbers
    // This is a placeholder - you should implement actual validation logic
    
    // Example validation (replace with your actual logic):
    // const isValid = await EnrollmentRegistry.findOne({ number: enrollmentNumber });
    
    // For this example, we'll accept enrollment numbers that are at least 5 chars long
    const isValid = enrollmentNumber.length >= 5;
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment number. You are not authorized to use the system."
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Enrollment number verified successfully"
    });
    
  } catch (error) {
    console.error("Error verifying enrollment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify enrollment number",
      error: error.message
    });
  }
};