import React from "react";
import CreateVehicleForm from "../../components/userComp/CreateVehicleForm";

const CreateVehiclePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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