'use client';

import { useState, useEffect } from 'react';
import Sidebar, { View } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import DashboardView from '@/components/DashboardView';
import AnalysisView from '@/components/AnalysisView';
import PipelineView from '@/components/PipelineView';
import LeadsView from '@/components/LeadsView';
import ReportsView from '@/components/ReportsView';
import ActivityView from '@/components/ActivityView';
import SettingsView from '@/components/SettingsView';
import LeadDetailModal from '@/components/LeadDetailModal';
import { Lead, getLeadById } from '@/lib/store';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [pendingInquiry, setPendingInquiry] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  // Store last analysis result to persist across tab switches
  const [lastAnalysisResult, setLastAnalysisResult] = useState<any>(null);

  useEffect(() => {
    const handleStorageChange = () => setRefreshKey(k => k + 1);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    setPendingInquiry(null);
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleViewLeadById = (leadId: string) => {
    const lead = getLeadById(leadId);
    if (lead) {
      setSelectedLead(lead);
      setCurrentView('dashboard');
    }
  };

  const handleRunAnalysis = (inquiry?: string) => {
    setPendingInquiry(inquiry || null);
    setCurrentView('analysis');
  };

  const handleAnalysisComplete = (result: any) => {
    setLastAnalysisResult(result);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onViewLead={handleViewLead} onRunAnalysis={() => handleRunAnalysis()} />;
      case 'analysis':
        return <AnalysisView
          initialInquiry={pendingInquiry}
          onComplete={() => setPendingInquiry(null)}
          savedResult={lastAnalysisResult}
          onSaveResult={handleAnalysisComplete}
        />;
      case 'pipeline':
        return <PipelineView onViewLead={handleViewLead} />;
      case 'leads':
        return <LeadsView onViewLead={handleViewLead} />;
      case 'reports':
        return <ReportsView />;
      case 'activity':
        return <ActivityView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onViewLead={handleViewLead} onRunAnalysis={handleRunAnalysis} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} onViewLead={handleViewLeadById} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">
          {renderView()}
        </main>
      </div>
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
