import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { ACTIVE_LISTENING_SCENARIO } from "../../../shared/active_listening_scenario";
import type { ScenarioBranching as ScenarioBranchingType, ScenarioNode, ScenarioChoice } from "../../../shared/content";

export default function ScenarioBranching() {
  const { skill } = useParams<{ skill: string }>();
  const [, setLocation] = useLocation();

  // Get scenario based on skill
  const scenario: ScenarioBranchingType = ACTIVE_LISTENING_SCENARIO; // For now, only Active Listening

  const [currentNodeId, setCurrentNodeId] = useState<string>(scenario.startNodeId);
  const [userChoices, setUserChoices] = useState<string[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const currentNode = scenario.nodes.find(node => node.id === currentNodeId);

  if (!currentNode) {
    return <div>Error: Node not found</div>;
  }

  const handleChoice = (choice: ScenarioChoice) => {
    // Record the choice
    setUserChoices([...userChoices, choice.id]);

    // Show feedback briefly
    // TODO: Add feedback UI

    // Move to next node or show analysis
    if (choice.nextNodeId) {
      setTimeout(() => {
        setCurrentNodeId(choice.nextNodeId!);
      }, 1500);
    } else {
      // End of scenario
      setTimeout(() => {
        setShowAnalysis(true);
      }, 1500);
    }
  };

  const analysis = scenario.getAnalysis(userChoices);

  if (showAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Scenario Complete!</h1>
            
            {/* Final outcome */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <p className="text-gray-700 whitespace-pre-line">{currentNode.text}</p>
            </div>

            {/* Analysis */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Performance Analysis</h2>
            
            {analysis.weakKeypoints.length === 0 ? (
              <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6">
                <h3 className="text-xl font-semibold text-green-800 mb-2">🎉 Perfect Score!</h3>
                <p className="text-green-700">You demonstrated excellent active listening skills throughout the scenario. All your choices showed strong understanding of the concepts.</p>
              </div>
            ) : (
              <>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6">
                  <h3 className="text-xl font-semibold text-yellow-800 mb-2">Areas for Improvement</h3>
                  <p className="text-yellow-700 mb-4">Based on your choices, here are some areas where you can strengthen your skills:</p>
                  <ul className="list-disc list-inside text-yellow-700 space-y-2">
                    {analysis.weakKeypoints.map(kp => (
                      <li key={kp}>{getKeypointTitle(kp)}</li>
                    ))}
                  </ul>
                </div>

                {/* Practice exercises */}
                <div className="bg-white border-2 border-purple-200 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-semibold text-purple-800 mb-4">📝 Practice Exercises</h3>
                  <p className="text-gray-600 mb-6">Complete these exercises to strengthen your weak areas:</p>
                  
                  {analysis.practiceExercises.map((exercise, index) => (
                    <div key={exercise.id} className="mb-8 last:mb-0">
                      <div className="bg-purple-50 rounded-lg p-6">
                        <p className="font-semibold text-gray-800 mb-4">
                          Question {index + 1}: {exercise.question}
                        </p>
                        <div className="space-y-3">
                          {exercise.options?.map((option, optIndex) => (
                            <label key={optIndex} className="flex items-start space-x-3 cursor-pointer hover:bg-purple-100 p-3 rounded-lg transition">
                              <input
                                type={exercise.type === "multiple_choice" ? "checkbox" : "radio"}
                                name={`exercise_${exercise.id}`}
                                className="mt-1"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                        <details className="mt-4">
                          <summary className="cursor-pointer text-purple-600 font-medium hover:text-purple-800">
                            Show Answer & Explanation
                          </summary>
                          <div className="mt-3 p-4 bg-white rounded-lg border border-purple-200">
                            <p className="font-semibold text-green-700 mb-2">
                              ✓ Correct Answer: {Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer.join(", ") : exercise.correctAnswer}
                            </p>
                            <p className="text-gray-600">{exercise.explanation}</p>
                          </div>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setCurrentNodeId(scenario.startNodeId);
                  setUserChoices([]);
                  setShowAnalysis(false);
                }}
                className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => setLocation('/learning-path')}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Back to Roadmap
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{scenario.title}</h1>
          <p className="text-gray-600 mb-4">{scenario.description}</p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">Context:</p>
            <p className="text-blue-700">{scenario.context}</p>
          </div>
        </div>

        {/* Current node */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Character */}
          {currentNode.speaker && currentNode.speaker !== "Narrator" && (
            <div className="flex items-start space-x-4 mb-6">
              {currentNode.characterImage && (
                <img
                  src={currentNode.characterImage}
                  alt={currentNode.speaker}
                  className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-600 mb-1">{currentNode.speaker}</p>
                {currentNode.audioUrl && (
                  <audio controls className="w-full mb-3">
                    <source src={currentNode.audioUrl} type="audio/mpeg" />
                  </audio>
                )}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-800 whitespace-pre-line">{currentNode.text}</p>
                </div>
              </div>
            </div>
          )}

          {currentNode.speaker === "Narrator" && (
            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 mb-6">
              <p className="text-gray-800 whitespace-pre-line">{currentNode.text}</p>
            </div>
          )}

          {/* Choices */}
          {currentNode.choices && currentNode.choices.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-600 mb-4">What do you do?</p>
              {currentNode.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  className="w-full text-left bg-white border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 rounded-xl p-4 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <p className="text-gray-800">{choice.text}</p>
                </button>
              ))}
            </div>
          )}

          {/* End node without choices */}
          {currentNode.type === "end" && (!currentNode.choices || currentNode.choices.length === 0) && (
            <div className="mt-6">
              <button
                onClick={() => setShowAnalysis(true)}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition"
              >
                View Analysis
              </button>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Choices made: {userChoices.length}
          </p>
        </div>
      </div>
    </div>
  );
}

function getKeypointTitle(keypointId: string): string {
  const titles: Record<string, string> = {
    "al_kp_1_1": "What is Active Listening? (Four Pillars, Hearing vs Listening, Mindset, Barriers)",
    "al_kp_1_2": "Why Active Listening Matters (Benefits, Costs, Leadership)",
    "al_kp_2_1": "Paraphrasing Techniques",
    "al_kp_2_2": "Asking Effective Questions"
  };
  return titles[keypointId] || keypointId;
}

