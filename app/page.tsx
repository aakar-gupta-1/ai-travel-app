"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

interface Recommendation {
  name: string;
  description: string;
  image: string; // This is now the search term
}

const allMoods = ["Adventure", "Culture", "Relaxation", "Foodie", "Historical", "Nightlife"];
type LoadingState = 'idle' | 'recommendation' | 'itinerary';

export default function Home() {
  // Quiz State
  const [travelStyles, setTravelStyles] = useState<string[]>([]);
  const [numPeople, setNumPeople] = useState(2);
  const [budget, setBudget] = useState<number>(100000); 
  const [customPrompt, setCustomPrompt] = useState<string>("");
  
  // Results State
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  
  // ✨ NEW: State to hold the final, fetched image URL
  const [imageUrl, setImageUrl] = useState<string>('');
  
  const currentRecommendation = recommendations.length > 0 ? recommendations[recommendations.length - 1] : null;

  // ✨ NEW: useEffect hook to fetch the image when a new recommendation is received
  useEffect(() => {
    if (!currentRecommendation) return;

    const fetchImage = async () => {
      try {
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchTerm: currentRecommendation.image })
        });
        const data = await response.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        } else {
          // Set a default fallback image if something goes wrong
          setImageUrl('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1');
        }
      } catch (error) {
        console.error("Failed to fetch image", error);
        setImageUrl('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1');
      }
    };

    fetchImage();
  }, [currentRecommendation]);


  const handleMoodSelect = (mood: string) => {
    setTravelStyles(prev => prev.includes(mood) ? prev.filter(s => s !== mood) : [...prev, mood]);
  };
  
  const findRecommendation = async () => {
    if (travelStyles.length === 0) {
        setError("Please select at least one travel style.");
        return;
    }
    setError(null);
    setItinerary(null);
    setLoadingState('recommendation');

    const previousRecommendations = recommendations.map(r => r.name);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travelStyles, budget, customPrompt, numPeople, previousRecommendations }),
      });

      if (!response.ok) throw new Error('AI failed to find a recommendation. Please try again.');
      const data: Recommendation = await response.json();
      setRecommendations(prev => [...prev, data]);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unexpected error occurred.');
    } finally {
      setLoadingState('idle');
    }
  };

  const createItinerary = async () => {
    if (!currentRecommendation) return;
    setLoadingState('itinerary');
    setError(null);

    try {
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationName: currentRecommendation.name,
          travelStyles,
          budget,
          numPeople,
          customPrompt
        })
      });
      if (!response.ok) throw new Error('AI failed to create an itinerary. Please try again.');
      const data = await response.json();
      setItinerary(data.itinerary);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unexpected error occurred.');
    } finally {
      setLoadingState('idle');
    }
  }
  
  const resetQuiz = () => {
    setTravelStyles([]);
    setNumPeople(2);
    setBudget(100000);
    setCustomPrompt("");
    setRecommendations([]);
    setItinerary(null);
    setError(null);
    setLoadingState('idle');
    setImageUrl('');
  };

  const renderQuiz = () => (
    <>
      <h1 className="text-3xl font-bold mb-2">AI Travel Planner</h1>
      <p className="text-gray-600 mb-8">Answer a few questions to get your next trip planned.</p>
      
      <div className="mb-6 text-left">
        <label className="block text-xl font-semibold mb-4 text-center">1. What&apos;s the vibe?</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allMoods.map(mood => (
            <button key={mood} onClick={() => handleMoodSelect(mood)} className={`font-bold py-3 px-2 rounded-lg transition duration-300 text-sm sm:text-base ${travelStyles.includes(mood) ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
              {mood}
            </button>
          ))}
        </div>
      </div>

      {travelStyles.length > 0 && (
        <div className='animate-fade-in'>
          <div className="mb-6 text-left">
            <label className="block text-xl font-semibold mb-2 text-center">2. How many people?</label>
            <div className='flex items-center justify-center gap-4'>
              <button onClick={() => setNumPeople(p => Math.max(1, p - 1))} className='font-bold text-2xl bg-gray-200 rounded-full w-10 h-10'>-</button>
              <p className='text-center text-2xl font-bold text-purple-600 w-12'>{numPeople}</p>
              <button onClick={() => setNumPeople(p => p + 1)} className='font-bold text-2xl bg-gray-200 rounded-full w-10 h-10'>+</button>
            </div>
          </div>
          <div className="mb-6 text-left">
            <label className="block text-xl font-semibold mb-2 text-center">3. What&apos;s the total budget?</label>
            <p className='text-center text-2xl font-bold text-purple-600 mb-2'>₹ {budget.toLocaleString('en-IN')}</p>
            <input type="range" min="20000" max="1000000" step="10000" value={budget} onChange={e => setBudget(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
          </div>
          <div className="mb-8 text-left">
            <label className="block text-xl font-semibold mb-2 text-center">4. Any other requests?</label>
            <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder="e.g., must be coastal, pet-friendly..." className="w-full p-2 border border-gray-300 rounded-lg" rows={2}/>
          </div>
          <button onClick={findRecommendation} disabled={loadingState !== 'idle'} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg text-lg disabled:bg-gray-400">
            {loadingState === 'recommendation' ? 'Thinking...' : 'Find Destination'}
          </button>
        </div>
      )}
    </>
  );

  const renderResults = () => (
    <div className="animate-fade-in w-full">
      {itinerary ? (
        <div className='text-left'>
           <h1 className="text-3xl font-bold mb-4 text-blue-600 text-center">Itinerary for {currentRecommendation?.name}</h1>
           <div className='prose prose-sm sm:prose-base max-w-none bg-gray-50 p-4 rounded-lg'>
             <ReactMarkdown>{itinerary}</ReactMarkdown>
           </div>
           <button onClick={() => setItinerary(null)} className="w-full mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Back to Recommendation</button>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-2">Your AI recommendation is...</h2>
          <h1 className="text-4xl font-bold mb-4 text-blue-600">{currentRecommendation?.name}</h1>
          {/* 🔄 UPDATED: The Image component now uses the imageUrl state */}
          <div className="relative w-full h-60 rounded-lg overflow-hidden shadow-md mb-4 bg-gray-200 animate-pulse">
            {imageUrl && (
                <Image src={imageUrl} alt={currentRecommendation!.name} fill={true} style={{objectFit:"cover"}} priority />
            )}
          </div>
          <p className="text-gray-700 mb-6 text-left">{currentRecommendation?.description}</p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
             <button onClick={findRecommendation} disabled={loadingState !== 'idle'} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">
                {loadingState === 'recommendation' ? 'Thinking...' : 'Suggest Again'}
             </button>
             <button onClick={createItinerary} disabled={loadingState !== 'idle'} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">
                {loadingState === 'itinerary' ? 'Building...' : 'Create Itinerary'}
             </button>
          </div>
        </>
      )}
       <button onClick={resetQuiz} className="mt-6 text-gray-500 hover:text-gray-700">Start Over</button>
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-100 text-gray-800 font-sans">
      <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center transition-all duration-500">
        {error && (
            <div className="text-red-500 mb-4">
                <h2 className="text-2xl font-bold mb-2">Oops!</h2>
                <p>{error}</p>
                <button onClick={() => setError(null)} className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Try Again</button>
            </div>
        )}
        {!currentRecommendation ? renderQuiz() : renderResults()}
      </div>
    </main>
  );
}