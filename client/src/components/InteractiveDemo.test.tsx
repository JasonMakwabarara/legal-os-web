import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InteractiveDemo from './InteractiveDemo';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('InteractiveDemo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the demo component', () => {
    render(<InteractiveDemo />);
    expect(screen.getByText('See Legal OS in Action')).toBeTruthy();
  });

  it('displays the correct heading and description', () => {
    render(<InteractiveDemo />);
    expect(screen.getByText('See Legal OS in Action')).toBeTruthy();
    expect(
      screen.getByText(/Watch how Legal OS analyzes contracts, detects risks/)
    ).toBeTruthy();
  });

  it('renders all demo steps', () => {
    render(<InteractiveDemo />);
    expect(screen.getByText('Upload Contract')).toBeTruthy();
    expect(screen.getByText('AI Analysis')).toBeTruthy();
    expect(screen.getByText('Risk Detection')).toBeTruthy();
    expect(screen.getByText('Real-Time Collaboration')).toBeTruthy();
    expect(screen.getByText('Actionable Insights')).toBeTruthy();
  });

  it('renders play and reset buttons', () => {
    render(<InteractiveDemo />);
    expect(screen.getByText('Play Demo')).toBeTruthy();
    expect(screen.getByText('Reset')).toBeTruthy();
  });

  it('displays step counter', () => {
    render(<InteractiveDemo />);
    expect(screen.getByText('Step 1 of 5')).toBeTruthy();
  });

  it('shows initial upload step content', () => {
    render(<InteractiveDemo />);
    expect(screen.getByText('Drag & Drop Contract')).toBeTruthy();
    expect(screen.getByText('sample_contract.pdf (2.4 MB)')).toBeTruthy();
  });

  it('renders CTA button', () => {
    render(<InteractiveDemo />);
    const ctaButton = screen.getByRole('button', { name: /Start Your Free Trial/ });
    expect(ctaButton).toBeTruthy();
  });

  it('handles step click navigation', () => {
    render(<InteractiveDemo />);
    const aiAnalysisStep = screen.getByText('AI Analysis').closest('button');
    fireEvent.click(aiAnalysisStep!);
    expect(screen.getByText('Step 2 of 5')).toBeTruthy();
  });

  it('resets to first step when reset button is clicked', () => {
    render(<InteractiveDemo />);
    const aiAnalysisStep = screen.getByText('AI Analysis').closest('button');
    fireEvent.click(aiAnalysisStep!);
    expect(screen.getByText('Step 2 of 5')).toBeTruthy();

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    expect(screen.getByText('Step 1 of 5')).toBeTruthy();
  });

  it('renders all feature descriptions', () => {
    render(<InteractiveDemo />);
    expect(
      screen.getByText('Drag and drop your contract document for instant analysis')
    ).toBeTruthy();
    expect(
      screen.getByText('Advanced LLM analyzes contract terms, clauses, and risks in real-time')
    ).toBeTruthy();
    expect(
      screen.getByText('Identifies high-risk clauses and potential legal exposure')
    ).toBeTruthy();
    expect(
      screen.getByText('Invite team members to review and edit simultaneously')
    ).toBeTruthy();
    expect(
      screen.getByText('Get AI-powered recommendations and suggested revisions')
    ).toBeTruthy();
  });

  it('displays demo action text for each step', () => {
    render(<InteractiveDemo />);
    expect(screen.getByText('Uploading sample_contract.pdf...')).toBeTruthy();
  });

  it('shows main section heading', () => {
    render(<InteractiveDemo />);
    const mainHeading = screen.getByText('See Legal OS in Action');
    expect(mainHeading).toBeTruthy();
  });

  it('has accessible button labels', () => {
    render(<InteractiveDemo />);
    expect(screen.getByRole('button', { name: /Play Demo/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Reset/ })).toBeTruthy();
  });

  it('renders ready to transform message', () => {
    render(<InteractiveDemo />);
    expect(screen.getByText('Ready to transform your legal practice?')).toBeTruthy();
  });

  it('contains all step descriptions', () => {
    render(<InteractiveDemo />);
    const descriptions = [
      'Drag and drop your contract document for instant analysis',
      'Advanced LLM analyzes contract terms, clauses, and risks in real-time',
      'Identifies high-risk clauses and potential legal exposure',
      'Invite team members to review and edit simultaneously',
      'Get AI-powered recommendations and suggested revisions',
    ];
    
    descriptions.forEach(desc => {
      expect(screen.getByText(desc)).toBeTruthy();
    });
  });
});
