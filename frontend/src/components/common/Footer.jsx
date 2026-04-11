import React from "react";
import { Globe, Mail, Phone } from "lucide-react";
import BrandMark from "./BrandMark";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <BrandMark size={48} className="rounded-xl" />
              <div>
                <span className="text-3xl font-bold">Second Auto Gear</span>
                <div className="text-sm text-gray-400">Premium Automotive Marketplace</div>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed text-lg mb-6 max-w-md">
              Revolutionizing the automotive industry with enterprise-grade technology,
              unparalleled security, and exceptional customer service.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center hover:bg-purple-600/30 transition-colors cursor-pointer">
                <Globe className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center hover:bg-blue-600/30 transition-colors cursor-pointer">
                <Mail className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center hover:bg-green-600/30 transition-colors cursor-pointer">
                <Phone className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6">Platform</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Browse Vehicles
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Sell Your Car
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Vehicle Inspection
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Financing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Insurance
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors font-medium"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Press
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2024 Second Auto Gear. All rights reserved. Built with precision for automotive excellence.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
