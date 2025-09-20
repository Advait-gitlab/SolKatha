import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { generateStory, getMultiModalAssets } from '../services/storyGenerator';

const StoryViewer = () => {
  const [input, setInput] = useState('');
  const [story, setStory] = useState('');
  const [assets, setAssets] = useState({ imageUrl: '', audioUrl: '', artPrompt: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const initialInput = location.state?.input || 'general stress'; // Use chat input or default

  const handleGenerate = async (customInput = input) => {
    if (!customInput.trim()) {
      setError('Please enter a challenge.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const generatedStory = await generateStory(customInput);
      const generatedAssets = getMultiModalAssets(customInput);
      setStory(generatedStory);
      setAssets(generatedAssets);
    } catch (err) {
      setError('Failed to generate story. Check API key in .env.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setInput(initialInput); // Set initial input from chat
    handleGenerate(initialInput); // Auto-generate on load
  }, [initialInput]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-purple-900 to-teal-500 text-white p-4">
      <h1 className="text-2xl mb-4">Krishna's Guidance</h1>
      <input
        type="text"
        placeholder="Enter your challenge (e.g., exam stress)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
        className="p-2 mb-4 border rounded-lg w-1/2 text-center bg-white bg-opacity-80"
        disabled={isLoading}
      />
      {isLoading && <p className="mb-4">Krishna is weaving your tale...</p>}
      {error && <p className="mb-4 text-red-500">{error}</p>}
      {story && (
        <div className="mb-4 p-4 bg-gold-200 text-purple-900 rounded-lg max-w-md">
          {story}
        </div>
      )}
      {assets.imageUrl && (
        <img src={assets.imageUrl} alt="Story Scene" className="mb-4 rounded-lg" />
      )}
      {assets.audioUrl && (
        <audio controls src={assets.audioUrl} className="mb-4">
          Your browser does not support the audio element.
        </audio>
      )}
      {assets.artPrompt && (
        <p className="mb-4 italic">Art Prompt: {assets.artPrompt}</p>
      )}
    </div>
  );
};

export default StoryViewer;