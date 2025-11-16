'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/tooltip';
import {
  KnowledgeBaseCard,
  EmptyState,
  NewKBDialog,
} from '@/components/knowledge-base';
import { EditKBDialog } from './edit-kb-dialog';
import { DeleteKBDialog } from './delete-kb-dialog';
import { WelcomeTour } from '@/components/onboarding/welcome-tour';
import type { KnowledgeBase } from '@/types/database';

interface KnowledgeBaseGridProps {
  initialKnowledgeBases: (KnowledgeBase & { file_count: number })[];
  userId: string;
}

export function KnowledgeBaseGrid({ initialKnowledgeBases, userId }: KnowledgeBaseGridProps) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedKB, setSelectedKB] = useState<(KnowledgeBase & { file_count?: number }) | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [runTour, setRunTour] = useState(false);

  // Check if user should see welcome tour (only on first visit with no KBs)
  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`welcomeTour_${userId}`);
    if (!hasSeenTour && initialKnowledgeBases.length === 0) {
      // Small delay to ensure page is fully rendered
      setTimeout(() => setRunTour(true), 500);
    }
  }, [userId, initialKnowledgeBases.length]);

  const handleTourComplete = () => {
    localStorage.setItem(`welcomeTour_${userId}`, 'true');
    setRunTour(false);
  };

  const handleCreateKB = async (name: string, description: string) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/knowledge-bases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create knowledge base');
      }

      // Refresh the page to show the new knowledge base
      router.refresh();
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditKB = async (id: string, name: string, description: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/knowledge-bases/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update knowledge base');
      }

      // Refresh the page to show the updated knowledge base
      router.refresh();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteKB = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/knowledge-bases/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete knowledge base');
      }

      // Refresh the page to remove the deleted knowledge base
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEdit = (kb: KnowledgeBase & { file_count?: number }) => {
    setSelectedKB(kb);
    setIsEditDialogOpen(true);
  };

  const handleOpenDelete = (kb: KnowledgeBase & { file_count?: number }) => {
    setSelectedKB(kb);
    setIsDeleteDialogOpen(true);
  };

  if (initialKnowledgeBases.length === 0) {
    return (
      <>
        <EmptyState onCreateClick={() => setIsCreateDialogOpen(true)} />
        <NewKBDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateKB}
          isLoading={isCreating}
        />
        <WelcomeTour run={runTour} onComplete={handleTourComplete} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Knowledge Bases</h2>
          <div className="text-gray-600 flex items-center gap-2">
            {initialKnowledgeBases.length} / 5 knowledge bases
            <InfoTooltip content="You can create up to 5 knowledge bases to organize different sets of documents" />
          </div>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={initialKnowledgeBases.length >= 5}
          data-tour="create-kb-button"
        >
          New Knowledge Base
        </Button>
      </div>

      {initialKnowledgeBases.length >= 5 && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-sm text-yellow-800">
            You've reached the maximum of 5 knowledge bases. Please delete one to create a new one.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initialKnowledgeBases.map((kb) => (
          <KnowledgeBaseCard
            key={kb.id}
            knowledgeBase={kb}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        ))}
      </div>

      <NewKBDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateKB}
        isLoading={isCreating}
      />

      <EditKBDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        knowledgeBase={selectedKB}
        onSubmit={handleEditKB}
        isLoading={isUpdating}
      />

      <DeleteKBDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        knowledgeBase={selectedKB}
        onConfirm={handleDeleteKB}
        isLoading={isDeleting}
      />
    </div>
  );
}
