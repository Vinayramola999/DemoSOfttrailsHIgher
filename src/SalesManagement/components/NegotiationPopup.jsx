import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import CenteredModal from './CenteredModal';

const baseUrl = process.env.REACT_APP_URL_sales || '';

const NegotiationPopup = ({ isOpen, onClose, quotationData, onSuccess }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && quotationData?.items) {
      // Initialize items with target price field
      const itemsWithTargetPrice = quotationData.items.map((item) => ({
        ...item,
        targetPrice: '',
      }));
      setItems(itemsWithTargetPrice);
    }
  }, [isOpen, quotationData]);

  if (!isOpen) return null;

  const handleTargetPriceChange = (index, value) => {
    // Allow only positive integers (no decimals, no negative values)
    if (value === '' || (value >= 0 && Number.isInteger(parseFloat(value)))) {
      const updatedItems = [...items];
      updatedItems[index].targetPrice = value;
      setItems(updatedItems);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate that all items have target prices
      const hasEmptyPrices = items.some((item) => item.targetPrice === '');
      if (hasEmptyPrices) {
        alert('Please enter target price for all items');
        setLoading(false);
        return;
      }

      // Get userId from sessionStorage
      const userId = sessionStorage.getItem('userId');
      const token = sessionStorage.getItem('token');

      // Prepare payload according to API specification
      const payload = {
        quotation: {
          quotation_id: quotationData?.quotation?.quotation_id,
          quotation_no: quotationData?.quotation?.quotation_no,
          rfp_id: quotationData?.quotation?.rfp_id,
          quotation_date: quotationData?.quotation?.quotation_date,
          validity_date: quotationData?.quotation?.validity_date,
          total_taxable: quotationData?.quotation?.total_taxable,
          total_amount: quotationData?.quotation?.total_amount,
          status: 'Revised',
          quotation_file_link: quotationData?.quotation?.quotation_file_link,
          uom: quotationData?.quotation?.uom || 'Nos',
        },
        items: items.map((item) => ({
          item_name: item.item_name,
          quantity: item.quantity,
          unit_rate: parseInt(item.targetPrice) || item.unit_rate,
          hsn_sac: item.hsn_sac || item.hsn || '',
          tax_percent: ((item.igst || 0) + (item.cgst || 0) + (item.sgst || 0)),
          amount: (parseInt(item.targetPrice) || item.unit_rate) * item.quantity,
          description: item.description || '',
          igst: item.igst || 0,
          cgst: item.cgst || 0,
          sgst: item.sgst || 0,
        })),
        revision_reason: 'Client negotiated pricing update',
        updated_by: parseInt(userId) || 0,
      };

      // Send to API
      const response = await axios.post(
        `${baseUrl}/salesmanagement/quotation/sales/targetprice`,
        payload,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.success) {
        setShowSuccess(true);
        if (typeof onSuccess === 'function') {
          try {
            onSuccess();
          } catch (e) {
            console.warn('onSuccess callback error:', e);
          }
        }
      } else {
        alert('Error: ' + (response.data?.message || 'Failed to submit negotiation'));
      }
    } catch (error) {
      console.error('Error submitting negotiation:', error);
      alert('Error submitting negotiation: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <style>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-start p-8 bg-white border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Negotiation</h2>
            <p className="text-sm text-gray-600 mt-2">
              RFP ID : {quotationData?.quotation?.rfp_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-4"
          >
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>

        {/* Modal Body - Negotiation Items Table */}
        <div className="flex-1 overflow-auto p-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="pb-4 pr-4 text-left font-semibold text-gray-800 text-sm">Sr.No.</th>
                <th className="pb-4 px-4 text-left font-semibold text-gray-800 text-sm">Item</th>
                <th className="pb-4 px-4 text-center font-semibold text-gray-800 text-sm">Quantity</th>
                <th className="pb-4 px-4 text-right font-semibold text-gray-800 text-sm">Unit Price</th>
                <th className="pb-4 px-4 text-right font-semibold text-gray-800 text-sm">Target Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-5 pr-4 text-gray-700 text-sm font-medium">{idx + 1}.</td>
                  <td className="py-5 px-4">
                    <div className="font-medium text-gray-800 text-sm">{item.item_name}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                  </td>
                  <td className="py-5 px-4 text-center text-gray-700 text-sm">{item.quantity}</td>
                  <td className="py-5 px-4 text-right text-gray-700 text-sm">
                    ₹{parseFloat(item.unit_rate || 0).toFixed(2)}
                  </td>
                  <td className="py-5 px-4 text-right">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter price"
                      value={item.targetPrice}
                      onChange={(e) => handleTargetPriceChange(idx, e.target.value)}
                      className="w-40 border border-gray-300 rounded px-3 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-700 text-sm font-medium">
               Note: Additional tax will be applied on the unit price
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-start gap-4 p-8 bg-white border-t border-gray-200">
          <button
            onClick={() => setShowConfirmation(true)}
            disabled={loading}
            className="px-12 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold text-sm shadow-md hover:shadow-lg"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button
            onClick={onClose}
            className="px-12 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-md hover:bg-gray-50 transition-colors font-semibold text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <CenteredModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        type="confirm"
        title="Negotiation?"
        message="Are you sure you want to Negotiate?"
        onConfirm={handleSubmit}
      />

      {/* Success Modal */}
      <CenteredModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
        type="success"
        title="Success"
        message="Negotiation submitted successfully!"
        onContinue={() => {
          setShowSuccess(false);
          onClose();
        }}
      />
    </div>
  );
};

export default NegotiationPopup;
