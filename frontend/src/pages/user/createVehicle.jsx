import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../ui/ui/button";
import CreateVehicleForm from "../../components/userComp/CreateVehicleForm";

const CreateVehiclePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          onClick={() => navigate('/vehicles')}
          className="mb-6 flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <CreateVehicleForm />
      </div>
    </div>
  );
};

export default CreateVehiclePage;