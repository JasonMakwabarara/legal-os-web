import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Plus, Trash2, Save, Copy, ChevronDown, ChevronUp } from 'lucide-react';

interface TemplateComponent {
  id: string;
  type: 'text' | 'clause' | 'condition' | 'variable';
  content: string;
  label?: string;
  required?: boolean;
}

interface TemplateData {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  jurisdiction?: string;
  industry?: string;
  tags?: string[];
  components: TemplateComponent[];
}

const COMPONENT_TYPES = [
  { value: 'text', label: 'Text Block' },
  { value: 'clause', label: 'Clause' },
  { value: 'condition', label: 'Conditional Block' },
  { value: 'variable', label: 'Variable' },
];

const CATEGORIES = [
  'Indemnification',
  'Limitation of Liability',
  'Confidentiality',
  'Termination',
  'Dispute Resolution',
  'Payment Terms',
  'Intellectual Property',
  'Representations & Warranties',
  'Force Majeure',
  'Governing Law',
];

export function ClauseTemplateBuilder() {
  const [templateData, setTemplateData] = useState<TemplateData>({
    title: '',
    description: '',
    category: '',
    components: [],
  });

  const [newComponent, setNewComponent] = useState<TemplateComponent>({
    id: '',
    type: 'text',
    content: '',
  });

  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const createTemplateMutation = trpc.templates.create.useMutation();
  const createVersionMutation = trpc.templates.createVersion.useMutation();

  const handleAddComponent = useCallback(() => {
    if (!newComponent.content.trim()) return;

    const component: TemplateComponent = {
      ...newComponent,
      id: `comp-${Date.now()}`,
    };

    setTemplateData(prev => ({
      ...prev,
      components: [...prev.components, component],
    }));

    setNewComponent({
      id: '',
      type: 'text',
      content: '',
    });
  }, [newComponent]);

  const handleRemoveComponent = useCallback((id: string) => {
    setTemplateData(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== id),
    }));
  }, []);

  const handleUpdateComponent = useCallback((id: string, updates: Partial<TemplateComponent>) => {
    setTemplateData(prev => ({
      ...prev,
      components: prev.components.map(c =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  }, []);

  const handleSaveTemplate = async () => {
    if (!templateData.title || !templateData.category) {
      alert('Please fill in title and category');
      return;
    }

    try {
      await createTemplateMutation.mutateAsync({
        title: templateData.title,
        description: templateData.description,
        category: templateData.category,
        subcategory: templateData.subcategory,
        content: templateData.components.map(c => c.content).join('\n\n'),
        components: templateData.components,
        tags: templateData.tags,
        riskLevel: templateData.riskLevel,
        jurisdiction: templateData.jurisdiction,
        industry: templateData.industry,
      });

      alert('Template created successfully!');
      setTemplateData({
        title: '',
        description: '',
        category: '',
        components: [],
      });
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    }
  };

  const handleDuplicateComponent = useCallback((component: TemplateComponent) => {
    const duplicated: TemplateComponent = {
      ...component,
      id: `comp-${Date.now()}`,
    };
    setTemplateData(prev => ({
      ...prev,
      components: [...prev.components, duplicated],
    }));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Clause Template Builder</h1>
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {!showPreview ? (
        <div className="grid grid-cols-3 gap-6">
          {/* Left Panel: Template Metadata */}
          <div className="col-span-1 space-y-4">
            <Card className="p-4 bg-card border-border">
              <h2 className="text-lg font-semibold mb-4 text-card-foreground">Template Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground">Title *</label>
                  <Input
                    value={templateData.title}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Indemnification Clause"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground">Description</label>
                  <Textarea
                    value={templateData.description}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this template..."
                    className="mt-1 h-20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground">Category *</label>
                  <Select
                    value={templateData.category}
                    onValueChange={(value) => setTemplateData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground">Risk Level</label>
                  <Select
                    value={templateData.riskLevel || ''}
                    onValueChange={(value) => setTemplateData(prev => ({ ...prev, riskLevel: value as any }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground">Jurisdiction</label>
                  <Input
                    value={templateData.jurisdiction || ''}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, jurisdiction: e.target.value }))}
                    placeholder="e.g., US, UK, EU"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground">Industry</label>
                  <Input
                    value={templateData.industry || ''}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., Technology, Finance"
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleSaveTemplate}
                  disabled={createTemplateMutation.isPending}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Middle Panel: Component Builder */}
          <div className="col-span-1 space-y-4">
            <Card className="p-4 bg-card border-border">
              <h2 className="text-lg font-semibold mb-4 text-card-foreground">Add Component</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground">Type</label>
                  <Select
                    value={newComponent.type}
                    onValueChange={(value) => setNewComponent(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPONENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground">Content</label>
                  <Textarea
                    value={newComponent.content}
                    onChange={(e) => setNewComponent(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter clause text or variable..."
                    className="mt-1 h-24"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-card-foreground">Label (optional)</label>
                  <Input
                    value={newComponent.label || ''}
                    onChange={(e) => setNewComponent(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Indemnifying Party"
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleAddComponent}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Component
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Panel: Components List */}
          <div className="col-span-1 space-y-4">
            <Card className="p-4 bg-card border-border">
              <h2 className="text-lg font-semibold mb-4 text-card-foreground">
                Components ({templateData.components.length})
              </h2>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {templateData.components.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No components added yet</p>
                ) : (
                  templateData.components.map((component, index) => (
                    <div
                      key={component.id}
                      className="border border-border rounded-lg p-3 bg-background"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{component.type}</Badge>
                            <span className="text-sm font-medium text-foreground">
                              {component.label || `Component ${index + 1}`}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {component.content}
                          </p>
                        </div>
                        <button
                          onClick={() => setExpandedComponent(
                            expandedComponent === component.id ? null : component.id
                          )}
                          className="ml-2"
                        >
                          {expandedComponent === component.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {expandedComponent === component.id && (
                        <div className="mt-3 pt-3 border-t border-border space-y-2">
                          <Textarea
                            value={component.content}
                            onChange={(e) => handleUpdateComponent(component.id, { content: e.target.value })}
                            className="text-xs h-16"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDuplicateComponent(component)}
                              className="flex-1"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Duplicate
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveComponent(component.id)}
                              className="flex-1"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <Card className="p-8 bg-card border-border">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-2 text-card-foreground">{templateData.title}</h2>
            <p className="text-muted-foreground mb-4">{templateData.description}</p>

            <div className="flex gap-2 mb-6">
              <Badge>{templateData.category}</Badge>
              {templateData.riskLevel && <Badge variant="outline">{templateData.riskLevel}</Badge>}
              {templateData.jurisdiction && <Badge variant="outline">{templateData.jurisdiction}</Badge>}
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
              {templateData.components.map((component, index) => (
                <div key={component.id} className="p-4 bg-background rounded border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{component.type}</Badge>
                    {component.label && <span className="font-semibold">{component.label}</span>}
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{component.content}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
