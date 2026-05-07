import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CollaborativeEditor } from './CollaborativeEditor';

describe('CollaborativeEditor', () => {
  const mockProps = {
    documentId: 1,
    initialContent: 'Initial document content',
    onSave: vi.fn(),
  };

  it('renders the editor with initial content', () => {
    render(<CollaborativeEditor {...mockProps} />);
    const textarea = screen.getByPlaceholderText('Start typing your document...');
    expect(textarea).toHaveValue('Initial document content');
  });

  it('updates content when user types', () => {
    render(<CollaborativeEditor {...mockProps} />);
    const textarea = screen.getByPlaceholderText('Start typing your document...');
    
    fireEvent.change(textarea, { target: { value: 'Updated content' } });
    expect(textarea).toHaveValue('Updated content');
  });

  it('displays active collaborators', () => {
    render(<CollaborativeEditor {...mockProps} />);
    const element = screen.getByText(/active collaborators/i);
    expect(element).toBeTruthy();
  });

  it('shows comments button with count', () => {
    render(<CollaborativeEditor {...mockProps} />);
    const commentsButton = screen.getByText(/Comments/i);
    expect(commentsButton).toBeTruthy();
  });

  it('toggles comments panel when button is clicked', () => {
    render(<CollaborativeEditor {...mockProps} />);
    const commentsButton = screen.getByText(/Comments/i);
    
    fireEvent.click(commentsButton);
    expect(screen.getByPlaceholderText('Add a comment...')).toBeTruthy();
    
    fireEvent.click(commentsButton);
    expect(screen.queryByPlaceholderText('Add a comment...')).toBeNull();
  });

  it('adds a comment when form is submitted', async () => {
    render(<CollaborativeEditor {...mockProps} />);
    
    fireEvent.click(screen.getByText(/Comments/i));
    
    const lineInput = screen.getByPlaceholderText('Line number');
    const commentInput = screen.getByPlaceholderText('Add a comment...');
    const addButton = screen.getByText('Add Comment');
    
    fireEvent.change(lineInput, { target: { value: '5' } });
    fireEvent.change(commentInput, { target: { value: 'This clause needs review' } });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Line 5')).toBeTruthy();
      expect(screen.getByText('This clause needs review')).toBeTruthy();
    });
  });

  it('disables add comment button when form is incomplete', () => {
    render(<CollaborativeEditor {...mockProps} />);
    
    fireEvent.click(screen.getByText(/Comments/i));
    const addButton = screen.getByText('Add Comment') as HTMLButtonElement;
    
    expect(addButton.disabled).toBe(true);
  });

  it('calls onSave when save button is clicked', async () => {
    render(<CollaborativeEditor {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Start typing your document...');
    fireEvent.change(textarea, { target: { value: 'New content' } });
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockProps.onSave).toHaveBeenCalledWith('New content');
    });
  });

  it('displays active user cursors', () => {
    render(<CollaborativeEditor {...mockProps} />);
    const element = screen.getByText(/is at line/i);
    expect(element).toBeTruthy();
  });
});
