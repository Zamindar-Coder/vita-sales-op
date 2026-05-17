'use client';

import LeadIntakeForm from '@/components/LeadIntakeForm';

interface InputPanelProps {
  onRunAgent: (input: string) => void;
  onGenerateReport: () => void;
  isLoading: boolean;
}

export default function InputPanel({
  onRunAgent,
  onGenerateReport,
  isLoading,
}: InputPanelProps) {
  return (
    <div>
      <LeadIntakeForm onRunAnalysis={onRunAgent} isLoading={isLoading} />
    </div>
  );
}
