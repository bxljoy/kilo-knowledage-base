'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { KnowledgeBase } from '@/types/database';

interface KnowledgeBaseCardProps {
  knowledgeBase: KnowledgeBase & {
    file_count?: number;
  };
  onEdit?: (kb: KnowledgeBase & { file_count?: number }) => void;
  onDelete?: (kb: KnowledgeBase & { file_count?: number }) => void;
}

export function KnowledgeBaseCard({ knowledgeBase, onEdit, onDelete }: KnowledgeBaseCardProps) {
  const updatedAt = new Date(knowledgeBase.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(knowledgeBase);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(knowledgeBase);
  };

  return (
    <div className="relative group">
      <Link href={`/dashboard/knowledge-bases/${knowledgeBase.id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-xl pr-8">{knowledgeBase.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            {knowledgeBase.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {knowledgeBase.description}
              </p>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{knowledgeBase.file_count || 0} files</span>
              <span>Updated {updatedAt}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
