import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#141b2b] text-white overflow-x-hidden">
      <div className="w-full px-4 md:px-8 lg:px-[60px] py-12 md:py-16">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-16">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold tracking-wide mb-6">P&C Texfab</h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
              Premium quality fabrics designed for creative minds. Sustainable sourcing with exceptional craftsmanship.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm md:text-base">Delhi, India</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm md:text-base">+91 9804915374</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm md:text-base">pandctexfab@gmail.com</span>
              </div>
            </div>
          </div>

          {/* padding */}
          <div>
            <h4 className="text-base font-bold tracking-wider mb-6 uppercase"></h4>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-base font-bold tracking-wider mb-6 uppercase">Support</h4>
            <ul className="space-y-3">
              <li><a href="/faq" className="text-gray-300 text-sm md:text-base hover:text-white transition-colors">FAQ</a></li>
              <li><a href="/shipping" className="text-gray-300 text-sm md:text-base hover:text-white transition-colors">Shipping Info</a></li>
              <li><a href="/returns" className="text-gray-300 text-sm md:text-base hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="/contact" className="text-gray-300 text-sm md:text-base hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-base font-bold tracking-wider mb-6 uppercase">Legal</h4>
            <ul className="space-y-3">
              <li><a href="/terms" className="text-gray-300 text-sm md:text-base hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/privacy" className="text-gray-300 text-sm md:text-base hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/cookies" className="text-gray-300 text-sm md:text-base hover:text-white transition-colors">Cookie Settings</a></li>
              <li><a href="/sitemap" className="text-gray-300 text-sm md:text-base hover:text-white transition-colors">Sitemap</a></li>
              <li><a href="/about" className="text-gray-300 text-sm md:text-base hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex gap-3 sm:gap-6 mb-12">
          <a href="#facebook" className="p-2 sm:p-3 rounded-lg bg-white/10 hover:bg-[#0057c2] transition-colors">
            <Facebook size={18} className="sm:hidden" />
            <Facebook size={24} className="hidden sm:block" />
          </a>
          <a href="#instagram" className="p-2 sm:p-3 rounded-lg bg-white/10 hover:bg-[#0057c2] transition-colors">
            <Instagram size={18} className="sm:hidden" />
            <Instagram size={24} className="hidden sm:block" />
          </a>
          <a href="#twitter" className="p-2 sm:p-3 rounded-lg bg-white/10 hover:bg-[#0057c2] transition-colors">
            <Twitter size={18} className="sm:hidden" />
            <Twitter size={24} className="hidden sm:block" />
          </a>
          <a href="#youtube" className="p-2 sm:p-3 rounded-lg bg-white/10 hover:bg-[#0057c2] transition-colors">
            <Youtube size={18} className="sm:hidden" />
            <Youtube size={24} className="hidden sm:block" />
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-[#0057c2]">
        <div className="w-full px-4 md:px-8 lg:px-[60px] py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white text-sm md:text-base">
            © 2024 P&c Texfab. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#security" className="text-white text-sm md:text-base hover:text-white transition-colors">
              Security
            </a>
            <a href="#accessibility" className="text-white text-sm md:text-base hover:text-white transition-colors">
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}