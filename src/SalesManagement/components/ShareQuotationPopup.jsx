import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ShareQuotationPopup = ({ isOpen, onClose, quotationData, onShare }) => {
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [ccEmails, setCcEmails] = useState('');
  const [clientEmailError, setClientEmailError] = useState('');
  const [ccEmailsError, setCcEmailsError] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helpers: email validation
  const isValidEmail = (email) => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  };

  const splitAndValidate = (csv) => {
    return csv
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .filter((addr) => !isValidEmail(addr));
  };

  useEffect(() => {
    if (isOpen && quotationData) {
      console.log('Quotation Data:', quotationData); // Debug log
      // Pre-fill client email and name when available
      const email = quotationData?.quotation_for?.email || quotationData?.quotation_for_email || '';
      const name = quotationData?.quotation_for?.customer_name || quotationData?.quotation_for_name || '';
      setClientEmail(email);
      setClientName(name);
      // validate prefilled email
      if (email) {
        if (!isValidEmail(email)) setClientEmailError('Enter a valid email');
        else setClientEmailError('');
      }
    }
    if (!isOpen) {
      // reset local state when popup closes
      setClientEmail('');
      setClientName('');
      setCcEmails('');
      setClientEmailError('');
      setCcEmailsError('');
      setAttachmentFile(null);
    }
  }, [isOpen, quotationData]);

  // Defensive guard: only render when explicitly opened and when we have meaningful quotation data
  const hasQuotationData = Boolean(
    quotationData && (
      quotationData?.quotation?.quotation_file_link ||
      quotationData?.quotation_file_link ||
      quotationData?.quotation?.quotation_no ||
      quotationData?.quotation_no ||
      quotationData?.quotation_for?.email ||
      quotationData?.quotation_for_email
    )
  );

  if (!isOpen || !hasQuotationData) return null;

  const handleShare = async () => {
    // final validation before sending
    if (!clientEmail || !isValidEmail(clientEmail)) {
      setClientEmailError('Enter a valid email');
      return;
    }
    if (ccEmails) {
      const invalid = splitAndValidate(ccEmails);
      if (invalid.length > 0) {
        setCcEmailsError(`Invalid email(s): ${invalid.join(', ')}`);
        return;
      }
    }
    try {
      setLoading(true);

      // Create email list from primary and CC
      const emailList = [];
      if (clientEmail) emailList.push(clientEmail);
      if (ccEmails) {
        emailList.push(...ccEmails.split(',').map((email) => email.trim()));
      }

      // Build multipart form data so attachment can be sent
      const fd = new FormData();
      fd.append('email', JSON.stringify(emailList));
      fd.append('client_name', clientName || '');
      fd.append('subject', 'Your Requested Quotation');
      fd.append('quotation_doc_link', quotationData?.quotation?.quotation_file_link || '');
      fd.append('quotation_no', quotationData?.quotation?.quotation_no || '');
      if (attachmentFile) fd.append('attachment', attachmentFile);

      await onShare(fd);
      onClose();
    } catch (error) {
      console.error('Error sharing quotation:', error);
      alert('Failed to share quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-xl w-[420px] relative">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Share Quotation</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client Email</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => {
                const v = e.target.value;
                setClientEmail(v);
                if (!v) setClientEmailError('Email is required');
                else if (!isValidEmail(v)) setClientEmailError('Enter a valid email');
                else setClientEmailError('');
              }}
              placeholder="client@example.com"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {clientEmailError && (
              <p className="text-xs text-red-500 mt-1">{clientEmailError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="John Smith"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Also send to</label>
            <input
              type="text"
              value={ccEmails}
              onChange={(e) => {
                const v = e.target.value;
                setCcEmails(v);
                if (v) {
                  const invalid = splitAndValidate(v);
                  if (invalid.length > 0) setCcEmailsError(`Invalid: ${invalid.join(', ')}`);
                  else setCcEmailsError('');
                } else {
                  setCcEmailsError('');
                }
              }}
              placeholder="Enter CC email addresses"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
            {ccEmailsError && (
              <p className="text-xs text-red-500 mt-1">{ccEmailsError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Attachment</label>
            <div 
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-500">Upload PDF file</span>
                <span className="text-xs text-gray-400">Click to browse</span>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setAttachmentFile(e.target.files[0])}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quotation PDF Link</label>
            <input
              type="text"
              value={quotationData?.quotation?.quotation_file_link || ''}
              readOnly
              className="w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={
                loading || !clientEmail || !clientName || clientEmailError || ccEmailsError
              }
            >
              {loading ? 'Sending...' : 'Share'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareQuotationPopup;
