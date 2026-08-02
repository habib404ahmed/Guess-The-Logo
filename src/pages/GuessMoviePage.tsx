import { useState, useCallback, useEffect, useRef } from 'react';
import { movieDialogues } from '@/data/movieQuestions';
import type { MovieQuestion } from '@/types';
import { shuffle } from '@/utils';
import {
  getStoredMoviesAsync,
  getStoredSettings,
  type ExtendedMovieQuestion,
} from '@/utils/storage';
import { useCountdown } from '@/hooks/useCountdown';
import { useSound } from '@/hooks/useSound';
import {
  ChallengeLayout,
  ResultsScreen,
  RightControlPanel,
  StageMediaPlayer,
  type StageMediaPlayerRef,
} from '@/components/challenge';
import { StageCountdownModal } from '@/components/challenge/StageCountdownModal';

export function GuessMoviePage() {
  const [settings]  = useState(() => getStoredSettings());
  const [questions, setQuestions] = useState<MovieQuestion[]>([]);
  const [loading, setLoading]     = useState(true);

  // Load movies ONLY via await getStoredMoviesAsync() to ensure IndexedDB video Blobs are fully restored before rendering Question 1
  useEffect(() => {
    let isMounted = true;
    async function loadMovies() {
      const loaded = await getStoredMoviesAsync();
      if (isMounted && loaded && loaded.length > 0) {
        setQuestions(settings.shuffleMovies ? shuffle([...loaded]) : loaded);
      }
      if (isMounted) {
        setLoading(false);
      }
    }
    loadMovies();
    return () => {
      isMounted = false;
    };
  }, [settings.shuffleMovies]);

  const [index, setIndex]           = useState(0);
  const [score, setScore]           = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [linesShown, setLinesShown] = useState(0);

  // Sequential Stage States
  const [showCountdown, setShowCountdown]           = useState(true);
  const [autoPlayVideo, setAutoPlayVideo]           = useState(false);
  const [isControlsDisabled, setIsControlsDisabled] = useState(true);

  const mediaPlayerRef = useRef<StageMediaPlayerRef | null>(null);
  const { play, playRevealSequence, playNextSequence } = useSound();

  const currentQuestion = questions[index];
  const dialogue = currentQuestion ? movieDialogues[currentQuestion.id] : null;
  const allLines = dialogue?.lines ?? [
    `Watch & listen to dialogue clip #${index + 1}`,
    `Guess which movie this scene belongs to!`,
  ];

  const questionTime = settings.questionTimer || 25;

  // 🔍 Exact Required Console Logs Before Rendering Question 1
  useEffect(() => {
    if (currentQuestion) {
      const q = currentQuestion as ExtendedMovieQuestion;
      console.log("Current Movie", currentQuestion);
      console.log("dialogueSrc:", currentQuestion.dialogueSrc);
      console.log("videoUrl:", currentQuestion.videoUrl);
      console.log("videoBlob:", q.videoBlob || q._rawFile);
    }
  }, [currentQuestion]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const { seconds, start, reset } = useCountdown({
    duration: questionTime,
    onExpire: () => {},
  });

  // Question change setup
  useEffect(() => {
    setIsRevealed(false);
    setLinesShown(0);
    reset();

    if (!showCountdown) {
      let timer: ReturnType<typeof setTimeout>;

      const showLines = (i: number) => {
        if (i <= allLines.length) {
          setLinesShown(i);
          timer = setTimeout(() => showLines(i + 1), 600);
        }
      };

      const initialTimer = setTimeout(() => showLines(0), 200);
      return () => {
        clearTimeout(timer!);
        clearTimeout(initialTimer);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, showCountdown]);

  // ── Step-by-Step Callback: Fired ONLY AFTER Countdown & AI Voice Finish ──
  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);

    // Fade in video -> Wait 400ms -> Start video playback strictly AFTER countdown!
    setTimeout(() => {
      setAutoPlayVideo(true);
      if (mediaPlayerRef.current) {
        mediaPlayerRef.current.play();
      }
      setIsControlsDisabled(false); // Enable controls only after video starts!
      start();
    }, 400);
  }, [start]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleReplay = useCallback(() => {
    if (isControlsDisabled) return;
    play('click');
    if (mediaPlayerRef.current) {
      mediaPlayerRef.current.replay();
    }
  }, [isControlsDisabled, play]);

  const handleReveal = useCallback(() => {
    if (isRevealed || isControlsDisabled) return;
    // Pause video clip on reveal
    if (mediaPlayerRef.current) {
      mediaPlayerRef.current.pause();
    }
    setIsRevealed(true);
    playRevealSequence();
    reset();
    setScore((s) => s + 10);
  }, [isRevealed, isControlsDisabled, playRevealSequence, reset]);

  const handleNext = useCallback(() => {
    if (isControlsDisabled) return;

    if (mediaPlayerRef.current) {
      mediaPlayerRef.current.pause();
    }
    playNextSequence();

    if (index + 1 >= questions.length) {
      setIsComplete(true);
    } else {
      // Reset for next question with countdown
      setIsControlsDisabled(true);
      setAutoPlayVideo(false);
      setShowCountdown(true);
      setIndex((i) => i + 1);
    }
  }, [isControlsDisabled, index, playNextSequence, questions.length]);

  const handlePlayAgain = useCallback(() => {
    setIndex(0);
    setScore(0);
    setIsRevealed(false);
    setIsComplete(false);
    setIsControlsDisabled(true);
    setAutoPlayVideo(false);
    setShowCountdown(true);
  }, []);

  // ── Loading Screen (Do NOT render Question 1 until loading finishes) ──────

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#060918] text-[#f0f4ff] select-none">
        <div className="flex flex-col items-center gap-5 p-8 rounded-3xl backdrop-blur-2xl bg-white/5 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
          <div className="h-12 w-12 rounded-full border-4 border-purple-500/30 border-t-purple-400 animate-spin" />
          <span className="text-base font-extrabold text-purple-300 tracking-widest uppercase">
            Loading videos...
          </span>
        </div>
      </div>
    );
  }

  // ── Results Screen ─────────────────────────────────────────────────────────

  if (isComplete) {
    return (
      <ResultsScreen
        challengeType="movie"
        score={score}
        total={questions.length * 10}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  if (!currentQuestion) return null;

  const activeVideoUrl = currentQuestion.dialogueSrc || currentQuestion.videoUrl || '';

  return (
    <ChallengeLayout
      title="Guess the Movie"
      questionIndex={index + 1}
      totalQuestions={questions.length}
      score={score}
      seconds={seconds}
      totalSeconds={questionTime}
      accentColor="secondary"
    >
      {/* ── 3-2-1-GO Stage Countdown Modal Overlay (Voice intro ONLY on index === 0) ── */}
      {showCountdown && (
        <StageCountdownModal
          speakAiIntro={index === 0}
          onComplete={handleCountdownComplete}
        />
      )}

      {/* ── 2-COLUMN SPLIT-SCREEN LAYOUT ── */}
      <div className="w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-2">

        {/* ── LEFT COLUMN (65%): Stage Media Player (Video / Dialogue) ── */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <StageMediaPlayer
            ref={mediaPlayerRef}
            mediaSrc={activeVideoUrl}
            videoUrl={activeVideoUrl}
            fileName={currentQuestion.fileName}
            movieTitle={currentQuestion.movieTitle}
            genre={currentQuestion.genre}
            speaker={dialogue?.speaker}
            lines={allLines}
            linesShown={linesShown}
            autoPlayOnMount={autoPlayVideo}
          />
        </div>

        {/* ── RIGHT COLUMN (35%): Host Control & Answer Panel ── */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <RightControlPanel
            questionIndex={index + 1}
            totalQuestions={questions.length}
            categoryOrGenre={`GENRE: ${currentQuestion.genre.toUpperCase()}`}
            questionLabel="Which movie is this dialogue / scene from?"
            answerText={
              currentQuestion?.movieTitle && currentQuestion.movieTitle.trim() !== ''
                ? currentQuestion.movieTitle
                : 'No movie name configured'
            }
            dialogueText={currentQuestion?.dialogueText}
            optionalHint={currentQuestion?.optionalHint}
            isRevealed={isRevealed}
            onReveal={handleReveal}
            onNext={handleNext}
            onReplay={handleReplay}
            showReplayButton={true}
            isLastQuestion={index + 1 === questions.length}
            accentColor="secondary"
            isDisabled={isControlsDisabled}
          />
        </div>
      </div>
    </ChallengeLayout>
  );
}
