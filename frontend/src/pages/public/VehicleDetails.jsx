import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicVehicleById } from "../../rtk/thunk/vehicleThunk";
import { getVehicleReviews } from "../../rtk/slice/reviewSlice";
import { Button } from "../../ui/ui/button";
import { MessageSquare, Calendar, Gauge, Fuel, MoveVertical, MapPin, ArrowLeft, User, MessageCircle, Star } from "lucide-react";
import CommentSection from "../../components/common/CommentSection";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";
import BookingFilter from "../../components/userComp/BookingFilter";
import ChatDialog from "../../components/common/ChatDialog";
import VehicleReviews from "../../components/userComp/VehicleReviews";
import { getUserProfile } from "../../rtk/thunk/authThunk";
import { ErrorToast } from "../../components/common/toast";

const VehicleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentVehicle, loading } = useSelector((state) => state.vehicle);
    const { user, authenticate } = useSelector((state) => state.auth);
    const [selectedImage, setSelectedImage] = React.useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatUser, setChatUser] = useState(null);

    useEffect(() => {
        if (id) {
            dispatch(getPublicVehicleById(id));
        }
    }, [dispatch, id]);

    // Ensure user profile is loaded when authenticated (prevents redirect loops on button click)
    useEffect(() => {
        if (authenticate && !user) {
            dispatch(getUserProfile());
        }
    }, [authenticate, user, dispatch]);

    if (loading || !currentVehicle) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
                <Footer />
            </div>
        );
    }

    const { 
        name, make, model, year, price, mileage, 
        fuelType, transmission, color, location, 
        description, images, uploader, category
    } = currentVehicle;

    const isRentalVehicle = category === "Renting";

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navigation />
            
            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Breadcrumb / Back */}
                <Button 
                    variant="ghost" 
                    className="mb-6 pl-0 hover:bg-transparent hover:underline text-gray-600"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to listings
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Images & Key Specs */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="aspect-video bg-gray-100 relative items-center justify-center flex">
                                {images && images.length > 0 ? (
                                    <img 
                                        src={images[selectedImage]} 
                                        alt={name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-400">No images available</span>
                                )}
                            </div>
                            {/* Thumbnails */}
                            {images && images.length > 1 && (
                                <div className="p-4 flex gap-2 overflow-x-auto">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                                                selectedImage === idx ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {description || "No description provided by seller."}
                            </p>
                        </div>

                        {/* Comments Section */}
                        <div id="comments">
                            <CommentSection 
                                vehicleId={currentVehicle.id} 
                                isOwner={user?.id === uploader?.id} 
                            />
                        </div>

                        {/* Reviews Section - Only for rental vehicles */}
                        {isRentalVehicle && (
                            <div id="reviews">
                                <VehicleReviews vehicleId={currentVehicle.id} />
                            </div>
                        )}
                    </div>

                    {/* Right Column: Details & Contact */}
                    <div className="space-y-6">
                        {/* Main Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <div className="mb-2">
                                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">{make}</span>
                                <h1 className="text-3xl font-bold text-gray-900 mt-1">{name}</h1>
                                <p className="text-gray-500 text-sm mt-1">{year} • {transmission}</p>
                            </div>

                            <div className="my-6 pt-6 border-t border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Asking Price</p>
                                <p className="text-4xl font-extrabold text-blue-600 tracking-tight">
                                    Rs. {parseInt(price).toLocaleString('en-IN')}
                                </p>
                            </div>

                            {/* Seller Info */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-4 border border-gray-100">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                    {uploader?.name?.[0].toUpperCase() || <User />}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-bold text-gray-900 truncate">{uploader?.name || "Seller"}</p>
                                    <p className="text-xs text-gray-500 truncate">Member since {new Date(currentVehicle.createdAt).getFullYear()}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {user?.id !== uploader?.id ? (
                                    <>
                                        {/* Only show booking for rental vehicles */}
                                        {isRentalVehicle && (
                                            <BookingFilter 
                                                vehicleId={currentVehicle.id}
                                                vehiclePrice={price}
                                                vehicleLocation={location}
                                            />
                                        )}
                                        {!isRentalVehicle && (
                                            <Button 
                                                variant="info" 
                                                className="w-full h-12 text-base font-bold"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    
                                                    if (!authenticate) {
                                                        navigate("/login");
                                                        return;
                                                    }

                                                    if (!user) {
                                                        // Force-fetch profile if somehow missing while authenticated
                                                        dispatch(getUserProfile());
                                                        ErrorToast({ message: "Loading your profile, please try again." });
                                                        return;
                                                    }

                                                    if (!uploader?.id) {
                                                        console.error("Uploader information not available");
                                                        return;
                                                    }
                                                    
                                                    setChatUser({
                                                        id: uploader.id,
                                                        name: uploader.name || "Seller",
                                                        profileImage: uploader.profileImage,
                                                        isOnline: uploader.isOnline || false,
                                                        lastSeen: uploader.lastSeen || new Date(),
                                                    });
                                                    setIsChatOpen(true);
                                                }}
                                            >
                                                <MessageCircle className="w-5 h-5 mr-2" />
                                                Chat with Seller
                                            </Button>
                                        )}
                                        <Button 
                                            variant="outline" 
                                            className="w-full h-12 text-base font-bold hover:bg-purple/10 hover:text-purple"
                                            onClick={() => document.getElementById('comments').scrollIntoView({ behavior: 'smooth' })}
                                        >
                                            <MessageSquare className="w-5 h-5 mr-2" />
                                            View Comments
                                        </Button>
                                    </>
                                ) : (
                                    <div className="text-center p-3 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium">
                                        You are viewing your own listing
                                    </div>
                                )}
                            </div>

                            {/* Specs Grid */}
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase font-bold">
                                        <Gauge className="w-3.5 h-3.5" /> Mileage
                                    </div>
                                    <p className="font-semibold text-gray-900">{mileage || "-"} km</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase font-bold">
                                        <Fuel className="w-3.5 h-3.5" /> Fuel
                                    </div>
                                    <p className="font-semibold text-gray-900 capitalize">{fuelType || "-"}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase font-bold">
                                        <MoveVertical className="w-3.5 h-3.5" /> Trans.
                                    </div>
                                    <p className="font-semibold text-gray-900 capitalize">{transmission || "-"}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase font-bold">
                                        <Calendar className="w-3.5 h-3.5" /> Year
                                    </div>
                                    <p className="font-semibold text-gray-900">{year || "-"}</p>
                                </div>
                                <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase font-bold">
                                        <MapPin className="w-3.5 h-3.5" /> Location
                                    </div>
                                    <p className="font-semibold text-gray-900">{location || "-"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Chat Dialog */}
            {chatUser && (
                <ChatDialog
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    otherUser={chatUser}
                />
            )}

            <Footer />
        </div>
    );
};

export default VehicleDetails;
