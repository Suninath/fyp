import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../ui/ui/button";
import CreateVehicleForm from "../../components/userComp/CreateVehicleForm";

const CreateVehiclePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Vehicle Listing</h1>
          <p className="text-gray-600 mt-2">
            Add your vehicle to our marketplace and reach thousands of potential buyers.
          </p>
        </div>

        <CreateVehicleForm />
      </div>
    </div>
  );
};

export default CreateVehiclePage;