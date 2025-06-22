"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Markdown from "react-markdown";

type TabType = 'pitch' | 'report' | 'slides';

export default function RepositoryPage() {
  const router = useRouter();
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPitchGeneration, setShowPitchGeneration] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPitch, setShowPitch] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('pitch');
  const [pitchData, setPitchData] = useState<{ data: { pitch: string; generatedAt?: string } } | null>(null);
  const [reportData, setReportData] = useState<{ data: { report: string } } | null>(null);
  const [slidesData, setSlidesData] = useState<{  slides: string[] } | null>(null);
  const [repositoryInfo, setRepositoryInfo] = useState<{ username: string; repository: string; url: string } | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Extract username and repository from GitHub URL
      const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
      const match = repositoryUrl.match(urlPattern);

      if (!match) {
        setError("Please enter a valid GitHub repository URL");
        setIsLoading(false);
        return;
      }

      const [, username, repository] = match;
      
      // Set repository info and show pitch generation
      setRepositoryInfo({ username, repository, url: repositoryUrl });
      setShowPitchGeneration(true);
      setIsLoading(false);
      
      // Start generating pitch automatically
      await generatePitch({ username, repository, url: repositoryUrl });
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const generatePitch = async (repoInfo: { username: string; repository: string; url: string }) => {
    setIsProcessing(true);
    setShowPitch(false);
    setShowReport(false);
    setShowPreview(false);
    
    try {
      // Start the generation process
      const generationResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryUrl: repoInfo.url,
          username: repoInfo.username,
          repository: repoInfo.repository
        })
      });

      if (generationResponse.ok) {
        const generationData = await generationResponse.json();
        const { gen_token } = generationData.data;
        console.log(generationData);

        fetch(`http://localhost:8000/get-elevator-pitch?gen_token=${gen_token}`, {
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setShowPitch(true);
                setActiveTab('pitch');
                setPitchData({
                    data: {
                        pitch: data.elevator_pitch,
                    }
                });
            });

        fetch(`http://localhost:8000/get-slides?gen_token=${gen_token}`, {
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setShowPreview(true);
                setSlidesData({
                    slides: data.slides
                });
            });

        fetch(`http://localhost:8000/get-market-research-report?gen_token=${gen_token}`, {
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setShowReport(true);
                setActiveTab('report');
                setReportData({
                    data: {
                        report: data.market_research_report
                    }
                });
            });
      } else {
        console.error('Failed to start generation process:', generationResponse.statusText);
      }
    } catch (error) {
      console.error('Error in generatePitch:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    if (!repositoryInfo) {
      return null;
    }

    switch (activeTab) {
      case 'pitch':
        return (activeTab === 'pitch') ? (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg shadow-blue-500/25">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Your Elevator Pitch
              </h2>
              <p className="text-gray-400">Generated by our AI backend</p>
            </div>

            {/* Pitch Container */}
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl p-8 border border-blue-500/20 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <h3 className="text-xl font-semibold text-white">AI-Generated Pitch</h3>
                </div>
                <div className="text-sm text-gray-400">
                  Just now
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="text-lg text-gray-200 leading-relaxed">
                    {pitchData?.data?.pitch || (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-400">Generating your pitch...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pitch Stats */}
              {pitchData?.data?.pitch && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-2xl font-bold text-blue-400">{pitchData.data.pitch.split(' ').length}</div>
                    <div className="text-sm text-gray-400">Words</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-2xl font-bold text-purple-400">{pitchData.data.pitch.split('.').length - 1}</div>
                    <div className="text-sm text-gray-400">Sentences</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-2xl font-bold text-green-400">AI</div>
                    <div className="text-sm text-gray-400">Generated</div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => window.open(repositoryInfo.url, '_blank')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                <span>View Repository</span>
              </button>
              
              <button 
                onClick={() => {
                  setShowPitchGeneration(false);
                  setRepositoryInfo(null);
                  setPitchData(null);
                  setReportData(null);
                  setSlidesData(null);
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Generate New Pitch</span>
              </button>
            </div>
          </div>
        ) : null;

      case 'report':
        return (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-lg shadow-green-500/25">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Repository Report
              </h2>
              <p className="text-gray-400">Detailed analysis and insights</p>
            </div>

            {/* Report Container */}
            <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 rounded-2xl p-8 border border-green-500/20 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <h3 className="text-xl font-semibold text-white">AI-Generated Report</h3>
                </div>
                <div className="text-sm text-gray-400">
                  Just now
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="text-lg text-gray-200 leading-relaxed">
                    {reportData?.data?.report ? (
                      <div className="space-y-6">
                        <Markdown>
                            {reportData.data.report.replaceAll("```", "")}
                        </Markdown>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-400">Generating your report...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => window.open(repositoryInfo.url, '_blank')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                <span>View Repository</span>
              </button>
            </div>
          </div>
        );

      case 'slides':
        return showPreview ? (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-lg shadow-green-500/25">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{slidesData?.slides?.title || "Presentation Slides"}</h3>
              <p className="text-gray-400">Interactive slideshow preview</p>
            </div>

            {/* Slideshow Container */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] mb-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="ml-2 text-sm text-gray-600 font-medium">
                    Slide {currentSlideIndex + 1} of {slidesData?.slides?.length || 0}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              <div className="h-full bg-white">
                {slidesData?.slides?.[currentSlideIndex] ? (
                  <iframe 
                    style={{
                        width: "1280px",
                        height: "720px"
                    }}
                    srcDoc={slidesData?.slides?.[currentSlideIndex]}
                    className="w-full h-full border-0"
                    title={`Slide ${currentSlideIndex + 1}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-600">Loading slides...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Slideshow Controls */}
            {slidesData?.slides && slidesData.slides.length > 1 && (
              <div className="flex justify-center items-center space-x-4 mb-6">
                <button
                  onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                  disabled={currentSlideIndex === 0}
                  className="bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  <span>Previous</span>
                </button>

                <div className="flex space-x-2">
                  {slidesData.slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlideIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentSlideIndex 
                          ? 'bg-blue-500' 
                          : 'bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentSlideIndex(Math.min(slidesData.slides.length - 1, currentSlideIndex + 1))}
                  disabled={currentSlideIndex === slidesData.slides.length - 1}
                  className="bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => window.open(repositoryInfo.url, '_blank')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                <span>View Repository</span>
              </button>
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <Navbar />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-4xl">
          {!showPitchGeneration ? (
            <>
              {/* Header */}
              <div className="text-center mb-12 animate-fade-in">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg shadow-blue-500/25">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.237 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Create Your Pitch
                </h1>
                <p className="text-xl text-gray-300">
                  Enter a GitHub repository URL to generate an AI-powered elevator pitch
                </p>
              </div>

              {/* Form */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="repositoryUrl" className="block text-sm font-medium text-white mb-2">
                      GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      id="repositoryUrl"
                      value={repositoryUrl}
                      onChange={(e) => setRepositoryUrl(e.target.value)}
                      placeholder="https://github.com/username/repository"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <p className="mt-2 text-sm text-gray-400">
                      Enter the full GitHub repository URL (e.g., https://github.com/facebook/react)
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !repositoryUrl}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        <span>Generate Pitch</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Example Repositories */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Popular Examples</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: "React", url: "https://github.com/facebook/react", description: "UI library" },
                      { name: "Vue.js", url: "https://github.com/vuejs/vue", description: "Progressive framework" },
                      { name: "Next.js", url: "https://github.com/vercel/next.js", description: "React framework" },
                      { name: "TypeScript", url: "https://github.com/microsoft/TypeScript", description: "JavaScript superset" }
                    ].map((repo) => (
                      <button
                        key={repo.name}
                        onClick={() => setRepositoryUrl(repo.url)}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all duration-200 text-left"
                      >
                        <div className="font-medium text-white">{repo.name}</div>
                        <div className="text-sm text-gray-400">{repo.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Repository Header */}
              <div className="text-center mb-12 animate-fade-in">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-lg shadow-green-500/25">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.237 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {repositoryInfo?.repository}
                </h1>
                <p className="text-xl text-gray-300">
                  by <span className="text-blue-400 font-semibold">@{repositoryInfo?.username}</span>
                </p>
              </div>

              {/* Sub Navbar */}
              <div className="mb-8">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('pitch')}
                      className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                        activeTab === 'pitch'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                      </svg>
                      <span>Elevator Pitch</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('report')}
                      className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                        activeTab === 'report'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                      <span>Report</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('slides')}
                      className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                        activeTab === 'slides'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      <span>Slides</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="w-full">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
                  {/* Processing State */}
                  {isProcessing && (
                    <div className="text-center mb-8">
                      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-sm text-gray-400">Generating your pitch...</p>
                    </div>
                  )}

                  {/* Tab Content */}
                  {renderTabContent()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
