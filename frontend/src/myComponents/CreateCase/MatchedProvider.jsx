import { getMatchedProviders } from "@/services/operations/profileAPI";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import ProviderCard from "../common/ProviderCard";
import { Button } from "@/components/ui/button";
import { FileCheck2 } from 'lucide-react';


const MatchedProvider = ({appendToFormData, handleCaseCreation, query}) => {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const getInstructors = async () => {
      setLoading(true);

      const matchedInstructors = await getMatchedProviders(query);

      if (matchedInstructors) {
        setProviders(matchedInstructors);
      }

      setLoading(false);

      console.log("from frontend: ", providers);
    };
    getInstructors();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 flex flex-col">
      <div className="flex flex-col gap-2">
      <h1 className="text-5xl mt-5 tracking-tighter font-semibold">
        Matched Providers
      </h1>
      <p className="opacity-70 tracking-tight">Choose any one of the provider to resolve your legal problem</p>
      </div>
      

      <div>
      {providers && providers.length > 0 ? (
        <div className="flex flex-row mt-10 items-center justify-center gap-10 flex-wrap">
          {providers.map((provider) => (
            <ProviderCard appendToFormData={appendToFormData} handleCaseCreation={handleCaseCreation} provider={provider} key={provider._id} />
          ))}
        </div>
      ) : (
        <p>No matched providers found.</p>
      )}
      </div>

      <div className="flex items-center justify-center">
      <Button variant="default" className="mt-10 w-[50%]" onClick={handleCaseCreation}>
        <div className="flex  items-center justify-center gap-4 ">
        Create Case 
        <FileCheck2/>
        </div>
      </Button>
      </div>
    </div>
  );
};

export default MatchedProvider;
