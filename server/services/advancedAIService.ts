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
          content: `You are an expert legal due diligence analyst. Analyze documents and provide comprehensive due diligence reports identifying risks and recommendations. Return a JSON object with findings.`,
        },
        {
          role: 'user',
          content: `Please perform due diligence analysis on this document in the context of: ${context}\n\nDocument:\n${documentText}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'due_diligence_report',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              riskAreas: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    area: { type: 'string' },
                    riskLevel: { type: 'string', enum: ['high', 'medium', 'low'] },
                    findings: { type: 'string' },
                    recommendations: { type: 'string' },
                  },
                  required: ['area', 'riskLevel', 'findings', 'recommendations'],
                },
              },
              overallRiskScore: { type: 'number', minimum: 0, maximum: 100 },
            },
            required: ['summary', 'riskAreas', 'overallRiskScore'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== 'string') throw new Error('No response from LLM');

    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary,
      riskAreas: parsed.riskAreas,
      overallRiskScore: parsed.overallRiskScore,
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
          content: `You are an expert litigation strategist. Analyze case details and provide strategic recommendations for litigation approach. Return a JSON object with strategy details.`,
        },
        {
          role: 'user',
          content: `Please develop a litigation strategy for this case:\n\nCase Description: ${caseDescription}\n\nCase History: ${caseHistory}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'litigation_strategy',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              caseStrength: { type: 'number', minimum: 0, maximum: 1 },
              recommendedApproach: { type: 'string' },
              keyArguments: { type: 'array', items: { type: 'string' } },
              potentialChallenges: { type: 'array', items: { type: 'string' } },
              estimatedOutcome: { type: 'string' },
              recommendedActions: { type: 'array', items: { type: 'string' } },
            },
            required: ['caseStrength', 'recommendedApproach', 'keyArguments', 'potentialChallenges', 'estimatedOutcome', 'recommendedActions'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== 'string') throw new Error('No response from LLM');

    const parsed = JSON.parse(content);
    return {
      caseStrength: parsed.caseStrength,
      recommendedApproach: parsed.recommendedApproach,
      keyArguments: parsed.keyArguments,
      potentialChallenges: parsed.potentialChallenges,
      estimatedOutcome: parsed.estimatedOutcome,
      recommendedActions: parsed.recommendedActions,
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
          content: `You are an expert legal outcome predictor. Based on case details and historical precedents, predict likely outcomes and probabilities. Return a JSON object with predictions.`,
        },
        {
          role: 'user',
          content: `Please predict the outcome for this case:\n\nCase Data: ${JSON.stringify(caseData)}\n\nSimilar Historical Cases: ${JSON.stringify(historicalCases)}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'case_outcome_prediction',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              winProbability: { type: 'number', minimum: 0, maximum: 1 },
              settlementLikelihood: { type: 'number', minimum: 0, maximum: 1 },
              estimatedDuration: { type: 'string' },
              potentialOutcomes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    outcome: { type: 'string' },
                    probability: { type: 'number', minimum: 0, maximum: 1 },
                    reasoning: { type: 'string' },
                  },
                  required: ['outcome', 'probability', 'reasoning'],
                },
              },
            },
            required: ['winProbability', 'settlementLikelihood', 'estimatedDuration', 'potentialOutcomes'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== 'string') throw new Error('No response from LLM');

    const parsed = JSON.parse(content);
    return {
      winProbability: parsed.winProbability,
      settlementLikelihood: parsed.settlementLikelihood,
      estimatedDuration: parsed.estimatedDuration,
      potentialOutcomes: parsed.potentialOutcomes,
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
