'use client';

import { useState } from 'react';
import { Download, Settings } from 'lucide-react';

export default function ProposalPDF() {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'AI Workers',
    logoUrl: 'https://via.placeholder.com/200x50?text=AI+Workers',
    primaryColor: '#a855f7',
    prospectName: 'John Smith',
    prospectCompany: 'Tech Startup Inc',
    prospectEmail: 'john@example.com',
  });

  const [formData, setFormData] = useState(settings);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveSettings = () => {
    setSettings(formData);
    localStorage.setItem('proposalSettings', JSON.stringify(formData));
    setShowSettings(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const services = [
    { name: 'Basic Package', price: 497, features: ['Lead Generation', 'Email Outreach', 'Basic Analytics'] },
    { name: 'Pro Package', price: 997, features: ['All Basic Features', 'Advanced Analytics', 'Custom Landing Pages', 'A/B Testing'] },
    { name: 'Enterprise', price: 1997, features: ['All Pro Features', 'Dedicated Account Manager', 'Custom Integrations', 'Priority Support'] },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Controls */}
          <div className="flex gap-4 mb-8 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              <Download size={20} />
              Download PDF
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg transition-all border border-purple-500/20"
            >
              <Settings size={20} />
              Settings
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-white/5 border border-purple-500/20 rounded-lg p-8 backdrop-blur-sm mb-8 print:hidden">
              <h2 className="text-2xl font-bold text-white mb-6">Proposal Settings</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Logo URL</label>
                  <input
                    type="text"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Primary Color</label>
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Prospect Name</label>
                  <input
                    type="text"
                    name="prospectName"
                    value={formData.prospectName}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Prospect Company</label>
                  <input
                    type="text"
                    name="prospectCompany"
                    value={formData.prospectCompany}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Prospect Email</label>
                  <input
                    type="email"
                    name="prospectEmail"
                    value={formData.prospectEmail}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <button
                onClick={saveSettings}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
              >
                Save Settings
              </button>
            </div>
          )}

          {/* Proposal Document */}
          <div className="bg-white text-black print:bg-white print:text-black">
            {/* Cover Page */}
            <div className="page-break p-12 min-h-screen flex flex-col justify-between" style={{ pageBreakAfter: 'always' }}>
              <div>
                <div className="mb-12">
                  {settings.logoUrl && (
                    <img src={settings.logoUrl} alt="Company Logo" className="h-12 mb-4" />
                  )}
                  <h1 className="text-5xl font-bold mb-2">{settings.companyName}</h1>
                  <p className="text-gray-600">Professional AI-Powered Business Solutions</p>
                </div>

                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-4">Business Proposal</h2>
                  <p className="text-lg text-gray-700 mb-2">
                    Prepared for: <span className="font-bold">{settings.prospectName}</span>
                  </p>
                  <p className="text-lg text-gray-700">
                    Company: <span className="font-bold">{settings.prospectCompany}</span>
                  </p>
                </div>
              </div>

              <div className="border-t pt-8">
                <p className="text-gray-600 mb-2">
                  Date: {new Date().toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  Email: {settings.prospectEmail}
                </p>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="page-break p-12" style={{ pageBreakAfter: 'always' }}>
              <h2 className="text-3xl font-bold mb-6" style={{ color: settings.primaryColor }}>
                Executive Summary
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  {settings.prospectCompany} is positioned for significant growth in the digital marketplace. This proposal outlines how AI Workers can accelerate your business through intelligent automation, data-driven marketing, and lead generation strategies.
                </p>
                <p>
                  Our proven methodology has helped businesses like yours increase revenue by 25-40% within the first 12 months through optimized customer acquisition and retention strategies.
                </p>
                <h3 className="text-xl font-bold mt-6 mb-3">Current Situation Analysis</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Limited digital presence and lead generation channels</li>
                  <li>Manual processes consuming valuable resources</li>
                  <li>Untapped potential in customer data and insights</li>
                  <li>Opportunity for revenue growth through AI-powered solutions</li>
                </ul>
              </div>
            </div>

            {/* Services & Pricing */}
            <div className="page-break p-12" style={{ pageBreakAfter: 'always' }}>
              <h2 className="text-3xl font-bold mb-6" style={{ color: settings.primaryColor }}>
                Recommended Services
              </h2>

              <div className="space-y-6">
                {services.map((service, idx) => (
                  <div key={idx} className="border-2" style={{ borderColor: settings.primaryColor }}>
                    <div className="p-6" style={{ backgroundColor: settings.primaryColor + '10' }}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold">{service.name}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold">${service.price}</p>
                          <p className="text-gray-600 text-sm">per month</p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {service.features.map((feature, fidx) => (
                          <li key={fidx} className="flex items-center">
                            <span className="mr-3" style={{ color: settings.primaryColor }}>✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gray-100 rounded">
                <p className="text-gray-700">
                  <span className="font-bold">Recommendation:</span> We recommend the Pro Package for {settings.prospectCompany} to maximize ROI while maintaining cost efficiency.
                </p>
              </div>
            </div>

            {/* ROI Projections */}
            <div className="page-break p-12" style={{ pageBreakAfter: 'always' }}>
              <h2 className="text-3xl font-bold mb-6" style={{ color: settings.primaryColor }}>
                ROI Projections
              </h2>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="border-2 p-6" style={{ borderColor: settings.primaryColor }}>
                  <p className="text-gray-600 mb-2">Monthly Investment</p>
                  <p className="text-3xl font-bold">$997</p>
                </div>
                <div className="border-2 p-6" style={{ borderColor: settings.primaryColor }}>
                  <p className="text-gray-600 mb-2">Projected Monthly Return</p>
                  <p className="text-3xl font-bold" style={{ color: settings.primaryColor }}>$4,500+</p>
                </div>
              </div>

              <div className="space-y-4 text-gray-700">
                <h3 className="text-xl font-bold">12-Month Projection</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2" style={{ borderColor: settings.primaryColor }}>
                      <th className="text-left py-2 px-4">Month</th>
                      <th className="text-left py-2 px-4">Leads Generated</th>
                      <th className="text-left py-2 px-4">Revenue Increase</th>
                      <th className="text-left py-2 px-4">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 3, 6, 12].map((month) => (
                      <tr key={month} className="border-b">
                        <td className="py-2 px-4">Month {month}</td>
                        <td className="py-2 px-4">{50 * month}</td>
                        <td className="py-2 px-4">${4500 * month}</td>
                        <td className="py-2 px-4" style={{ color: settings.primaryColor }}>
                          {Math.round(((4500 * month - 997 * month) / (997 * month)) * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Call to Action */}
            <div className="page-break p-12 flex flex-col justify-center min-h-screen" style={{ backgroundColor: settings.primaryColor + '10' }}>
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
                <p className="text-xl text-gray-700 mb-8">
                  Let&rsquo;s schedule a consultation to discuss how AI Workers can help {settings.prospectCompany} achieve its growth goals.
                </p>
                <div className="space-y-4">
                  <p className="text-lg">
                    <span className="font-bold">Next Steps:</span>
                  </p>
                  <ol className="text-left inline-block space-y-2">
                    <li className="flex items-center">
                      <span className="mr-3 font-bold" style={{ color: settings.primaryColor }}>1.</span>
                      <span>Review this proposal</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3 font-bold" style={{ color: settings.primaryColor }}>2.</span>
                      <span>Schedule a 30-minute discovery call</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3 font-bold" style={{ color: settings.primaryColor }}>3.</span>
                      <span>Finalize agreement and begin implementation</span>
                    </li>
                  </ol>
                </div>
                <div className="mt-12 p-6 border-2" style={{ borderColor: settings.primaryColor }}>
                  <p className="text-gray-700 mb-2">Book Your Consultation:</p>
                  <p className="text-2xl font-bold" style={{ color: settings.primaryColor }}>
                    aiworkers.app/book
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body {
            background: white;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>
    </div>
  );
}
