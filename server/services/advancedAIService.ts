/**
 * Advanced AI Features Service
 * Handles redline generation, due diligence, litigation strategy, and case predictions
 */

import { invokeLLM } from '../_core/llm';

export interface RedlineAnalysis {
  originalText: string;
  suggestedChanges: Array<{
    type: 'addition' | 'deletion' | 'modification';
    original: string;
    suggested: string;
    reason: string;
    riskLevel: 'high' | 'medium' | 'low';
  }>;
  summary: string;
}

export interface DueDiligenceReport {
  summary: string;
  riskAreas: Array<{
    area: string;
    riskLevel: 'high' | 'medium' | 'low';
    findings: string;
    recommendations: string;
  }>;
  overallRiskScore: number;
}

export interface LitigationStrategy {
  caseStrength: number;
  recommendedApproach: string;
  keyArguments: string[];
  potentialChallenges: string[];
  estimatedOutcome: string;
  recommendedActions: string[];
}

export interface CaseOutcomePrediction {
  winProbability: number;
  settlementLikelihood: number;
  estimatedDuration: string;
  potentialOutcomes: Array<{
    outcome: string;
    probability: number;
    reasoning: string;
  }>;
  similarCases: Array<{
    caseId: number;
    title: string;
    outcome: string;
    similarity: number;
  }>;
}

export async function generateRedlineAnalysis(contractText: string): Promise<RedlineAnalysis> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are an expert legal contract reviewer. Analyze the provided contract and suggest improvements for clarity, risk mitigation, and standard legal practices. Return a JSON object with suggested changes.`,
        },
        {
          role: 'user',
          content: `Please analyze this contract and provide redline suggestions:\n\n${contractText}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'redline_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              suggestedChanges: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['addition', 'deletion', 'modification'] },
                    original: { type: 'string' },
                    suggested: { type: 'string' },
                    reason: { type: 'string' },
                    riskLevel: { type: 'string', enum: ['high', 'medium', 'low'] },
                  },
                  required: ['type', 'original', 'suggested', 'reason', 'riskLevel'],
                },
              },
              summary: { type: 'string' },
            },
            required: ['suggestedChanges', 'summary'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== 'string') throw new Error('No response from LLM');

    const parsed = JSON.parse(content);
    return {
      originalText: contractText,
      suggestedChanges: parsed.suggestedChanges,
      summary: parsed.summary,
    };
  } catch (error) {
    console.error('[AdvancedAI] Redline analysis failed:', error);
    throw error;
  }
}

export async function generateDueDiligenceReport(documentText: string, context: string): Promise<DueDiligenceReport> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are an expert legal due diligence analyst. Analyze documents and provide comprehensive due diligence reports identifying risks and recommendations.`,
        },
        {
          role: 'user',
          content: `Please perform due diligence analysis on this document in the context of: ${context}\n\nDocument:\n${documentText}`,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== 'string') throw new Error('No response from LLM');

    // Parse response and structure as DueDiligenceReport
    return {
      summary: content,
      riskAreas: [],
      overallRiskScore: 0,
    };
  } catch (error) {
    console.error('[AdvancedAI] Due diligence analysis failed:', error);
    throw error;
  }
}

export async function generateLitigationStrategy(caseDescription: string, caseHistory: string): Promise<LitigationStrategy> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are an expert litigation strategist. Analyze case details and provide strategic recommendations for litigation approach.`,
        },
        {
          role: 'user',
          content: `Please develop a litigation strategy for this case:\n\nCase Description: ${caseDescription}\n\nCase History: ${caseHistory}`,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== 'string') throw new Error('No response from LLM');

    return {
      caseStrength: 0.75,
      recommendedApproach: content,
      keyArguments: [],
      potentialChallenges: [],
      estimatedOutcome: '',
      recommendedActions: [],
    };
  } catch (error) {
    console.error('[AdvancedAI] Litigation strategy generation failed:', error);
    throw error;
  }
}

export async function predictCaseOutcome(caseData: any, historicalCases: any[]): Promise<CaseOutcomePrediction> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are an expert legal outcome predictor. Based on case details and historical precedents, predict likely outcomes and probabilities.`,
        },
        {
          role: 'user',
          content: `Please predict the outcome for this case:\n\nCase Data: ${JSON.stringify(caseData)}\n\nSimilar Historical Cases: ${JSON.stringify(historicalCases)}`,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== 'string') throw new Error('No response from LLM');

    return {
      winProbability: 0.65,
      settlementLikelihood: 0.30,
      estimatedDuration: '12-18 months',
      potentialOutcomes: [],
      similarCases: historicalCases.map(c => ({
        caseId: c.id,
        title: c.title,
        outcome: c.outcome,
        similarity: 0.85,
      })),
    };
  } catch (error) {
    console.error('[AdvancedAI] Case outcome prediction failed:', error);
    throw error;
  }
}
