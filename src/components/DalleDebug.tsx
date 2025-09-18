import React, { useEffect, useState } from 'react';

const DalleDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check environment variables
    const envInfo = {
      'import.meta.env exists': typeof import.meta !== 'undefined' && !!import.meta.env,
      'VITE_OPENAI_API_KEY': import.meta.env?.VITE_OPENAI_API_KEY ?
        `${import.meta.env.VITE_OPENAI_API_KEY.substring(0, 10)}...` : 'NOT SET',
      'process.env exists': typeof process !== 'undefined' && !!process.env,
      'REACT_APP_OPENAI_API_KEY': process.env?.REACT_APP_OPENAI_API_KEY ?
        `${process.env.REACT_APP_OPENAI_API_KEY.substring(0, 10)}...` : 'NOT SET',
    };
    setDebugInfo(envInfo);
  }, []);

  const testDalle = async () => {
    setLoading(true);
    setTestResult('Testing DALL-E API...');

    try {
      // Get the API key
      const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) ||
                     (typeof process !== 'undefined' && process.env?.REACT_APP_OPENAI_API_KEY) ||
                     '';

      if (!apiKey) {
        setTestResult('❌ No API key found in environment variables');
        setLoading(false);
        return;
      }

      setTestResult(`🔑 API key found: ${apiKey.substring(0, 10)}...`);

      // Test DALL-E API
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-2',
          prompt: 'A simple test image of a flower',
          n: 1,
          size: '256x256'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ DALL-E API working! Image URL: ${data.data[0].url}`);
      } else {
        const error = await response.text();
        setTestResult(`❌ DALL-E API error: ${response.status} - ${error}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">🔍 DALL-E Debug Info</h2>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Environment Variables:</h3>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <button
        onClick={testDalle}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test DALL-E API'}
      </button>

      {testResult && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default DalleDebug;