import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Wand2, Download, Copy, Eye, Edit2, Loader2 } from 'lucide-react';

interface AIDocumentDrafterProps {
  caseId?: number;
  caseName?: string;
  onClose?: () => void;
  onDocumentGenerated?: (document: { title: string; content: string }) => void;
}

interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  variables: string[];
}

/**
 * AI Document Drafter Component
 * Generates legal documents using AI based on templates and case data
 */
export function AIDocumentDrafter({
  caseId,
  caseName = 'Case #2024-001',
  onClose,
  onDocumentGenerated,
}: AIDocumentDrafterProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'draft' | 'preview'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [draftedDocument, setDraftedDocument] = useState<{ title: string; content: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Available document templates
  const templates: DocumentTemplate[] = [
    {
      id: 'complaint',
      name: 'Complaint',
      category: 'Litigation',
      description: 'Initial complaint filing for civil litigation',
      variables: ['plaintiff', 'defendant', 'jurisdiction', 'cause_of_action', 'damages_sought'],
    },
    {
      id: 'settlement',
      name: 'Settlement Agreement',
      category: 'Settlement',
      description: 'Comprehensive settlement and release agreement',
      variables: ['party_a', 'party_b', 'settlement_amount', 'release_scope', 'effective_date'],
    },
    {
      id: 'nda',
      name: 'Non-Disclosure Agreement',
      category: 'Contracts',
      description: 'Confidentiality and non-disclosure agreement',
      variables: ['disclosing_party', 'receiving_party', 'confidential_info', 'term_years', 'jurisdiction'],
    },
    {
      id: 'motion',
      name: 'Motion for Summary Judgment',
      category: 'Litigation',
      description: 'Motion requesting summary judgment',
      variables: ['moving_party', 'opposing_party', 'grounds', 'supporting_facts', 'legal_basis'],
    },
    {
      id: 'memo',
      name: 'Legal Memorandum',
      category: 'Research',
      description: 'Legal research memorandum',
      variables: ['issue', 'facts', 'applicable_law', 'analysis', 'conclusion'],
    },
    {
      id: 'contract',
      name: 'Service Agreement',
      category: 'Contracts',
      description: 'General service agreement template',
      variables: ['service_provider', 'client', 'services', 'compensation', 'term'],
    },
  ];

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setActiveTab('draft');
    // Initialize variables
    const vars: Record<string, string> = {};
    template.variables.forEach((v) => {
      vars[v] = '';
    });
    setTemplateVariables(vars);
  };

  const handleVariableChange = (key: string, value: string) => {
    setTemplateVariables((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateDocument = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    // Simulate AI document generation
    setTimeout(() => {
      const content = `
# ${selectedTemplate.name}

**Case:** ${caseName}
**Generated:** ${new Date().toLocaleDateString()}

## Introduction

This ${selectedTemplate.name.toLowerCase()} is prepared based on the following information:

${selectedTemplate.variables.map((v) => `- **${v.replace(/_/g, ' ')}:** ${templateVariables[v] || '[Not provided]'}`).join('\n')}

## Document Body

[AI-Generated Content Based on Template and Variables]

The following document has been automatically generated using AI based on the selected template and provided information. Please review carefully before use.

### Key Sections

1. **Parties**: ${templateVariables['plaintiff'] || templateVariables['party_a'] || templateVariables['service_provider'] || '[To be specified]'}

2. **Terms and Conditions**: [AI-generated terms based on template]

3. **Consideration**: ${templateVariables['damages_sought'] || templateVariables['settlement_amount'] || templateVariables['compensation'] || '[To be specified]'}

4. **Effective Date**: ${templateVariables['effective_date'] || new Date().toLocaleDateString()}

## Signature Block

This document is ready for review and signature.

---
*This document was generated by Legal OS AI Document Drafter*
*Generated on: ${new Date().toLocaleString()}*
      `;

      setDraftedDocument({
        title: selectedTemplate.name,
        content,
      });
      setActiveTab('preview');
      setIsGenerating(false);
    }, 2000);
  };

  const handleDownloadDocument = () => {
    if (!draftedDocument) return;

    // Create a blob with the document content
    const element = document.createElement('a');
    const file = new Blob([draftedDocument.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${draftedDocument.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyDocument = () => {
    if (!draftedDocument) return;
    navigator.clipboard.writeText(draftedDocument.content);
  };

  return (
    <Card className="border border-border h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-accent" />
            <div>
              <CardTitle>AI Document Drafter</CardTitle>
              <CardDescription>Generate legal documents from templates</CardDescription>
            </div>
          </div>
          {onClose && (
            <Button size="icon" variant="ghost" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="draft" disabled={!selectedTemplate}>
            Draft
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!draftedDocument}>
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="flex-1 overflow-auto px-4 pb-4">
          <div className="grid grid-cols-1 gap-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`border border-border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'bg-accent/10 border-accent'
                    : 'hover:bg-secondary/50'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {template.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {template.variables.map((v) => (
                    <Badge key={v} variant="secondary" className="text-xs">
                      {v.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Draft Tab */}
        <TabsContent value="draft" className="flex-1 overflow-auto px-4 pb-4">
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="bg-secondary/50 border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">{selectedTemplate.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-sm">Required Information</h4>
                {selectedTemplate.variables.map((variable) => (
                  <div key={variable}>
                    <label className="text-sm font-medium text-foreground mb-1 block capitalize">
                      {variable.replace(/_/g, ' ')} *
                    </label>
                    <Input
                      placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                      value={templateVariables[variable] || ''}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={handleGenerateDocument}
                disabled={isGenerating || !Object.values(templateVariables).some((v) => v.trim())}
                className="w-full bg-accent hover:bg-accent/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Document
                  </>
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="flex-1 overflow-auto px-4 pb-4">
          {draftedDocument && (
            <div className="space-y-4">
              <div className="bg-secondary/50 border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground">{draftedDocument.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Generated on {new Date().toLocaleString()}
                </p>
              </div>

              <ScrollArea className="border border-border rounded-lg p-4 h-64">
                <div className="space-y-2 text-sm text-foreground whitespace-pre-wrap">
                  {draftedDocument.content}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Button
                  onClick={handleCopyDocument}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={handleDownloadDocument}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => {
                    onDocumentGenerated?.(draftedDocument);
                    onClose?.();
                  }}
                  size="sm"
                  className="flex-1 bg-accent hover:bg-accent/90"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
