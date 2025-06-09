const Milestone = require("../models/Milestone")
const Case = require("../models/Case")
const User = require("../models/User")
const { uploadToCloudinary } = require("../utils/uploadToCloudinary")

//for client
exports.createCase = async(req,res) => {
    console.log(req.body)
    try {
        const userId = req.user.id

        let {
            description,
            status,
            serviceProvider,
            caseAudio,
        } = req.body

        const doc = req.files.caseDocument

        if(!description || !serviceProvider) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        if(!status || status == "undefined") {
            status = "Open"
        }

       //upload casedocument to cloudinary
        const caseDocument = await uploadToCloudinary(
            doc,
            process.env.FOLDER_NAME
        )
        console.log("CaseDocument: ", caseDocument)

        //create a new case
        const newCase = await Case.create({
            description,
            status,
            serviceProvider,
            caseAudio,
            caseDocument: caseDocument.secure_url,
        })

        //put a case in a user case collection
        await User.findByIdAndUpdate(userId,
            {
                $push: {
                    cases: newCase._id
                }
            },
            {new: true}
        );

        //put case in a pendingCases of a Provider
        await User.findByIdAndUpdate(
            {
                _id: serviceProvider
            },
            {
                $push: {
                    pendingCaseRequest: newCase._id
                }
            },
            {new: true}
        )


        return res.status(200).json({
            success: true,
            data: newCase,
            message: "Case created successfully"
        })

    }
    catch(error) {
        console.log(error)
        return res.status(400).json({ success: false, message: "Error while creating case" })
    }
}

//for provider
exports.acceptCase = async(req,res) => {
    try {
        //take case id
        const {caseId} = req.body

        console.log(req.body)

        //take userid
        const userId = req.user.id

        console.log("userId: ", userId)

        //if caseId missing
        if(!caseId) {
            return res.status(400).json({ 
                success: false, 
                message: "Case id is required" 
            })
        }

        //find case of that id 
        const caseData = await Case.findById(caseId)

        console.log("caseData: ", caseData)

        //make basic milestone and add to the case
        const milestone1 = await Milestone.create({
            title: "Case accepted",
            description: "Case is accepted by the service provider",
            status: "Complete",
        })

        console.log("milestone1: ", milestone1)

        const milestone2 = await Milestone.create({
            title: "Consultation",
            description: "Consultation of proposed case is done",
            status: "Incomplete",
        })

        const milestone3 = await Milestone.create({
            title: "Case Resolved",
            description: "Case is resolved by the service provider",
            status: "Incomplete",
        })
        
        //push milestones into case
        await Case.findByIdAndUpdate(caseId, {
            $push: {
                caseMilestones: { $each: [milestone1._id, milestone2._id, milestone3._id] }
            }
        })

        //update status
        await Case.findByIdAndUpdate(caseId, {
            status: "In-progress"
        })

        //remove from pendingCaseRequest of user
        await User.findByIdAndUpdate(userId, {
            $pull: {
                pendingCaseRequest: caseId
            }
        })

        //add to the cases collection of that user
        await User.findByIdAndUpdate(userId, {
            $push: {
                cases: caseData._id
            }
        })

        return res.status(200).json({ 
            success: true, 
            message: "Case accepted successfully" 
        })
    }
    catch(error) {
        return res.status(400).json({ 
            success: false, 
            message: "Error while accepting case" 
        })
    }
}

//reject case
exports.rejectCase = async(req,res) => {
    try {
        //take case id
        const {caseId} = req.body

        //take userid
        const userId = req.user.id

        //if caseId missing
        if(!caseId) {
            return res.status(400).json({ 
                success: false, 
                message: "Case id is required" 
            })
        }

        //access that case
        const caseData = await Case.findById(caseId)

        //change status of that case
        await Case.findByIdAndUpdate(caseId, {
            status: "Rejected"
        })

        //remove from pendingCaseRequest of user
        await User.findByIdAndUpdate(userId, {
            $pull: {
                pendingCaseRequest: caseId
            }
        })

        return res.status(200).json({ 
            success: true, 
            message: "Case rejected successfully" 
        })
    }
    catch(error) {
        return res.status(400).json({ 
            success: false, 
            message: "Error while rejecting case" ,
            error : error
        })
    }
}

//is case created 
exports.isCaseCreated = async(req,res) => {
    try {
        const email = req.query.email        
        const user = await User.findOne({ email: email }).populate("cases").populate("pendingCaseRequest")
        console.log("email: ", email)
        //if any case is present in pending or cases return it 
        if (user.pendingCaseRequest.length > 0) {
            return res.status(200).json({ 
                success: true, 
                data: user.pendingCaseRequest,
                message: "Pending case requests fetched successfully"
            })
        }
        else if (user.cases.length > 0) {
            return res.status(200).json({ 
                success: true, 
                data: user.cases,
                message: "Cases fetched successfully"
            })
        }
        else {
            return res.status(200).json({ 
                success: true, 
                data: [],
                message: "Cases fetched successfully"
            })
        }
    }
    catch(error) {
        return res.status(400).json({ 
            success: false, 
            message: "Error while fetching cases" 
        })
    }
}

//get all cases (for client and provider)
exports.getAllCases = async(req,res) => {
    try {
        //get user id
        const userId = req.user.id
        console.log("user: ", userId)

        //get user data
        const userData = await User.findById(userId).populate('cases');

        //get all cases of that user
        const cases = userData.cases;

        return res.status(200).json({ 
            success: true, 
            data: cases,
            message: "Cases fetched successfully" 
        })
    }
    catch(error) {
        return res.status(400).json({ 
            success: false, 
            message: "Error while fetching cases" 
        })
    }
}

//get all pending cases
exports.getAllPendingCases = async(req,res) => {
    try {
        //get user id
        const userId = req.user.id

        //get user data
        const userData = await User.findById(userId).populate('pendingCaseRequest')

        //get all cases of that user
        const pendingCases = userData.pendingCaseRequest;

        return res.status(200).json({ 
            success: true, 
            data: pendingCases,
            message: "Cases fetched successfully" 
        })
    }
    catch(error) {
        return res.status(400).json({ 
            success: false, 
            message: "Error while fetching cases" 
        })
    }
}

exports.getAllCasesWithClients = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.accountType;
        
        // Find the user with their cases
        const user = await User.findById(userId)
            .populate({
                path: 'cases',
                populate: [
                    {
                        path: 'serviceProvider',
                        select: 'firstName lastName email additionalDetails',
                        populate: {
                            path: 'additionalDetails',
                            select: 'contactNumber'
                        }
                    },
                    {
                        path: 'caseMilestones'
                    }
                ]
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // For provider: Get client details for each case
        if (userRole === "Provider") {
            // This will hold cases with client information
            const casesWithClientInfo = [];
            
            // For each case in the provider's cases
            for (const caseItem of user.cases) {
                // Find clients who have this case in their cases array
                const client = await User.findOne({
                    cases: caseItem._id,
                    accountType: "Client"
                }).select('firstName lastName email additionalDetails')
                .populate('additionalDetails', 'contactNumber');

                if (client) {
                    // Create a new object with case and client information
                    casesWithClientInfo.push({
                        ...caseItem.toObject(),
                        clientName: `${client.firstName} ${client.lastName}`,
                        clientEmail: client.email,
                        clientContact: client.additionalDetails?.contactNumber || "No contact provided"
                    });
                }
            }

            return res.status(200).json({
                success: true,
                data: casesWithClientInfo,
                message: "All cases with client information retrieved successfully"
            });
        }
        
        // For client: Return their cases with provider details
        return res.status(200).json({
            success: true,
            data: user.cases,
            message: "All cases retrieved successfully"
        });

    } catch (error) {
        console.error("Error in getAllCasesWithClients:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch cases",
            error: error.message
        });
    }
};
// Update case status
exports.updateCaseStatus = async (req, res) => {
    try {
        const { caseId, status } = req.body;
        const providerId = req.user.id;

        if (!caseId || !status) {
            return res.status(400).json({
                success: false,
                message: "Case ID and status are required"
            });
        }

        const case_ = await Case.findById(caseId);
        
        if (!case_) {
            return res.status(404).json({
                success: false,
                message: "Case not found"
            });
        }

        // Verify the provider is authorized to update this case
        if (case_.serviceProvider.toString() !== providerId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this case"
            });
        }

        // Update the case status
        case_.status = status;
        await case_.save();

        return res.status(200).json({
            success: true,
            message: "Case status updated successfully"
        });

    } catch (error) {
        console.error("Error in updateCaseStatus:", error);
        return res.status(500).json({
            success: false,
            message: "Error while updating case status",
            error: error.message
        });
    }
};

exports.uploadPdfForSummary = async(req, res) => {
    try {
        // Check if this is a summary request (GET) or an upload request (POST)
        if (req.method === 'GET') {
            try {
              const axios = require('axios');
              
              const summaryResponse = await axios.get(
                'https://c4be-34-125-86-193.ngrok-free.app//get_summary?file_path=/content/downloaded_file.pdf',
                { 
                  headers: { 'Content-Type': 'application/json' }
                }
              );
              
              // Return the summary directly from the external API
              return res.status(200).json({
                success: true,
                summary: summaryResponse.data.summary
              });
            } catch (error) {
              console.error("Error generating PDF summary:", error);
              return res.status(500).json({
                success: false,
                message: "Failed to generate summary",
                error: error.message
              });
            }
          }
        
        // This is an upload request (POST)
        const pdfFile = req.files.pdfFile;
        
        if (!pdfFile) {
            return res.status(400).json({
                success: false,
                message: "PDF file is required"
            });
        }
        
        // Step 1: Upload PDF to Cloudinary
        const uploadResult = await uploadToCloudinary(pdfFile, "case_pdfs");
        
        if (!uploadResult || !uploadResult.secure_url) {
            return res.status(400).json({
                success: false,
                message: "PDF upload to Cloudinary failed"
            });
        }
        
        const pdfUrl = uploadResult.secure_url;
        
        // Step 2: Process the PDF with external API 
        const axios = require('axios');
        let processingResult = null;
        let processingSuccess = false;
        
        try {
            const processingResponse = await axios.post(
                'https://c4be-34-125-86-193.ngrok-free.app/download_pdf',
                { url: pdfUrl },
                { 
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            
            processingResult = processingResponse.data;
            processingSuccess = true;
        } catch (processingError) {
            console.error("PDF processing error:", processingError);
            // We'll continue even if processing fails, since the upload was successful
        }
        
        // Return both the URL and processing result
        return res.status(200).json({
            success: true,
            pdfUrl: pdfUrl,
            processingSuccess: processingSuccess,
            processingResult: processingResult
        });
        
    } catch(error) {
        console.error("Error in PDF upload and processing:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to upload and process PDF",
            error: error.message
        });
    }
};