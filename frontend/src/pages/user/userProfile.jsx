import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/ui/card";
import { Input } from "../../ui/ui/input";
import { Label } from "../../ui/ui/label";
import { Badge } from "../../ui/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/ui/dialog";
import { ErrorToast } from "../../components/common/toast";
import PhoneInput from "../../components/common/PhoneInput";
import {
  User,
  Mail,
  Phone,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { getUserProfile, updateUserProfile, verifyOtp } from "../../rtk/thunk/authThunk";
import DocumentUploadComponent from "../../components/userComp/DocumentUploadComponent";
import { formatPhoneNumber, getPhoneValidationState } from "../../lib/phone";
import { isUserVerified } from "../../lib/verification";

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: ""
  });

  const phoneValidation = getPhoneValidationState(formData.phoneNumber);

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      console.log("📋 User profile data:", { 
        id: user.id, 
        name: user.name, 
        accountVerified: user.accountVerified,
        verificationRejected: user.verificationRejected 
      });
      setFormData({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        email: user.email || ""
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!phoneValidation.isValid) {
      ErrorToast({ message: "Please enter a valid 10-digit Nepali mobile number" });
      return;
    }

    try {
      // Check if email changed
      const emailHasChanged = formData.email.toLowerCase().trim() !== user?.email?.toLowerCase().trim();
      
      await dispatch(updateUserProfile(formData)).unwrap();
      
      // If email changed, show verification modal
      if (emailHasChanged) {
        setEmailChanged(true);
        setShowEmailVerification(true);
      } else {
        // If no email change, just close edit mode
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationOtp.trim()) {
      alert("Please enter the OTP");
      return;
    }
    
    try {
      setIsVerifying(true);
      // Dispatch verify OTP thunk
      await dispatch(verifyOtp({ email: formData.email, otp: verificationOtp })).unwrap();
      setShowEmailVerification(false);
      setVerificationOtp("");
      setIsEditing(false);
      setEmailChanged(false);
      // Refresh user data
      await dispatch(getUserProfile());
    } catch (error) {
      console.error("Verification failed:", error);
      alert("Verification failed. Please check your OTP and try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
      email: user?.email || ""
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-bg to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/home')}
                className="flex items-center space-x-1 sm:space-x-2 text-purple hover:text-purple hover:bg-purple hover:bg-opacity-10 transition-all px-2 sm:px-3"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm sm:text-base">Back</span>
              </Button>
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple to-blue bg-clip-text text-transparent">My Profile</h1>
            <div className="w-16 sm:w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="text-center bg-gradient-to-br from-purple from-0% via-purple via-50% to-blue to-100% text-white rounded-t-lg pt-6 sm:pt-8">
                <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-white bg-opacity-20 rounded-full w-fit">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-white">{user?.name || "User"}</CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-100 mt-2 px-2">{user?.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="flex items-center justify-center">
                  {isUserVerified(user) ? (
                    <Badge className="bg-green bg-opacity-20 text-green border border-green border-opacity-30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Verified Account
                    </Badge>
                  ) : (
                    <Badge className="bg-red bg-opacity-20 text-red border border-red border-opacity-30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Unverified Account
                    </Badge>
                  )}
                </div>

                {!isUserVerified(user) && (
                  <div className="p-4 bg-blue bg-opacity-5 border border-blue border-opacity-30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-4 h-4 text-blue mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-blue">Verification Required</p>
                        <p className="text-gray-600 mt-1">
                          Verify your account to unlock all features.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm space-y-3">
                    <div className="flex justify-between items-center p-3 bg-light-bg rounded-lg">
                      <span className="text-gray-600 font-medium">Member since:</span>
                      <span className="text-gray-800 font-semibold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-light-bg rounded-lg">
                      <span className="text-gray-600 font-medium">Account type:</span>
                      <span className="text-gray-800 font-semibold capitalize">{user?.role || 'User'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details Card */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
              <CardHeader className="border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl text-gray-900">Profile Information</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">Update your personal details</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button 
                      onClick={() => setIsEditing(true)} 
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple to-blue hover:from-purple hover:to-blue text-white shadow-md hover:shadow-lg transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSave} 
                        disabled={!phoneValidation.isValid}
                        className="flex items-center space-x-2 bg-gradient-to-r from-green to-green hover:from-green hover:to-green text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancel} 
                        className="flex items-center space-x-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="flex items-center space-x-2 font-semibold text-gray-900">
                      <User className="w-4 h-4 text-purple" />
                      <span>Full Name</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                        className="border-2 border-gray-300 focus:border-purple focus:ring-purple"
                      />
                    ) : (
                      <div className="p-3 bg-light-bg rounded-lg border border-gray-200">
                        <p className="text-gray-800 font-medium">{user?.name || "Not provided"}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="email" className="flex items-center space-x-2 font-semibold text-gray-900">
                      <Mail className="w-4 h-4 text-blue" />
                      <span>Email Address</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter your email"
                        className="border-2 border-gray-300 focus:border-blue focus:ring-blue"
                      />
                    ) : (
                      <div className="p-3 bg-light-bg rounded-lg border border-gray-200">
                        <p className="text-gray-800 font-medium">{user?.email || "Not provided"}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="phone" className="flex items-center space-x-2 font-semibold text-gray-900">
                      <Phone className="w-4 h-4 text-purple" />
                      <span>Phone Number</span>
                    </Label>
                    {isEditing ? (
                      <PhoneInput
                        id="phone"
                        label=""
                        value={formData.phoneNumber}
                        onChange={(value) => handleInputChange("phoneNumber", value)}
                        placeholder="e.g., 9841234567"
                        required
                        showCountryCode
                        className="space-y-0"
                        inputClassName="border-2 border-gray-300 focus:border-purple focus:ring-purple"
                      />
                    ) : (
                      <div className="p-3 bg-light-bg rounded-lg border border-gray-200">
                        <p className="text-gray-800 font-medium">{formatPhoneNumber(user?.phoneNumber) || "Not provided"}</p>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="bg-blue bg-opacity-5 p-4 rounded-lg border border-blue border-opacity-20">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-blue">Important Note</p>
                          <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                            Changes to your email address may require re-verification.
                            Phone number updates will be reflected immediately.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Document Verification Section */}
        <div className="mt-8 md:mt-12">
          <DocumentUploadComponent />
        </div>
      </div>
      {/* Email Verification Modal */}
      <Dialog open={showEmailVerification} onOpenChange={setShowEmailVerification}>
        <DialogContent className="max-w-md p-0 border-0 shadow-2xl bg-white rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple to-blue text-white p-6">
            <DialogTitle className="text-white text-2xl font-bold">Verify Your Email</DialogTitle>
            <DialogDescription className="text-gray-100 mt-2">
              We sent a verification code to {formData.email}
            </DialogDescription>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-blue bg-opacity-5 p-4 rounded-lg border border-blue border-opacity-20">
              <p className="text-sm text-gray-700">
                An OTP has been sent to your new email address. Please enter it below to verify your email change.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="otp" className="font-semibold text-gray-900">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={verificationOtp}
                onChange={(e) => setVerificationOtp(e.target.value.toUpperCase())}
                maxLength="6"
                className="border-2 border-gray-300 focus:border-purple focus:ring-purple text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEmailVerification(false);
                  setVerificationOtp("");
                }}
                disabled={isVerifying}
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyEmail}
                disabled={isVerifying || !verificationOtp.trim()}
                className="flex-1 bg-gradient-to-r from-purple to-blue hover:from-purple hover:to-blue text-white shadow-md hover:shadow-lg transition-all"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>    </div>
  );
};

export default UserProfilePage;