import { useState, useRef, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { ROLE_PLAYS } from "@shared/content";
import { toast } from "sonner";
import { PlayCircle, PauseCircle, Volume2 } from "lucide-react";
import AudioRecorder from "@/components/AudioRecorder";

export default function RolePlay() {
  const { skill } = useParams<{ skill: string }>();
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceAnalysis, setVoiceAnalysis] = useState<Record<string, any>>({});

  const analyzeVoice = trpc.voice.transcribeAndAnalyze.useMutation({
    onSuccess: (data, variables) => {
      setVoiceAnalysis(prev => ({ ...prev, [variables.question]: data }));
      setIsAnalyzing(false);
      toast.success("Voice analysis complete!");
    },
    onError: () => {
      setIsAnalyzing(false);
      toast.error("Failed to analyze voice");
    }
  });

  const rolePlay = ROLE_PLAYS.find(rp => rp.skill === skill);

  const submitAssessment = trpc.assessment.submit.useMutation({
    onSuccess: (data) => {
      toast.success("Assessment completed!");
      setLocation(`/results/${skill}`);
    },
    onError: () => {
      toast.error("Failed to submit assessment");
    }
  });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }
  }, []);

  if (!rolePlay) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Role-play not found</p>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
        setHasPlayedAudio(true);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const currentQ = rolePlay.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / rolePlay.questions.length) * 100;

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
  };

  const handleNext = () => {
    // For record type, check if voice analysis is complete
    if (currentQ.type === "record" && !voiceAnalysis[currentQ.question]) {
      toast.error("Please record and analyze your answer first");
      return;
    }
    
    // For other types, check if answer exists
    if (currentQ.type !== "record" && !answers[currentQ.id]) {
      toast.error("Please answer the question");
      return;
    }
    
    // Store voice analysis as answer for record type
    if (currentQ.type === "record" && voiceAnalysis[currentQ.question]) {
      setAnswers(prev => ({ ...prev, [currentQ.id]: voiceAnalysis[currentQ.question].transcript }));
    }

    if (currentQuestion < rolePlay.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAssessment.mutate({
        skill: skill || "",
        assessmentType: "entrance",
        answers
      });
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 py-8">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <img src="/assets/images/mascot_cat.png" alt="Mascot" className="w-16 h-16" />
            <div>
              <h1 className="text-3xl font-bold">{rolePlay.title}</h1>
              <p className="text-muted-foreground">{rolePlay.skill} Assessment</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Question {currentQuestion + 1} of {rolePlay.questions.length}
          </p>
        </div>

        {currentQuestion === 0 && (
          <Card className="mb-6 animate-fade-in">
            <CardHeader>
              <CardTitle>Scenario Context</CardTitle>
              <CardDescription>{rolePlay.context}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <img 
                  src={rolePlay.characterImage} 
                  alt="Character" 
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">🎧 Listen to the audio carefully before answering</p>
                  <Button 
                    onClick={handlePlayPause}
                    variant="outline"
                    className="gap-2"
                  >
                    {isPlaying ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                    {isPlaying ? "Pause Audio" : "Play Audio"}
                  </Button>
                </div>
              </div>
              <audio ref={audioRef} src={rolePlay.audioUrl} />
              {hasPlayedAudio && (
                <div className="text-center pt-2">
                  <p className="text-sm text-green-600 mb-2">✓ Audio played. You can replay it anytime or continue to questions.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.question}</CardTitle>
            <CardDescription>
              Testing: {currentQ.dimension} ({currentQ.points} point{currentQ.points > 1 ? 's' : ''})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQ.type === "single_choice" && currentQ.options && (
              <RadioGroup 
                value={answers[currentQ.id] || ""} 
                onValueChange={handleAnswer}
              >
                {currentQ.options.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted transition-colors">
                    <RadioGroupItem value={option} id={`${currentQ.id}-${idx}`} />
                    <Label htmlFor={`${currentQ.id}-${idx}`} className="cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQ.type === "multiple_choice" && currentQ.options && (
              <div className="space-y-2">
                {currentQ.options.map((option, idx) => {
                  const selected = answers[currentQ.id] || [];
                  return (
                    <div key={idx} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted transition-colors">
                      <Checkbox
                        id={`${currentQ.id}-${idx}`}
                        checked={selected.includes(option)}
                        onCheckedChange={(checked) => {
                          const newSelected = checked
                            ? [...selected, option]
                            : selected.filter((s: string) => s !== option);
                          handleAnswer(newSelected);
                        }}
                      />
                      <label htmlFor={`${currentQ.id}-${idx}`} className="cursor-pointer flex-1">
                        {option}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQ.type === "record" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  🎤 Record your spoken answer. AI will transcribe and analyze your response.
                </p>
                <AudioRecorder
                  disabled={isAnalyzing}
                  onRecordingComplete={async (audioBlob) => {
                    setIsAnalyzing(true);
                    // Convert blob to base64
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = () => {
                      const base64 = reader.result?.toString().split(',')[1] || '';
                      analyzeVoice.mutate({
                        audioBase64: base64,
                        question: currentQ.question,
                        context: rolePlay.context,
                        groundTruth: rolePlay.groundTruth
                      });
                    };
                  }}
                />
                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    Analyzing your response...
                  </div>
                )}
                {voiceAnalysis[currentQ.question] && (
                  <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
                    <CardContent className="pt-6 space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">📝 Transcript:</p>
                        <p className="text-sm text-gray-600 italic">"{voiceAnalysis[currentQ.question].transcript}"</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">🎯 Score: {voiceAnalysis[currentQ.question].score}/100</p>
                        <p className="text-sm text-gray-600">{voiceAnalysis[currentQ.question].feedback}</p>
                      </div>
                      {voiceAnalysis[currentQ.question].strengths?.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-green-700 mb-1">✅ Strengths:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {voiceAnalysis[currentQ.question].strengths.map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {voiceAnalysis[currentQ.question].improvements?.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-orange-700 mb-1">💡 Areas for Improvement:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {voiceAnalysis[currentQ.question].improvements.map((i: string, idx: number) => (
                              <li key={idx}>{i}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {currentQ.type === "arrange_sequence" && currentQ.options && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Select the options in the correct order (click to select)
                </p>
                <div className="grid gap-2">
                  {currentQ.options.map((option, idx) => {
                    const selected = answers[currentQ.id] || [];
                    const position = selected.indexOf(idx);
                    return (
                      <Button
                        key={idx}
                        variant={position >= 0 ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => {
                          if (position >= 0) {
                            handleAnswer(selected.filter((s: number) => s !== idx));
                          } else {
                            handleAnswer([...selected, idx]);
                          }
                        }}
                      >
                        {position >= 0 && <span className="mr-2 font-bold">{position + 1}.</span>}
                        {option}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              {currentQuestion > 0 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button 
                onClick={handleNext} 
                className="flex-1"
                disabled={submitAssessment.isPending}
              >
                {currentQuestion === rolePlay.questions.length - 1 
                  ? (submitAssessment.isPending ? "Submitting..." : "Submit Assessment")
                  : "Next Question"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
