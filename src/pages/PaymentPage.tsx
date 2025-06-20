import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, Lock, Smartphone, Wallet } from 'lucide-react';
import Button from '../components/ui/Button';
import { useBookingStore } from '../store/bookingStore';
import { supabase } from '../lib/supabase';

type PaymentMethod = 'credit' | 'debit' | 'upi';

const PaymentPage: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
  });
  const [consentChecked, setConsentChecked] = useState(false);
  const [ownerName, setOwnerName] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);

  // Fetch booking details
  const { currentBooking, fetchBookingById } = useBookingStore();

  useEffect(() => {
    if (bookingId) {
      fetchBookingById(bookingId);
    }
  }, [bookingId, fetchBookingById]);

  // Fetch owner and customer full names when booking/vehicle is loaded
  useEffect(() => {
    const fetchProfiles = async () => {
      // Fetch owner name
      if (currentBooking?.vehicle?.ownerId) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, first_name, last_name')
          .eq('id', currentBooking.vehicle.ownerId)
          .single();
        if (data) {
          setOwnerName(
            data.full_name ||
              [data.first_name, data.last_name].filter(Boolean).join(' ') ||
              ''
          );
        } else {
          setOwnerName('');
        }
      } else {
        setOwnerName('');
      }
      // Fetch customer name
      if (currentBooking?.userId) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, first_name, last_name')
          .eq('id', currentBooking.userId)
          .single();
        if (data) {
          setCustomerName(
            data.full_name ||
              [data.first_name, data.last_name].filter(Boolean).join(' ') ||
              ''
          );
        } else {
          setCustomerName('');
        }
      } else {
        setCustomerName('');
      }
    };
    fetchProfiles();
  }, [currentBooking?.vehicle?.ownerId, currentBooking?.userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle license file upload
  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLicenseFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicensePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLicensePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement payment processing
    navigate(`/booking/confirmation/${bookingId}`);
  };

  const renderCardForm = () => (
    <>
      {/* Card Number */}
      <div>
        <label
          htmlFor="cardNumber"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Card Number
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CreditCard className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>
      </div>

      {/* Card Holder Name */}
      <div>
        <label
          htmlFor="cardName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Card Holder Name
        </label>
        <input
          type="text"
          id="cardName"
          name="cardName"
          value={formData.cardName}
          onChange={handleInputChange}
          placeholder="John Doe"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Expiry Date */}
        <div>
          <label
            htmlFor="expiryDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Expiry Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              placeholder="MM/YY"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
        </div>

        {/* CVV */}
        <div>
          <label
            htmlFor="cvv"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            CVV
          </label>
          <input
            type="text"
            id="cvv"
            name="cvv"
            value={formData.cvv}
            onChange={handleInputChange}
            placeholder="123"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>
      </div>
    </>
  );

  const renderUPIForm = () => (
    <div>
      <label
        htmlFor="upiId"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        UPI ID
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Smartphone className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          id="upiId"
          name="upiId"
          value={formData.upiId}
          onChange={handleInputChange}
          placeholder="username@upi"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          required
        />
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Enter your UPI ID (e.g., username@upi)
      </p>
    </div>
  );

  // Consent form legal text
  const legalText = (
    <>
      <p className="text-sm text-gray-700 mb-2">
        <strong>Consent & Legal Notice:</strong>
      </p>
      <ul className="text-xs text-gray-600 mb-2 list-disc pl-5">
        <li>
          If the vehicle is not returned on time, the customer will be liable
          for additional charges and legal action as per the terms and
          conditions.
        </li>
        <li>
          The vehicle owner reserves the right to initiate legal proceedings,
          including but not limited to police complaints and civil recovery, if
          the vehicle is not returned within the agreed period.
        </li>
        <li>
          By proceeding, you acknowledge and accept all legal consequences of
          failing to return the vehicle on time.
        </li>
      </ul>
      <p className="text-xs text-gray-600 mb-2">
        <strong>Vehicle Owner:</strong> {ownerName || 'N/A'}
        <br />
        <strong>Customer:</strong> {customerName || 'N/A'}
      </p>
      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Upload Driver's License (required):
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleLicenseChange}
          className="block text-xs"
        />
        {licensePreview && (
          <div className="mt-2">
            <img
              src={licensePreview}
              alt="License Preview"
              className="h-24 border rounded shadow"
            />
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
          <div className="flex items-center text-gray-500">
            <Lock size={16} className="mr-2" />
            <span className="text-sm">Secure Payment</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Payment Method
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('credit')}
              className={`flex items-center justify-center p-4 rounded-lg border-2 ${
                paymentMethod === 'credit'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200'
              }`}
            >
              <CreditCard className="h-6 w-6 mr-2 text-orange-600" />
              <span className="font-medium">Credit Card</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('debit')}
              className={`flex items-center justify-center p-4 rounded-lg border-2 ${
                paymentMethod === 'debit'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200'
              }`}
            >
              <Wallet className="h-6 w-6 mr-2 text-orange-600" />
              <span className="font-medium">Debit Card</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`flex items-center justify-center p-4 rounded-lg border-2 ${
                paymentMethod === 'upi'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200'
              }`}
            >
              <Smartphone className="h-6 w-6 mr-2 text-orange-600" />
              <span className="font-medium">UPI</span>
            </button>
          </div>
        </div>

        {/* Consent Form */}
        <div className="mb-6 border border-yellow-300 bg-yellow-50 rounded p-4">
          {legalText}
          <label className="flex items-center mt-2">
            <input
              type="checkbox"
              className="mr-2"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
            />
            <span className="text-xs text-gray-700">
              I have read and accept the above consent and legal terms.
            </span>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {paymentMethod === 'upi' ? renderUPIForm() : renderCardForm()}

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-orange-600 text-white hover:bg-orange-700"
              disabled={!consentChecked || !licenseFile}
            >
              Pay Now
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your payment information is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
