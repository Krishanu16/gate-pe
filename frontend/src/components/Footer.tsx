import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12 px-6 border-t-4 border-gray-900 font-handwritten">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-heading text-3xl font-bold mb-4 text-notebook-medium">PE Course 2026</h3>
            <p className="text-gray-300">Complete Petroleum Engineering Notes Online</p>
          </div>
          <div>
            <h4 className="font-heading text-2xl font-bold mb-4 text-notebook-medium">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-notebook-medium transition-colors">Course Modules</a></li>
              <li><a href="#" className="hover:text-notebook-medium transition-colors">Sample Preview</a></li>
              <li><a href="#" className="hover:text-notebook-medium transition-colors">Testimonials</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-2xl font-bold mb-4 text-notebook-medium">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-notebook-medium transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-notebook-medium transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-notebook-medium transition-colors">Help Center</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-2xl font-bold mb-4 text-notebook-medium">Legal</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-notebook-medium transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-notebook-medium transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-notebook-medium transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-gray-700">
          <p className="text-gray-300">© 2026 Petroleum Engineering Course. All rights reserved. 🛢️</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;