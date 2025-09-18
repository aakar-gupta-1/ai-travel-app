"use client";

import { useState } from 'react';
import Image from 'next/image';

interface Recommendation {
  name: string;
  description: string;
  image: string;
}

export default function Home() {
  const [travelStyle, setTravelStyle] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const findRecommendation = async () => {
    if (!travelStyle || !budget) return;
    
    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travelStyle, budget }),
      });

      if (!response.ok) throw new Error('Something went wrong. Please try again.');
      const data: Recommendation = await response.json();
      setRecommendation(data);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch recommendation.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetQuiz = () => {
    setTravelStyle(null);
    setBudget(null);
    setRecommendation(null);
    setError(null);
    setIsLoading(false);
  };

  const getImageUrl = (searchTerm: string) => `https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=800&auto=format&fit=crop&q=60=${encodeURIComponent(searchTerm)}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-100 text-gray-800 font-sans">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center transition-all duration-500">
        
        {!recommendation && !isLoading && !error && (
          <>
            <h1 className="text-3xl font-bold mb-2">Find Your Next Adventure</h1>
            <p className="text-gray-600 mb-8">Let AI find the perfect trip for you.</p>
            
            {!travelStyle ? (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">What's your travel style?</h2>
                <div className="flex justify-center gap-4">
                  <button onClick={() => setTravelStyle('adventure')} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">Adventure</button>
                  <button onClick={() => setTravelStyle('culture')} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">Culture</button>
                </div>
              </div>
            ) : null}
            
            {travelStyle && !budget ? (
               <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">What's your budget?</h2>
                <div className="flex flex-col gap-4">
                  <button onClick={() => setBudget('low')} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-300">Low</button>
                  <button onClick={() => setBudget('medium')} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-300">Medium</button>
                  <button onClick={() => setBudget('high')} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition duration-300">High</button>
                </div>
              </div>
            ) : null}

            {travelStyle && budget && (
              <button onClick={findRecommendation} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-300">
                Get My AI Recommendation
              </button>
            )}
          </>
        )}

        {isLoading && (
          <div className="animate-pulse">
            <h2 className="text-2xl font-semibold text-gray-600">Our AI is thinking...</h2>
          </div>
        )}

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
            <p className="text-gray-700 mb-6">{recommendation.description}</p>
            <button onClick={() => alert('Booking system coming soon!')} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg mb-4 transition duration-300">Book Now</button>
            <button onClick={resetQuiz} className="text-gray-500 hover:text-gray-700">Start Over</button>
          </div>
        )}
      </div>
    </main>
  );
}