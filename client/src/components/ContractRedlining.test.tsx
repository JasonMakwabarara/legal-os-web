import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContractRedlining } from './ContractRedlining';

describe('ContractRedlining', () => {
  const mockProps = {
    originalText: 'Original contract text with 30 days delivery',
    revisedText: 'Revised contract text with 45 days delivery',
    onAcceptChanges: vi.fn(),
  };

  it('renders the redlining component', () => {
    render(<ContractRedlining {...mockProps} />);
    expect(screen.getByText('Contract Redlining')).toBeTruthy();
  });

  it('displays changes detected', () => {
    render(<ContractRedlining {...mockProps} />);
    expect(screen.getByText(/changes detected/i)).toBeTruthy();
  });

  it('shows original and revised text', () => {
    render(<ContractRedlining {...mockProps} />);
    expect(screen.getByText('Original')).toBeTruthy();
    expect(screen.getByText('Revised')).toBeTruthy();
  });

  it('displays risk levels for changes', () => {
    render(<ContractRedlining {...mockProps} />);
    expect(screen.getByText(/High Risk/i)).toBeTruthy();
    expect(screen.getByText(/Medium Risk/i)).toBeTruthy();
  });

  it('accepts a change when accept button is clicked', async () => {
    render(<ContractRedlining {...mockProps} />);
    
    const acceptButtons = screen.getAllByText('Accept');
    fireEvent.click(acceptButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(/1 of/i)).toBeTruthy();
    });
  });

  it('rejects a change when reject button is clicked', async () => {
    render(<ContractRedlining {...mockProps} />);
    
    const acceptButtons = screen.getAllByText('Accept');
    fireEvent.click(acceptButtons[0]);
    
    await waitFor(() => {
      const rejectButtons = screen.getAllByText('Reject');
      fireEvent.click(rejectButtons[0]);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/0 of/i)).toBeTruthy();
    });
  });

  it('toggles suggestions display', () => {
    render(<ContractRedlining {...mockProps} />);
    
    const toggleButton = screen.getByText(/Show Suggestions/i);
    fireEvent.click(toggleButton);
    
    expect(screen.getByText(/Hide Suggestions/i)).toBeTruthy();
  });

  it('calls onAcceptChanges with accepted changes', async () => {
    render(<ContractRedlining {...mockProps} />);
    
    const acceptButtons = screen.getAllByText('Accept');
    fireEvent.click(acceptButtons[0]);
    
    await waitFor(() => {
      const submitButton = screen.getByText(/Accept 1 Changes/i);
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(mockProps.onAcceptChanges).toHaveBeenCalled();
    });
  });

  it('displays change details when clicked', () => {
    render(<ContractRedlining {...mockProps} />);
    
    const changeCard = screen.getByText(/MODIFICATION/i);
    fireEvent.click(changeCard);
    
    expect(changeCard.closest('div')).toBeTruthy();
  });

  it('disables submit button when no changes accepted', () => {
    render(<ContractRedlining {...mockProps} />);
    
    const submitButton = screen.getByText(/Accept 0 Changes/i) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('shows AI suggestions for changes', () => {
    render(<ContractRedlining {...mockProps} />);
    
    expect(screen.getByText(/💡/)).toBeTruthy();
  });
});
