import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { QUOTA_LIMITS } from '@/lib/usage-utils';

export default async function LandingPage() {
  // Check if user is already logged in
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (error) {
    // No valid session - this is expected for public landing page
    // Just continue to show the landing page
  }

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="font-display text-xl font-bold text-white">
                Kilo Knowledge Base
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/bxljoy/kilo-knowledage-base"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="GitHub Repository"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all h-11 px-6 py-2.5 border border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700 hover:border-slate-500"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-6xl sm:text-7xl font-bold text-white mb-6 leading-tight">
              Chat with Your
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                {' '}Documents{' '}
              </span>
              Using AI
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              Upload your PDFs and documents, then get instant AI-powered answers from your content.
              Build your personal knowledge base and unlock insights faster than ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                  Get Started Free
                </Button>
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-medium transition-all h-12 px-8 py-6 border border-slate-700 text-white hover:bg-slate-800"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-400">
              Powerful features to manage and interact with your documents
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Easy File Upload
              </h3>
              <p className="text-slate-400">
                Upload PDF documents up to 10MB. Support for various document formats including Word, text files, and code.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                AI-Powered Chat
              </h3>
              <p className="text-slate-400">
                Ask questions and get instant answers from your documents using Google's Gemini 2.5 Flash model.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Organized Knowledge
              </h3>
              <p className="text-slate-400">
                Create up to {QUOTA_LIMITS.MAX_KNOWLEDGE_BASES} knowledge bases to organize different topics, projects, or subjects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-400">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 border-2 border-blue-500 rounded-full text-2xl font-bold text-blue-500 mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Create a Knowledge Base
              </h3>
              <p className="text-slate-400">
                Sign in with Google and create your first knowledge base to organize your documents.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 border-2 border-blue-500 rounded-full text-2xl font-bold text-blue-500 mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Upload Your Documents
              </h3>
              <p className="text-slate-400">
                Upload up to {QUOTA_LIMITS.FILES_PER_KNOWLEDGE_BASE} files per knowledge base. PDFs, Word docs, and code files supported.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 border-2 border-blue-500 rounded-full text-2xl font-bold text-blue-500 mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Start Chatting
              </h3>
              <p className="text-slate-400">
                Ask questions and get AI-powered answers instantly from your uploaded documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Limits Section */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Free Tier Limits
            </h2>
            <p className="text-lg text-slate-400">
              Start using Kilo for free with generous limits
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">
                    {QUOTA_LIMITS.DAILY_QUERIES} Daily Queries
                  </h4>
                  <p className="text-sm text-slate-400">
                    Ask up to {QUOTA_LIMITS.DAILY_QUERIES} questions per day with AI
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">
                    {QUOTA_LIMITS.MAX_KNOWLEDGE_BASES} Knowledge Bases
                  </h4>
                  <p className="text-sm text-slate-400">
                    Organize content into {QUOTA_LIMITS.MAX_KNOWLEDGE_BASES} different knowledge bases
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">
                    {QUOTA_LIMITS.FILES_PER_KNOWLEDGE_BASE} Files per KB
                  </h4>
                  <p className="text-sm text-slate-400">
                    Upload up to {QUOTA_LIMITS.FILES_PER_KNOWLEDGE_BASE} files in each knowledge base
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">
                    {QUOTA_LIMITS.MAX_STORAGE_MB}MB Storage
                  </h4>
                  <p className="text-sm text-slate-400">
                    Store up to {QUOTA_LIMITS.MAX_STORAGE_MB}MB of documents ({QUOTA_LIMITS.MAX_FILE_SIZE_MB}MB per file)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-12">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Sign in with Google and start building your knowledge base today
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="font-display text-lg font-bold text-white">
                Kilo Knowledge Base
              </span>
            </div>
            <div className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Kilo Knowledge Base. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
