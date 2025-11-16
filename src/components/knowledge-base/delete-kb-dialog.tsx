'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { KnowledgeBase } from '@/types/database';

interface DeleteKBDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knowledgeBase: KnowledgeBase & { file_count?: number } | null;
  onConfirm: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function DeleteKBDialog({
  open,
  onOpenChange,
  knowledgeBase,
  onConfirm,
  isLoading = false,
}: DeleteKBDialogProps) {
  const handleConfirm = async () => {
    if (!knowledgeBase) return;

    try {
      await onConfirm(knowledgeBase.id);
      onOpenChange(false);
    } catch (err) {
      console.error('Error deleting knowledge base:', err);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Knowledge Base</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{knowledgeBase?.name}"?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <h4 className="text-sm font-semibold text-red-900 mb-2">
              Warning: This action cannot be undone
            </h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>All files ({knowledgeBase?.file_count || 0}) will be permanently deleted</li>
              <li>Chat history will be lost</li>
              <li>This knowledge base cannot be recovered</li>
            </ul>
          </div>
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
          <Button
            type="button"
            variant="default"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Deleting...' : 'Delete Knowledge Base'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
