import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Mic } from "lucide-react";
import { apiConnector } from "@/services/apiConnector";
import { toast } from "sonner";
import { ChevronRight } from 'lucide-react';

// import { uploadToCloudinary } from "../utils/uploadToCloudinary";

export default function CaseDetails({appendToFormData, goToNextStep, description, setDescription}) {
  const [dragActive, setDragActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const mediaRecorderRef = useRef(null); // Ref to MediaRecorder instance
  const [caseAudioLink, setCaseAudioLink] = useState("");
  const [caseTranscribe, setCaseTranscribe] = useState("");


  const [files, setFiles] = useState([]);

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    appendToFormData("description", value);  // Append to formData in parent  };
  }

  const handleFiles = (newFiles) => {
    setFiles(newFiles);
    appendToFormData("caseDocument", newFiles[0]);
  };

  const handleNextClick = (e) => {
    e.preventDefault();
    // Call the parent handler to submit or move to the next step
    goToNextStep();
  };






  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Cloudinary Upload Function (client-side)
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file); // Appending the recorded audio file
    // formData.append("upload_preset", "your_upload_preset"); // Replace with your Cloudinary preset
    formData.append("upload_preset", "whisper-unsigned-preset");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dxa10qp7i/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json(); // Get the Cloudinary response (URL, public_id, etc.)
      return data; // Return response for further processing
    } catch (error) {
      console.error("Error uploading file to Cloudinary:", error);
      return null; // Return null in case of error
    }
  };

  const transcribeAudio = async (audi) => {
    console.log("Transcribing audio...");
    console.log(audi)
    const response = await fetch("http://localhost:5000/transcribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: audi }),
    });

    const data = await response.json();

    return data;
    
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRecording = async () => {
    if (!isRecording) {
      // Start recording
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        let audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
          audioChunks.push(e.data);
        };


        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
          setRecordedAudio(audioBlob);

          // Upload to Cloudinary
          const response = await uploadToCloudinary(recordedAudio);
          if (response) {
            setCaseAudioLink(response.secure_url)
            console.log("Audio uploaded successfully:", response.secure_url);
          }else {
            console.log("error in audio uploading")
          }


          // Transcribe audio
          const transcription = await transcribeAudio(response.secure_url);
          toast.success("Transcription Completed");
          if (transcription) {
            setCaseTranscribe(transcription.transcription);
            console.log("Transcription:", transcription.transcription);
          } else {
            console.log("Error transcribing audio");
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      }
    } else {
      // Stop recording
      mediaRecorderRef.current.stop();
      toast.loading("Loading..");
      setIsRecording(false);
    }

    
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 ">
      <h1 className="text-4xl mb-6 mt-10 tracking-tighter font-semibold">
        Enter Case Details
      </h1>
      <form className="space-y-6">
      <div>
          <Label htmlFor="caseDetails" className="text-lg font-semibold">
            Case Details
          </Label>
          <div className="flex justify-between items-center gap-6">
          <Textarea
              id="caseDetails"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Enter case details / dispute description"
              className="mt-1 w-full"
              rows={4}
            />

            <Mic
              className={`h-10 cursor-pointer ${
                isRecording ? "text-red-500" : ""
              }`}
              size={32}
              onClick={handleRecording}
            />
          </div>
        </div>
        
        {
          caseTranscribe ? (
            <div className="w-full border p-4 rounded-md">
              <p className="text-xl font-semibold">Transcription</p>
              <p className="text-base">{caseTranscribe}</p>
            </div>
          ) : (<div></div>)
        }

        

        <div>
          <Label className="text-lg font-semibold">Upload Files</Label>
          <div
            className={`mt-1 border-2 border-dashed rounded-lg p-10 text-center ${
              dragActive ? "border-primary" : "border-gray-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your files here, or click to select
            </p>
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              Select Files
            </Button>
          </div>
          {files.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium">Uploaded Files:</h4>
              <ul className="mt-2 text-sm text-gray-600">
                {
                  <li>{files[0].name}</li>
                }
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end">
        <Button onClick={handleNextClick} type="submit" className="w-32 right-0 ">
          <div className="flex gap-1 items-center justify-center">
          Next<span><ChevronRight/></span>
          </div>
        </Button>
        </div>
      </form>
    </div>
  );
}
