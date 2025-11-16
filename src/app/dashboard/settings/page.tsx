import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's knowledge bases count
  const { count: knowledgeBasesCount } = await supabase
    .from('knowledge_bases')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Get user's files count
  const { count: filesCount } = await supabase
    .from('files')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Format account creation date
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <Separator />

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your account details and authentication information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 text-sm font-medium text-gray-500">
                Email
              </div>
              <div className="col-span-2 text-sm">{user.email}</div>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 text-sm font-medium text-gray-500">
                Account Created
              </div>
              <div className="col-span-2 text-sm">{createdAt}</div>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 text-sm font-medium text-gray-500">
                User ID
              </div>
              <div className="col-span-2 text-sm font-mono text-xs break-all">
                {user.id}
              </div>
            </div>

            {user.user_metadata?.full_name && (
              <>
                <Separator />
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 text-sm font-medium text-gray-500">
                    Full Name
                  </div>
                  <div className="col-span-2 text-sm">
                    {user.user_metadata.full_name}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>
              Overview of your knowledge bases and file storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col space-y-2">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">
                    {knowledgeBasesCount || 0}
                  </span>
                  <span className="text-sm text-gray-500 pb-1">
                    knowledge bases
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Total knowledge bases created
                </p>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">
                    {filesCount || 0}
                  </span>
                  <span className="text-sm text-gray-500 pb-1">files</span>
                </div>
                <p className="text-xs text-gray-500">
                  Total files uploaded across all knowledge bases
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>
              Manage your account settings and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                Data Management
              </h3>
              <p className="text-sm text-yellow-700">
                To delete your account or export your data, please contact
                support at support@kiloknowledgebase.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
