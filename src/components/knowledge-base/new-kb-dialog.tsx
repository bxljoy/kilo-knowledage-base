'use client';

import { useState } from 'react';
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

interface NewKBDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, description: string) => Promise<void>;
  isLoading?: boolean;
}

export function NewKBDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: NewKBDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      await onSubmit(name.trim(), description.trim());
      // Reset form on success
      setName('');
      setDescription('');
      setError('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create knowledge base');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      if (!newOpen) {
        // Reset form when closing
        setName('');
        setDescription('');
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
            <DialogTitle>Create New Knowledge Base</DialogTitle>
            <DialogDescription>
              Give your knowledge base a name and optional description.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
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
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
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
              {isLoading ? 'Creating...' : 'Create Knowledge Base'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
