import { Link } from 'react-router';

export default function AboutPage() {
  const values = [
    {
      title: 'Quality',
      description: 'We source only the finest fabrics from trusted suppliers worldwide.',
      icon: '✦',
    },
    {
      title: 'Innovation',
      description: 'We constantly explore new designs, prints, and fabric collections to inspire creativity.',
      icon: '◈',
    },
    {
      title: 'Sustainability',
      description: "We're committed to eco-friendly practices and ethical production methods.",
      icon: '❋',
    },
  ];

  const reasons = [
    'Premium quality fabrics from world-renowned fabric manufacturers',
    'Curated collections for every project, season, and style',
    'Fast and reliable shipping worldwide',
    'Expert customer support and fabric guidance',
    'Competitive pricing without compromising quality',
    '30-day satisfaction guarantee on all purchases',
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
              About P&C Texfab
            </h1>
            <p className="text-base md:text-lg text-[#a0a4b0] leading-relaxed max-w-xl">
              Discover our story and commitment to quality fabrics.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 xl:px-20 py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto space-y-12 md:space-y-16 lg:space-y-20">
          {/* Our Story */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,87,194,0.1)' }}
              >
                <span className="text-[#0057c2] font-bold text-sm">01</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#191c1e]">Our Story</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 lg:p-10">
              <p className="text-[#45464c] leading-relaxed mb-4">
                P&C Texfab was founded with a passion for bringing premium quality fabrics to creative minds
                around the world. We believe that the right fabric can transform any vision into reality.
              </p>
              <p className="text-[#45464c] leading-relaxed">
                What started as a small initiative has grown into a trusted fabric supplier where designers,
                crafters, fashion enthusiasts, and home dГ©cor professionals find inspiration and quality
                materials for their projects.
              </p>
            </div>
          </section>

          {/* Mission */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,87,194,0.1)' }}
              >
                <span className="text-[#0057c2] font-bold text-sm">02</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#191c1e]">Our Mission</h2>
            </div>
            <div
              className="rounded-2xl p-6 md:p-8 lg:p-10"
              style={{ backgroundColor: 'rgba(0,87,194,0.04)', border: '1px solid rgba(0,87,194,0.1)' }}
            >
              <p className="text-[#45464c] leading-relaxed">
                To provide the finest quality fabrics, exceptional customer service, and inspiration that
                empowers our customers to create beautiful projects that matter. We're committed to
                sustainability, ethical sourcing, and supporting the creative community.
              </p>
            </div>
          </section>

          {/* Values */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,87,194,0.1)' }}
              >
                <span className="text-[#0057c2] font-bold text-sm">03</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#191c1e]">Our Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {values.map((value, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[#0057c2] text-xl">{value.icon}</span>
                    <h3 className="text-lg font-bold text-[#191c1e]">{value.title}</h3>
                  </div>
                  <p className="text-[#45464c] text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Why Choose Us */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,87,194,0.1)' }}
              >
                <span className="text-[#0057c2] font-bold text-sm">04</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#191c1e]">Why Choose Us?</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 lg:p-10">
              <ul className="space-y-4">
                {reasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: 'rgba(0,87,194,0.1)' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="#0057c2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-[#45464c] text-sm leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div
              className="rounded-2xl p-8 md:p-12"
              style={{ background: 'linear-gradient(135deg, #141b2b 0%, #1a2744 100%)' }}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Ready to explore our collection?
              </h3>
              <p className="text-[#a0a4b0] mb-6 max-w-md mx-auto">
                Browse our curated range of premium fabrics and find the perfect material for your next project.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm transition-all hover:bg-[#0047a0]"
                style={{ backgroundColor: '#0057c2' }}
              >
                Shop Now
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
