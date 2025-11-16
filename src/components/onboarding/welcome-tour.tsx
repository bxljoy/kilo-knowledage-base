'use client';

import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface WelcomeTourProps {
  onComplete?: () => void;
  run?: boolean;
}

export function WelcomeTour({ onComplete, run = false }: WelcomeTourProps) {
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    setRunTour(run);
  }, [run]);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">
            Welcome to Kilo Knowledge Base! 🎉
          </h2>
          <p className="text-gray-700">
            Let's take a quick tour to help you get started with managing your documents
            and chatting with AI about them.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="create-kb-button"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">Create a Knowledge Base</h3>
          <p className="text-sm text-gray-700">
            Click here to create your first knowledge base. Think of it as a folder
            where you'll store related documents.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="usage-link"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">Monitor Your Usage</h3>
          <p className="text-sm text-gray-700">
            Keep track of your daily query limits, storage usage, and knowledge base
            count here.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">What's Next?</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>After creating a knowledge base, you can:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Upload PDF documents (up to 10MB each)</li>
              <li>Chat with AI about your documents</li>
              <li>Get instant answers from your content</li>
            </ul>
          </div>
          <p className="text-sm font-medium text-blue-600 mt-4">
            Ready to get started? Create your first knowledge base!
          </p>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      onComplete?.();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#2563eb',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          padding: 20,
        },
        tooltipContent: {
          padding: '8px 0',
        },
        buttonNext: {
          backgroundColor: '#2563eb',
          borderRadius: 6,
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 500,
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: 8,
          padding: '8px 16px',
          fontSize: 14,
        },
        buttonSkip: {
          color: '#9ca3af',
          fontSize: 14,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  );
}
