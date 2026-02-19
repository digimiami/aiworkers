'use client';

import { useState } from 'react';
import { Calendar, Clock, CheckCircle, Loader } from 'lucide-react';

export default function BookAppointment() {
  const [step, setStep] = useState<'calendar' | 'form' | 'confirmation'>('calendar');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    preferredService: 'Pro',
  });

  const [confirmationData, setConfirmationData] = useState<any>(null);

  // Generate available dates (next 30 days, excluding weekends)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Exclude Sunday and Saturday
        dates.push(date);
      }
    }
    return dates;
  };

  // Generate time slots (9am-5pm)
  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM',
    '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
  ];

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBooking = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.businessName) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          selectedDate,
          selectedTime,
        }),
      });

      if (!response.ok) throw new Error('Booking failed');
      const data = await response.json();
      setConfirmationData(data.booking);
      setStep('confirmation');

      // Store booking in localStorage
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      bookings.push(data.booking);
      localStorage.setItem('bookings', JSON.stringify(bookings));
    } catch (err) {
      setError('Failed to complete booking. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const availableDates = getAvailableDates();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Book a Call
            </h1>
            <p className="text-gray-400 text-lg">
              Schedule a consultation with our AI Workers team
            </p>
          </div>

          {/* Confirmation Step */}
          {step === 'confirmation' && confirmationData && (
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg p-8 backdrop-blur-sm text-center">
              <CheckCircle size={64} className="mx-auto mb-4 text-green-400" />
              <h2 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h2>
              <p className="text-gray-300 mb-6">
                Thank you for scheduling a call with AI Workers
              </p>

              <div className="bg-white/5 border border-green-500/30 rounded-lg p-6 mb-6 text-left">
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white font-semibold">{confirmationData.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-semibold">{confirmationData.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Business</p>
                    <p className="text-white font-semibold">{confirmationData.businessName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-gray-400 text-sm">Date</p>
                      <p className="text-white font-semibold">{confirmationData.selectedDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Time</p>
                      <p className="text-white font-semibold">{confirmationData.selectedTime}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Service</p>
                    <p className="text-white font-semibold">{confirmationData.preferredService}</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 mb-6">
                A confirmation email has been sent to <span className="text-white font-semibold">{confirmationData.email}</span>
              </p>

              <button
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
              >
                Back to Home
              </button>
            </div>
          )}

          {/* Calendar Step */}
          {step === 'calendar' && (
            <div className="bg-white/5 border border-purple-500/20 rounded-lg p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar size={24} />
                Select Date & Time
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Date Selection */}
                <div>
                  <p className="text-gray-300 font-semibold mb-4">Choose a Date</p>
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {availableDates.map((date) => (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedDate === date.toISOString().split('T')[0]
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-white/5 border-purple-500/20 text-gray-300 hover:border-purple-500'
                        }`}
                      >
                        <p className="text-sm font-semibold">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <p className="text-gray-300 font-semibold mb-4">Choose a Time</p>
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedTime === time
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-white/5 border-purple-500/20 text-gray-300 hover:border-purple-500'
                        }`}
                      >
                        <Clock size={16} className="inline mr-2" />
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('form')}
                disabled={!selectedDate || !selectedTime}
                className="w-full mt-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
              >
                Continue to Details
              </button>
            </div>
          )}

          {/* Form Step */}
          {step === 'form' && (
            <div className="bg-white/5 border border-purple-500/20 rounded-lg p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6">Your Information</h2>

              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Preferred Service
                  </label>
                  <select
                    name="preferredService"
                    value={formData.preferredService}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Basic">Basic - $497/mo</option>
                    <option value="Pro">Pro - $997/mo</option>
                    <option value="Enterprise">Enterprise - $1997/mo</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded p-3 text-red-300 text-sm mb-6">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setStep('calendar')}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition-all border border-purple-500/20"
                >
                  Back
                </button>
                <button
                  onClick={handleBooking}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
