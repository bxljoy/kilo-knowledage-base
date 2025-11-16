'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { KnowledgeBase } from '@/types/database';

interface EditKBDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledgeBase: KnowledgeBase | null;
  onSubmit: (id: string, name: string, description: string) => Promise<void>;
  isLoading?: boolean;
}

export function EditKBDialog({
  open,
  onOpenChange,
  knowledgeBase,
  onSubmit,
  isLoading = false,
}: EditKBDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Update form when knowledge base changes
  useEffect(() => {
    if (knowledgeBase) {
      setName(knowledgeBase.name);
      setDescription(knowledgeBase.description || '');
      setError('');
    }
  }, [knowledgeBase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!knowledgeBase) return;

    // Validate name
    if (!name.trim()) {
      setError('Please enter a name for your knowledge base');
      return;
    }

    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters long');
      return;
    }

    try {
      await onSubmit(knowledgeBase.id, name.trim(), description.trim());
      setError('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update knowledge base');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      if (!newOpen) {
        setError('');
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Knowledge Base</DialogTitle>
            <DialogDescription>
              Update your knowledge base name and description.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                placeholder="My Knowledge Base"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Input
                id="edit-description"
                placeholder="A brief description of this knowledge base"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
