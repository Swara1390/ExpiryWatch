import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { UploadCloud, Check, X, Edit2, Loader2, PenTool, Sparkles } from 'lucide-react';

const DOC_TYPES = ["Driving License", "Passport", "Insurance", "Certificate", "Contract", "Other", "Unknown"];

export default function Upload() {
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'manual'
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState('');
  
  const [editMode, setEditMode] = useState(false);
  const [formType, setFormType] = useState('');
  const [customType, setCustomType] = useState('');
  const [formDate, setFormDate] = useState('');
  
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setExtractedData(null);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setExtracting(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setExtractedData(res.data);
      setFormType(res.data.document_type || 'Unknown');
      setFormDate(res.data.expiry_date || '');
    } catch (err) {
      setError(err.response?.data?.detail || 'Extraction failed. Please try again or check the file format.');
    } finally {
      setExtracting(false);
    }
  };

  const handleConfirm = async () => {
    const finalType = formType === 'Other' ? customType : formType;
    if (!finalType || finalType === 'Unknown') {
      setError('Please specify a valid document name.');
      return;
    }
    if (!formDate) {
      setError('Please specify an expiry date.');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      await api.post('/documents', {
        document_type: finalType,
        expiry_date: formDate
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save document. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 mt-8 sm:mt-12 px-4 sm:px-0">
      
      <div className="mb-12 border-b border-mist pb-10">
        <h1 className="font-display text-5xl sm:text-7xl uppercase tracking-tight text-carbon leading-none mb-4">
          Add Document
        </h1>
        <p className="font-sans text-slate text-lg max-w-2xl">
          Track a new document manually or extract details with ExpiryWatch AI.
        </p>
      </div>
      
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-sans font-medium flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
          {error}
        </div>
      )}
      
      {/* Tabs */}
      {!extractedData && (
        <div className="flex flex-wrap gap-4 mb-10">
          <button 
            onClick={() => { setActiveTab('ai'); setError(''); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-colors border ${activeTab === 'ai' ? 'bg-carbon text-paper border-carbon' : 'bg-transparent text-slate border-mist hover:border-ash'}`}
          >
            <Sparkles className="w-4 h-4" /> OCR Extract
          </button>
          <button 
            onClick={() => { setActiveTab('manual'); setError(''); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-colors border ${activeTab === 'manual' ? 'bg-carbon text-paper border-carbon' : 'bg-transparent text-slate border-mist hover:border-ash'}`}
          >
            <PenTool className="w-4 h-4" /> Manual Entry
          </button>
        </div>
      )}

      {/* AI Upload Section */}
      {!extractedData && activeTab === 'ai' && (
        <div className="bg-paper p-8 sm:p-12 rounded-[32px] border border-mist shadow-sm">
          <div className="border border-dashed border-ash bg-mist rounded-2xl p-12 text-center hover:border-carbon transition-colors cursor-pointer group">
            <UploadCloud className="w-12 h-12 text-carbon mx-auto mb-6 group-hover:-translate-y-1 transition-transform" />
            <h3 className="font-display text-3xl uppercase tracking-tight text-carbon mb-2">Select a document</h3>
            <p className="font-sans text-slate mb-8">PDF, JPG, or PNG up to 10MB.</p>
            
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              accept=".pdf,image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
            />
            <label 
              htmlFor="file-upload"
              className="cursor-pointer bg-paper border border-mist text-carbon px-8 py-3 rounded-lg font-sans font-semibold hover:border-ash transition-colors inline-block"
            >
              Browse Files
            </label>
            
            {file && (
              <div className="mt-6">
                <span className="inline-block px-4 py-2 bg-paper border border-mist rounded-full font-mono text-xs text-carbon">
                  {file.name}
                </span>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleExtract}
            disabled={!file || extracting}
            className="w-full mt-6 bg-carbon text-paper font-sans font-semibold py-4 rounded-lg hover:bg-graphite transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base"
          >
            {extracting ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><Sparkles className="w-5 h-5"/> Extract Details</>}
          </button>
        </div>
      )}

      {/* Manual Entry Section */}
      {!extractedData && activeTab === 'manual' && (
        <div className="bg-paper p-8 sm:p-12 rounded-[32px] border border-mist shadow-sm">
          <div className="space-y-8">
            <div>
              <label className="block text-xs font-mono font-medium text-slate uppercase tracking-wider mb-2">Document Type</label>
              <select 
                value={formType}
                onChange={(e) => {
                  setFormType(e.target.value);
                  if (e.target.value !== 'Other') setCustomType('');
                }}
                className="w-full px-4 py-3 bg-mist border border-transparent focus:border-carbon focus:bg-paper rounded-lg outline-none transition-colors font-sans text-carbon"
              >
                <option value="" disabled>Select Document...</option>
                {DOC_TYPES.filter(t => t !== 'Unknown').map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            
            {formType === 'Other' && (
              <div>
                <label className="block text-xs font-mono font-medium text-slate uppercase tracking-wider mb-2">Custom Document Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Gym Membership"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="w-full px-4 py-3 bg-mist border border-transparent focus:border-carbon focus:bg-paper rounded-lg outline-none transition-colors font-sans text-carbon placeholder-ash"
                />
              </div>
            )}
            
            <div>
              <label className="block text-xs font-mono font-medium text-slate uppercase tracking-wider mb-2">Expiry Date</label>
              <input 
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-4 py-3 bg-mist border border-transparent focus:border-carbon focus:bg-paper rounded-lg outline-none transition-colors font-sans text-carbon"
              />
            </div>
          </div>
          
          <button 
            onClick={handleConfirm}
            disabled={saving}
            className="w-full mt-10 bg-carbon text-paper font-sans font-semibold py-4 rounded-lg hover:bg-graphite transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />} 
            {saving ? 'Saving...' : 'Track Document'}
          </button>
        </div>
      )}

      {/* Verification / Edit Mode (After AI Extract) */}
      {extractedData && (
        <div className="bg-paper p-8 sm:p-12 rounded-[32px] border border-mist shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 pb-6 border-b border-mist gap-4">
            <div>
              <h2 className="font-display text-4xl uppercase tracking-tight text-carbon">Verification</h2>
              <p className="font-sans text-slate text-sm mt-1">Review the extracted details before saving.</p>
            </div>
            <button 
              onClick={() => setEditMode(!editMode)}
              className="text-carbon flex items-center justify-center gap-2 text-sm font-sans font-semibold border border-mist hover:border-ash bg-paper px-4 py-2 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" /> {editMode ? 'Lock Fields' : 'Edit Fields'}
            </button>
          </div>
          
          <div className="space-y-8">
            <div>
              <label className="block text-xs font-mono font-medium text-slate uppercase tracking-wider mb-2">Document Type</label>
              {editMode ? (
                <>
                <select 
                  value={formType}
                  onChange={(e) => {
                    setFormType(e.target.value);
                    if (e.target.value !== 'Other') setCustomType('');
                  }}
                  className="w-full px-4 py-3 bg-mist border border-carbon rounded-lg outline-none font-sans text-carbon"
                >
                  <option value="" disabled>Select Document...</option>
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {formType === 'Other' && (
                  <input 
                    type="text"
                    placeholder="Custom Name"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full mt-4 px-4 py-3 bg-mist border border-carbon rounded-lg outline-none font-sans text-carbon"
                  />
                )}
                </>
              ) : (
                <div className="px-4 py-4 bg-mist rounded-lg font-sans font-semibold text-lg text-carbon flex items-center gap-4">
                  {formType === 'Other' ? customType : formType}
                  {formType === 'Unknown' && <span className="text-red-600 text-xs font-mono uppercase tracking-widest border border-red-200 bg-red-50 px-2 py-1 rounded">Needs Edit</span>}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-mono font-medium text-slate uppercase tracking-wider mb-2">Expiry Date</label>
              {editMode ? (
                <input 
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-4 py-3 bg-mist border border-carbon rounded-lg outline-none font-sans text-carbon"
                />
              ) : (
                <div className="px-4 py-4 bg-mist rounded-lg font-sans font-semibold text-lg text-carbon flex items-center gap-4">
                  {formDate || <span className="text-red-600 text-xs font-mono uppercase tracking-widest border border-red-200 bg-red-50 px-2 py-1 rounded">Missing Date</span>}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => { setExtractedData(null); setFile(null); }}
              className="flex-1 px-4 py-4 border border-mist text-slate hover:text-carbon font-sans font-semibold rounded-lg hover:border-ash transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" /> Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={saving}
              className="flex-[2] bg-mint text-carbon px-4 py-4 rounded-lg font-sans font-semibold hover:bg-[#bdf0b6] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />} 
              {saving ? 'Saving...' : 'Confirm & Track'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
