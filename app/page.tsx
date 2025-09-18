"use client";

import { useState } from 'react';
import Image from 'next/image';

interface Recommendation {
  name: string;
  description: string;
  image: string;
}

// ✨ NEW: Expanded list of available moods
const allMoods = ["Adventure", "Culture", "Relaxation", "Foodie", "Historical", "Nightlife"];

export default function Home() {
  // 🔄 UPDATED: 'travelStyles' is now an array to hold multiple selections
  const [travelStyles, setTravelStyles] = useState<string[]>([]);
  const [budget, setBudget] = useState<number>(75000); 
  const [customPrompt, setCustomPrompt] = useState<string>("");
  
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✨ NEW: Function to handle adding/removing moods from the state array
  const handleMoodSelect = (mood: string) => {
    setTravelStyles(prevStyles => 
      prevStyles.includes(mood)
        ? prevStyles.filter(s => s !== mood) // Remove mood if it's already there
        : [...prevStyles, mood] // Add mood if it's not
    );
  };
  
  const findRecommendation = async () => {
    // 🔄 UPDATED: Check if the array is not empty
    if (travelStyles.length === 0) {
        setError("Please select at least one travel style.");
        return;
    }
    setError(null);
    setIsLoading(true);
    setRecommendation(null);

    try {
      // 🔄 UPDATED: Send the array of styles to the API
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travelStyles, budget, customPrompt }),
      });

      if (!response.ok) throw new Error('Something went wrong. Please try again.');
      const data: Recommendation = await response.json();
      setRecommendation(data);

    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetQuiz = () => {
    setTravelStyles([]);
    setBudget(75000);
    setCustomPrompt("");
    setRecommendation(null);
    setError(null);
    setIsLoading(false);
  };

  const getImageUrl = (searchTerm: string) => `https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=800&auto=format&fit=crop&q=60=${encodeURIComponent(searchTerm)}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-100 text-gray-800 font-sans">
      <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 text-center transition-all duration-500">
        
        {!recommendation && !isLoading && !error && (
          <>
            <h1 className="text-3xl font-bold mb-2">Find Your Next Adventure</h1>
            <p className="text-gray-600 mb-8">Let AI find the perfect trip for you.</p>
            
            <div className="mb-6 text-left">
              <label className="block text-xl font-semibold mb-4 text-center">1. What&apos;s your vibe? <span className='text-gray-500 font-normal'>(Choose one or more)</span></label>
              {/* 🔄 UPDATED: Grid of mood buttons that can be multi-selected */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allMoods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => handleMoodSelect(mood)}
                    className={`font-bold py-3 px-2 rounded-lg transition duration-300 text-sm sm:text-base ${
                      travelStyles.includes(mood)
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Other inputs now appear only after at least one style is selected */}
            {travelStyles.length > 0 && (
              <div className='animate-fade-in'>
                <div className="mb-6 text-left">
                  <label htmlFor="budget" className="block text-xl font-semibold mb-2 text-center">2. What&apos;s your max budget?</label>
                  <p className='text-center text-2xl font-bold text-purple-600 mb-2'>₹ {budget.toLocaleString('en-IN')}</p>
                  <input id="budget" type="range" min="10000" max="500000" step="5000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                </div>

                <div className="mb-8 text-left">
                  <label htmlFor="customPrompt" className="block text-xl font-semibold mb-2 text-center">3. Any specific requests?</label>
                  <textarea id="customPrompt" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="e.g., somewhere in Europe, family-friendly..." className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" rows={3}/>
                </div>
                
                <button onClick={findRecommendation} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-300">
                  Get My AI Recommendation
                </button>
              </div>
            )}
          </>
        )}

        {isLoading && (<div className="animate-pulse"><h2 className="text-2xl font-semibold text-gray-600">Our AI is thinking...</h2></div>)}
        
        {error && (
            <div className="text-red-500">
                <h2 className="text-2xl font-bold mb-4">Oops!</h2>
                <p>{error}</p>
                <button onClick={resetQuiz} className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Try Again</button>
            </div>
        )}

        {recommendation && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-2">Your AI recommendation is...</h2>
            <h1 className="text-4xl font-bold mb-4 text-blue-600">{recommendation.name}</h1>
            <div className="relative w-full h-60 rounded-lg overflow-hidden shadow-md mb-4">
                <Image src={getImageUrl(recommendation.image)} alt={recommendation.name} fill={true} style={{objectFit:"cover"}} priority />
            </div>
            <p className="text-gray-700 mb-6 text-left">{recommendation.description}</p>
            <button onClick={() => alert('Booking system coming soon!')} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg mb-4 transition duration-300">Book Now</button>
            <button onClick={resetQuiz} className="text-gray-500 hover:text-gray-700">Start Over</button>
          </div>
        )}
      </div>
    </main>
  );
}