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
import type { Database } from '@/types/database';

type File = Database['public']['Tables']['files']['Row'];

interface DeleteFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  onConfirm: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function DeleteFileDialog({
  open,
  onOpenChange,
  file,
  onConfirm,
  isLoading = false,
}: DeleteFileDialogProps) {
  const handleConfirm = async () => {
    if (!file) return;

    try {
      await onConfirm(file.id);
      onOpenChange(false);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete File</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{file?.filename}"?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <h4 className="text-sm font-semibold text-red-900 mb-2">
              Warning: This action cannot be undone
            </h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>File will be permanently deleted</li>
              <li>File size: {formatFileSize(file?.file_size || null)}</li>
              <li>Page count: {file?.page_count || 0} pages</li>
              <li>This file cannot be recovered</li>
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
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Deleting...' : 'Delete File'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
