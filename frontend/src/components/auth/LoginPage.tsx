
import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { OAuthLogin } from './OAuthLogin';

export const LoginPage: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<'form' | 'oauth'>('form');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Medical Imaging Assistant</h2>
            <p className="text-sm text-gray-600 mt-2">Educational Use Only</p>
          </div>

          {authMethod === 'form' ? (
            <LoginForm onSwitchToOAuth={() => setAuthMethod('oauth')} />
          ) : (
            <OAuthLogin onSwitchToForm={() => setAuthMethod('form')} />
          )}

          <div className="text-center text-xs text-gray-500 border-t pt-4">
            <p>This application is for educational purposes only.</p>
            <p>Not intended for actual medical diagnosis or treatment.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
