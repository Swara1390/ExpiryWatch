import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Trash2, AlertTriangle, CheckCircle, Clock, Sparkles, Loader2 } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Safe':
        return { bg: 'bg-mint', text: 'text-carbon', border: 'border-transparent', icon: CheckCircle, label: 'Safe' };
      case 'Upcoming':
        return { bg: 'bg-voltage', text: 'text-carbon', border: 'border-transparent', icon: Clock, label: 'Upcoming' };
      case 'Urgent':
        return { bg: 'bg-carbon', text: 'text-voltage', border: 'border-transparent', icon: AlertTriangle, label: 'Urgent' };
      case 'Expired':
        return { bg: 'bg-carbon', text: 'text-paper', border: 'border-transparent', icon: AlertTriangle, label: 'Expired' };
      default:
        return { bg: 'bg-mist', text: 'text-slate', border: 'border-mist', icon: Clock, label: 'Unknown' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-carbon" />
        <p className="font-mono text-xs uppercase tracking-widest text-slate">Loading ExpiryWatch</p>
      </div>
    );
  }

  const safeCount = documents.filter(d => d.status === 'Safe').length;
  const upcomingCount = documents.filter(d => d.status === 'Upcoming' || d.status === 'Urgent').length;
  const expiredCount = documents.filter(d => d.status === 'Expired').length;

  return (
    <div className="pb-16 max-w-6xl mx-auto mt-8 sm:mt-12 px-4 sm:px-0">
      
      {/* Hero Section */}
      <div className="mb-12 border-b border-mist pb-10">
        <h1 className="font-display text-5xl sm:text-7xl uppercase tracking-tight text-carbon leading-none mb-4">
          Dashboard
        </h1>
        <p className="font-sans text-slate text-lg max-w-2xl">
          Your documents. Their deadlines. One place.
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="bg-paper p-10 sm:p-16 rounded-[32px] border border-mist shadow-sm text-center">
          <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-carbon mb-4">Empty Vault</h2>
          <p className="font-sans text-slate text-lg mb-8 max-w-md mx-auto">
            You aren't tracking any documents yet. Upload your first document to ensure you never miss a validity date.
          </p>
          <a href="/upload" className="inline-flex bg-carbon text-paper font-sans font-semibold px-8 py-4 rounded-lg hover:bg-graphite transition-colors text-base">
            Track New Document
          </a>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-paper border border-mist rounded-2xl p-6 flex flex-col justify-between h-32">
              <span className="font-mono text-xs uppercase text-slate tracking-widest">Total Tracking</span>
              <span className="font-display text-5xl text-carbon">{documents.length}</span>
            </div>
            <div className="bg-mint border border-mint rounded-2xl p-6 flex flex-col justify-between h-32">
              <span className="font-mono text-xs uppercase text-carbon tracking-widest">Safe</span>
              <span className="font-display text-5xl text-carbon">{safeCount}</span>
            </div>
            <div className="bg-voltage border border-voltage rounded-2xl p-6 flex flex-col justify-between h-32">
              <span className="font-mono text-xs uppercase text-carbon tracking-widest">Upcoming</span>
              <span className="font-display text-5xl text-carbon">{upcomingCount}</span>
            </div>
            <div className="bg-carbon border border-carbon rounded-2xl p-6 flex flex-col justify-between h-32">
              <span className="font-mono text-xs uppercase text-mist tracking-widest">Expired</span>
              <span className="font-display text-5xl text-paper">{expiredCount}</span>
            </div>
          </div>

          {/* Document List */}
          <div className="space-y-4">
            <h2 className="font-mono text-sm uppercase tracking-widest text-slate mb-6">Tracked Documents</h2>
            {documents.map((doc) => {
              const config = getStatusConfig(doc.status);
              const StatusIcon = config.icon;
              return (
                <div key={doc.id} className="bg-paper border border-mist rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:border-ash hover:shadow-sm">
                  
                  <div className="flex-1">
                    <h3 className="font-display text-3xl uppercase tracking-tight text-carbon leading-none mb-2">{doc.document_type}</h3>
                    <p className="font-mono text-xs text-slate">Added {format(new Date(doc.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  
                  <div className="flex flex-row md:flex-row items-center gap-6 sm:gap-10 w-full md:w-auto">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs uppercase text-slate tracking-widest mb-1">Expires</span>
                      <span className="font-sans font-semibold text-carbon text-lg">{format(new Date(doc.expiry_date), 'MMM d, yyyy')}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-mono text-xs uppercase text-slate tracking-widest mb-1">Remaining</span>
                      <span className={`font-sans font-bold text-lg ${doc.days_remaining < 0 ? 'text-carbon' : 'text-carbon'}`}>
                        {doc.days_remaining < 0 ? 'Expired' : `${doc.days_remaining}d`}
                      </span>
                    </div>

                    <div className={`hidden sm:flex px-4 py-2 rounded-full text-xs font-mono font-bold items-center gap-2 border ${config.bg} ${config.text} ${config.border}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </div>

                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="ml-auto md:ml-0 text-slate hover:text-carbon bg-mist hover:bg-ash p-3 rounded-full transition-colors flex-shrink-0"
                      title="Remove tracking"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
