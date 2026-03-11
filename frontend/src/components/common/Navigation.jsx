import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../../ui/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/ui/dropdown-menu";
import { Car, LogOut, User, ChevronDown, Menu, X, MessageCircle, Calendar } from "lucide-react";
import { userLogout } from "../../rtk/thunk/authThunk";
import { getConversations } from "../../rtk/thunk/chatThunk";
import { Badge } from "../../ui/ui/badge";

const Navigation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { authenticate, user } = useSelector((state) => state.auth);
  const { conversations = [] } = useSelector((state) => state.chat);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Count users with unread messages
  const usersWithUnreadMessages = conversations.filter((conv) => conv?.unreadCount > 0).length;

  // Fetch conversations to get unread count when user is authenticated
  useEffect(() => {
    if (authenticate) {
      dispatch(getConversations());
    }
  }, [authenticate, dispatch]);

  const handleLogout = () => {
    dispatch(userLogout()).then(() => {
      navigate("/login");
    });
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer flex-shrink-0"
            onClick={() => {
              navigate("/");
              setMobileMenuOpen(false);
            }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AutoGear
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => navigate("/")}
              className="text-gray-700 hover:text-purple-600 font-semibold transition-colors relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button
              onClick={() => navigate("/about")}
              className="text-gray-700 hover:text-purple-600 font-semibold transition-colors relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button
              onClick={() => navigate("/vehicles/browse?type=buy")}
              className="text-gray-700 hover:text-purple-600 font-semibold transition-colors relative group"
            >
              Buy Vehicle
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
            </button>
             <button
              onClick={() => navigate("/vehicles/browse?type=rent")}
              className="text-gray-700 hover:text-purple-600 font-semibold transition-colors relative group"
            >
              Rent Vehicle
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="text-gray-700 hover:text-purple-600 font-semibold transition-colors relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            {!authenticate ? (
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-300"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Messages Icon with Badge */}
                <button
                  onClick={() => navigate("/messages")}
                  className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors"
                  title="Messages"
                >
                  <MessageCircle className="w-6 h-6" />
                  {usersWithUnreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold">
                      {usersWithUnreadMessages > 9 ? '9+' : usersWithUnreadMessages}
                    </span>
                  )}
                </button>
                
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white z-[100] mt-2 border border-gray-200 shadow-xl rounded-lg">
                  <div className="px-3 py-2 text-sm text-gray-600 border-b border-gray-200 bg-gray-50">
                    <p className="font-medium truncate">{user?.email || "user@example.com"}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate("/profile")} 
                    className="cursor-pointer hover:bg-purple-50 hover:text-purple-600 transition-colors focus:bg-purple-50 focus:text-purple-600"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/vehicles")} 
                    className="cursor-pointer hover:bg-purple-50 hover:text-purple-600 transition-colors focus:bg-purple-50 focus:text-purple-600"
                  >
                    <Car className="w-4 h-4 mr-2" />
                    My Vehicles
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/bookings")} 
                    className="cursor-pointer hover:bg-purple-50 hover:text-purple-600 transition-colors focus:bg-purple-50 focus:text-purple-600"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/messages")} 
                    className="cursor-pointer hover:bg-purple-50 hover:text-purple-600 transition-colors focus:bg-purple-50 focus:text-purple-600"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                    {usersWithUnreadMessages > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {usersWithUnreadMessages > 9 ? '9+' : usersWithUnreadMessages}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors focus:bg-red-50 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <button
              onClick={() => {
                navigate("/");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg font-medium transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => {
                navigate("/about");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg font-medium transition-colors"
            >
              About
            </button>
            <button
              onClick={() => {
                navigate("/vehicles/browse?type=buy");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg font-medium transition-colors"
            >
              Buy Vehicle
            </button>
            <button
              onClick={() => {
                navigate("/vehicles/browse?type=rent");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg font-medium transition-colors"
            >
              Rent Vehicle
            </button>
            <button
              onClick={() => {
                navigate("/contact");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg font-medium transition-colors"
            >
              Contact
            </button>
            
            {!authenticate ? (
              <div className="space-y-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold py-3 rounded-lg transition-all"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    navigate("/signup");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all"
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-gray-200 mt-2">
                <div className="px-4 py-2 text-sm text-gray-600 truncate">
                  {user?.email}
                </div>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg font-medium transition-colors"
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate("/vehicles");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg font-medium transition-colors"
                >
                  <Car className="w-4 h-4 mr-3" />
                  My Vehicles
                </button>
                <button
                  onClick={() => {
                    navigate("/bookings");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg font-medium transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  My Bookings
                </button>
                <button
                  onClick={() => {
                    navigate("/messages");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg font-medium transition-colors"
                >
                  <span className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-3" />
                    Messages
                  </span>
                  {totalUnreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </Badge>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
