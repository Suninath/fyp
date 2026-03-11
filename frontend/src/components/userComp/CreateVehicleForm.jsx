import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../ui/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/ui/card";
import { Input } from "../../ui/ui/input";
import { Label } from "../../ui/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/ui/select";
import { Textarea } from "../../ui/ui/textarea";
import { createVehicle } from "../../rtk/thunk/vehicleThunk";
import { AlertCircle, CheckCircle, Car } from "lucide-react";

const CreateVehicleForm = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.vehicle);

  const [formData, setFormData] = useState({
    name: "",
    make: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    color: "",
    location: "",
    condition: "",
    description: "",
    images: [],
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) {
      return;
    }

    // Check if user account is verified by admin
    if (!user?.accountVerified) {
      alert("Please complete account verification first. Submit your documents and wait for admin approval.");
      return;
    }

    const vehicleData = new FormData();

    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (key === 'images') {
        formData.images.forEach((image, index) => {
          vehicleData.append('images', image);
        });
      } else if (formData[key]) {
        vehicleData.append(key, formData[key]);
      }
    });

    dispatch(createVehicle(vehicleData));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  // If user account is not verified by admin, show verification required message
  if (!user?.accountVerified) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl text-yellow-700">Account Verification Required</CardTitle>
          <CardDescription className="text-lg text-gray-900">
            Admin verification is required before you can create and sell vehicles.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Upload your verification documents in your profile. Once approved by an admin, you'll be able to list vehicles for sale.
          </p>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700">
              <strong>Steps to verify:</strong>
            </p>
            <ol className="text-sm text-gray-700 mt-2 text-left space-y-1">
              <li>1. Go to your Profile</li>
              <li>2. Submit verification documents (Citizenship, ID, PAN Card, etc.)</li>
              <li>3. Wait for admin approval (usually within 24 hours)</li>
              <li>4. Start selling your vehicles</li>
            </ol>
          </div>
          <Button
            onClick={() => window.location.href = '/profile'}
            className="bg-blue text-white hover:bg-blue-600 w-full"
          >
            Go to Profile & Verify Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">Create New Vehicle Listing</CardTitle>
            <CardDescription>
              Fill in the details below to create your vehicle listing
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

              <div>
                <Label htmlFor="name">Vehicle Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Toyota Camry 2020"
                  required
                />
              </div>

              <div>
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  placeholder="e.g., Toyota"
                  required
                />
              </div>

              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., Camry"
                  required
                />
              </div>

              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  placeholder="e.g., 2020"
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="e.g., 25000"
                  required
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>

              <div>
                <Label htmlFor="mileage">Mileage</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange('mileage', e.target.value)}
                  placeholder="e.g., 50000"
                />
              </div>

              <div>
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select value={formData.fuelType} onValueChange={(value) => handleInputChange('fuelType', value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transmission">Transmission</Label>
                <Select value={formData.transmission} onValueChange={(value) => handleInputChange('transmission', value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="e.g., White"
                />
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location and Description */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., New York, NY"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your vehicle..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="images">Vehicle Images</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload up to 10 images. First image will be the main photo.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue text-white hover:bg-blue-600"
            >
              {loading ? "Creating..." : "Create Vehicle Listing"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateVehicleForm;