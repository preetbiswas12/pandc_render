import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { NoiseButton } from '@/components/ui/noise-button';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'pandctexfab@gmail.com',
      subtext: "We'll respond within 24 hours",
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+91 9804915374',
      subtext: 'Mon-Sun, 8 AM - 9 PM IST',
    },
    {
      icon: MapPin,
      title: 'Address',
      value: 'Delhi, India',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #141b2b 0%, #1a2744 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,87,194,0.5) 0%, rgba(0,87,194,0) 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 xl:px-20 py-16 md:py-20 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Get in Touch
            </h1>
            <p className="text-base md:text-lg text-[#a0a4b0] leading-relaxed max-w-xl">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 xl:px-20 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#191c1e] mb-8">Contact Information</h2>

            <div className="space-y-6">
              {contactInfo.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 transition-all hover:shadow-md"
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,87,194,0.1)' }}
                  >
                    <item.icon size={22} style={{ color: '#0057c2' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#76777d] uppercase tracking-wider mb-1">
                      {item.title}
                    </h3>
                    <p className="text-[#191c1e] font-semibold text-base">{item.value}</p>
                    {item.subtext && (
                      <p className="text-[#76777d] text-sm mt-0.5">{item.subtext}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 lg:p-10">
            <h2 className="text-2xl font-bold text-[#191c1e] mb-6">Send us a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#45464c] mb-1.5">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#191c1e] placeholder-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#0057c2] focus:border-[#0057c2] transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#45464c] mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#191c1e] placeholder-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#0057c2] focus:border-[#0057c2] transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#45464c] mb-1.5">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#191c1e] placeholder-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#0057c2] focus:border-[#0057c2] transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#45464c] mb-1.5">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#191c1e] placeholder-[#76777d] focus:outline-none focus:ring-2 focus:ring-[#0057c2] focus:border-[#0057c2] transition-all resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Your message..."
                />
              </div>

              <NoiseButton
                type="submit"
                containerClassName="w-full"
              >
                <div className="flex items-center justify-center gap-2">
                  <Send size={18} />
                  Send Message
                </div>
              </NoiseButton>

              {submitted && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L7 12L13 4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Thank you! We'll get back to you soon.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
