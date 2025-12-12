'use client';

/**
 * Success Page
 * 
 * Shown after successful challenge submission
 */

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Challenge Submitted!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your coding session has been recorded and sent to the company.
            They will review your approach and get back to you soon.
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-gray-100 mb-8">
          <h2 className="text-2xl font-semibold mb-4">What happens next?</h2>
          <div className="space-y-4 text-left">
            <Step
              number={1}
              text="The company will receive an anonymized notification"
            />
            <Step
              number={2}
              text="They'll review your session replay to see your problem-solving approach"
            />
            <Step
              number={3}
              text="You'll be contacted directly if they want to proceed"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
          >
            Take Another Challenge
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:border-gray-300 hover:shadow-lg transition-all"
          >
            Back to Home
          </button>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Privacy Note</h3>
          <p className="text-sm text-blue-700">
            Your submission is completely anonymized. The company receives only your
            difficulty score, tech stack, and session replay - no personal information
            or resume details.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
        {number}
      </div>
      <p className="text-gray-700 pt-1">{text}</p>
    </div>
  );
}

