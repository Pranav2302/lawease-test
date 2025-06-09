import CaseDetails from "@/myComponents/CreateCase/CaseDetails";
import MatchedProvider from "@/myComponents/CreateCase/MatchedProvider";
import { createCase } from "@/services/operations/caseAPI";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
MatchedProvider;

const CaseCreation = () => {
  const [step, setStep] = useState(1);
  const [formData] = useState(new FormData());
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [description, setDescription] = useState("");


  const token = useSelector((state) => state.auth.token);

  const goToNextStep = () => {
    setStep(2);
  };

  const appendToFormData = (key, value) => {
    formData.set(key, value); // Use set to ensure updating existing keys
    console.log([...formData]);
  };

  //call for the backend
  const handleCaseCreation = async () => {
    try {
      console.log("Uploading Files...");
      setLoading(true);
      dispatch(createCase(token, formData, navigate)).then(() => setLoading(false));

    } catch (error) {
      console.log("ERROR WHILE SENDING FORM DATA TO SERVICES", error);
    }
  };

  return (
    <div className="mt-14">
      {step === 1 ? (
        <CaseDetails
          description={description}
          setDescription={setDescription}
          appendToFormData={appendToFormData}
          goToNextStep={goToNextStep}
        />
      ) : (
        <MatchedProvider
          query={description}
          appendToFormData={appendToFormData}
          handleCaseCreation={handleCaseCreation}
        />
      )}
    </div>
  );
};

export default CaseCreation;
