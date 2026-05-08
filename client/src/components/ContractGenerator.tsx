import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Zap, Download } from 'lucide-react';

interface ContractTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  requiredFields: string[];
}

interface GeneratedContract {
  id: string;
  title: string;
  content: string;
  generatedAt: Date;
}

/**
 * ContractGenerator Component
 * AI-powered contract generation from templates with smart form builder
 */
export const ContractGenerator: React.FC = () => {
  const [step, setStep] = useState<'select' | 'form' | 'preview'>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedContract, setGeneratedContract] = useState<GeneratedContract | null>(null);

  // Mock contract templates
  const templates: ContractTemplate[] = [
    {
      id: 'nda',
      name: 'Non-Disclosure Agreement',
      category: 'Confidentiality',
      description: 'Protect confidential information between parties',
      requiredFields: ['partyA', 'partyB', 'effectiveDate', 'term'],
    },
    {
      id: 'service-agreement',
      name: 'Service Agreement',
      category: 'Services',
      description: 'Define scope of services and payment terms',
      requiredFields: ['serviceName', 'provider', 'client', 'rate', 'term'],
    },
    {
      id: 'employment',
      name: 'Employment Agreement',
      category: 'Employment',
      description: 'Establish employment terms and conditions',
      requiredFields: ['employeeName', 'position', 'salary', 'startDate', 'benefits'],
    },
    {
      id: 'vendor-agreement',
      name: 'Vendor Agreement',
      category: 'Procurement',
      description: 'Establish vendor terms and conditions',
      requiredFields: ['vendorName', 'services', 'paymentTerms', 'term', 'liability'],
    },
    {
      id: 'ip-assignment',
      name: 'IP Assignment Agreement',
      category: 'Intellectual Property',
      description: 'Assign intellectual property rights',
      requiredFields: ['assignor', 'assignee', 'ipDescription', 'consideration'],
    },
  ];

  const handleSelectTemplate = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setFormData({});
    template.requiredFields.forEach((field) => {
      setFormData((prev) => ({ ...prev, [field]: '' }));
    });
    setStep('form');
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateContract = () => {
    // Simulate AI-powered contract generation
    const mockContent = `
# ${selectedTemplate?.name}

This agreement is entered into as of ${formData.effectiveDate || 'the date hereof'}.

## Parties
${selectedTemplate?.requiredFields.includes('partyA') ? `Party A: ${formData.partyA || '[Party A Name]'}` : ''}
${selectedTemplate?.requiredFields.includes('partyB') ? `Party B: ${formData.partyB || '[Party B Name]'}` : ''}

## Terms and Conditions
1. The parties agree to the following terms and conditions:
2. All obligations shall commence on ${formData.startDate || formData.effectiveDate || 'the effective date'}.
3. This agreement shall remain in effect for ${formData.term || 'the agreed term'}.

## Compensation
${selectedTemplate?.requiredFields.includes('rate') ? `Rate: ${formData.rate || '[Rate]'}` : ''}
${selectedTemplate?.requiredFields.includes('salary') ? `Salary: ${formData.salary || '[Salary]'}` : ''}

## Confidentiality
All confidential information shall be protected and not disclosed to third parties without written consent.

## Termination
Either party may terminate this agreement upon written notice as provided herein.

## Governing Law
This agreement shall be governed by applicable law.

Executed as of the date first written above.
    `;

    setGeneratedContract({
      id: `contract-${Date.now()}`,
      title: selectedTemplate?.name || 'Generated Contract',
      content: mockContent,
      generatedAt: new Date(),
    });
    setStep('preview');
  };

  const handleDownloadContract = () => {
    if (!generatedContract) return;

    const element = document.createElement('a');
    const file = new Blob([generatedContract.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${generatedContract.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-500" />
          <h2 className="text-lg font-semibold">Contract Generator</h2>
        </div>
        <div className="text-sm text-slate-500">
          {step === 'select' && 'Step 1: Select Template'}
          {step === 'form' && 'Step 2: Fill in Details'}
          {step === 'preview' && 'Step 3: Review & Download'}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {step === 'select' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="p-4 cursor-pointer hover:border-blue-500 transition border-2"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{template.category}</p>
                    <p className="text-sm text-slate-600 mt-2">{template.description}</p>
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {template.requiredFields.slice(0, 3).map((field) => (
                        <span
                          key={field}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {field}
                        </span>
                      ))}
                      {template.requiredFields.length > 3 && (
                        <span className="text-xs text-slate-500">
                          +{template.requiredFields.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {step === 'form' && selectedTemplate && (
          <div className="max-w-2xl space-y-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900">AI-Powered Generation</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    Fill in the details below and our AI will generate a complete contract
                    tailored to your needs.
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              {selectedTemplate.requiredFields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1 capitalize">
                    {field.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    value={formData[field] || ''}
                    onChange={(e) => handleFormChange(field, e.target.value)}
                    placeholder={`Enter ${field}`}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'preview' && generatedContract && (
          <Card className="p-6 bg-slate-950 border-slate-800">
            <div className="prose prose-invert max-w-none">
              <h1 className="text-white">{generatedContract.title}</h1>
              <div className="text-slate-300 whitespace-pre-wrap font-mono text-sm">
                {generatedContract.content}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex gap-2 border-t border-slate-700 pt-4">
        {step !== 'select' && (
          <Button
            variant="outline"
            onClick={() => {
              if (step === 'form') setStep('select');
              if (step === 'preview') setStep('form');
            }}
          >
            Back
          </Button>
        )}

        {step === 'form' && (
          <Button
            onClick={handleGenerateContract}
            disabled={!Object.values(formData).every((v) => v)}
            className="flex-1"
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate Contract
          </Button>
        )}

        {step === 'preview' && (
          <>
            <Button
              variant="outline"
              onClick={() => setStep('select')}
              className="flex-1"
            >
              Create Another
            </Button>
            <Button onClick={handleDownloadContract} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Contract
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ContractGenerator;
