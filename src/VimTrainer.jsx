import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, CheckCircle, XCircle, Target, Keyboard } from 'lucide-react';

const VimTrainer = () => {
  const [currentExercise, setCurrentExercise] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [mode, setMode] = useState('normal');
  const [feedback, setFeedback] = useState('');
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [waitingForSecondG, setWaitingForSecondG] = useState(false);
  const [difficulty, setDifficulty] = useState('beginner');
  const [targetRow, setTargetRow] = useState(null);
  const [targetCol, setTargetCol] = useState(null);
  const [startingRow, setStartingRow] = useState(null);
  const [startingCol, setStartingCol] = useState(null);
  
  // Text editor state
  const [cursorRow, setCursorRow] = useState(0);
  const [cursorCol, setCursorCol] = useState(0);
  const [textContent, setTextContent] = useState([]);
  const editorRef = useRef(null);

  const sampleTexts = [
    [
      "The quick brown fox jumps over the lazy dog.",
      "Pack my box with five dozen liquor jugs.",
      "How vexingly quick daft zebras jump!",
      "Waltz, bad nymph, for quick jigs vex.",
      "Sphinx of black quartz, judge my vow."
    ],
    [
      "function fibonacci(n) {",
      "  if (n <= 1) return n;",
      "  return fibonacci(n-1) + fibonacci(n-2);",
      "}",
      "console.log(fibonacci(10));"
    ],
    [
      "To be or not to be, that is the question:",
      "Whether 'tis nobler in the mind to suffer",
      "The slings and arrows of outrageous fortune,",
      "Or to take arms against a sea of troubles,",
      "And by opposing end them."
    ],
    [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse.",
      "Excepteur sint occaecat cupidatat non proident sunt in culpa."
    ]
  ];

  const isWordChar = (char) => {
    return /[a-zA-Z0-9_]/.test(char);
  };

  const isWhitespace = (char) => {
    return /\s/.test(char);
  };

  const findNextWord = (text, row, col) => {
    let currentRow = row;
    let currentCol = col;
    
    if (currentCol >= text[currentRow].length) {
      if (currentRow < text.length - 1) {
        return [currentRow + 1, 0];
      }
      return [currentRow, currentCol];
    }

    const line = text[currentRow];
    
    if (currentCol < line.length && isWordChar(line[currentCol])) {
      while (currentCol < line.length && isWordChar(line[currentCol])) {
        currentCol++;
      }
    } else if (currentCol < line.length && !isWhitespace(line[currentCol])) {
      while (currentCol < line.length && !isWordChar(line[currentCol]) && !isWhitespace(line[currentCol])) {
        currentCol++;
      }
    }
    
    while (currentCol < line.length && isWhitespace(line[currentCol])) {
      currentCol++;
    }
    
    if (currentCol >= line.length) {
      if (currentRow < text.length - 1) {
        return [currentRow + 1, 0];
      }
      return [currentRow, line.length - 1];
    }
    
    return [currentRow, currentCol];
  };

  const findPrevWord = (text, row, col) => {
    let currentRow = row;
    let currentCol = col;
    
    if (currentCol > 0) {
      currentCol--;
    } else if (currentRow > 0) {
      currentRow--;
      currentCol = text[currentRow].length - 1;
    } else {
      return [0, 0];
    }
    
    const line = text[currentRow];
    
    while (currentCol >= 0 && isWhitespace(line[currentCol])) {
      currentCol--;
    }
    
    if (currentCol < 0) {
      if (currentRow > 0) {
        currentRow--;
        currentCol = text[currentRow].length - 1;
        return findPrevWord(text, currentRow, currentCol + 1);
      }
      return [0, 0];
    }
    
    if (isWordChar(line[currentCol])) {
      while (currentCol > 0 && isWordChar(line[currentCol - 1])) {
        currentCol--;
      }
    } else {
      while (currentCol > 0 && !isWordChar(line[currentCol - 1]) && !isWhitespace(line[currentCol - 1])) {
        currentCol--;
      }
    }
    
    return [currentRow, currentCol];
  };

  const exercises = {
    beginner: [
      {
        type: 'navigation',
        instruction: 'Move cursor one character to the right',
        command: 'l',
        check: (startRow, startCol, endRow, endCol) => 
          endRow === startRow && endCol === startCol + 1,
        getTarget: (startRow, startCol, text) => [startRow, Math.min(startCol + 1, text[startRow].length - 1)]
      },
      {
        type: 'navigation',
        instruction: 'Move cursor one character to the left',
        command: 'h',
        check: (startRow, startCol, endRow, endCol) => 
          endRow === startRow && endCol === startCol - 1,
        getTarget: (startRow, startCol, text) => [startRow, Math.max(startCol - 1, 0)]
      },
      {
        type: 'navigation',
        instruction: 'Move cursor one line down',
        command: 'j',
        check: (startRow, startCol, endRow, endCol) => 
          endRow === startRow + 1,
        getTarget: (startRow, startCol, text) => startRow + 1 < text.length ? [startRow + 1, Math.min(startCol, text[startRow + 1].length - 1)] : [startRow, startCol]
      },
      {
        type: 'navigation',
        instruction: 'Move cursor one line up',
        command: 'k',
        check: (startRow, startCol, endRow, endCol) => 
          endRow === startRow - 1,
        getTarget: (startRow, startCol, text) => startRow > 0 ? [startRow - 1, Math.min(startCol, text[startRow - 1].length - 1)] : [startRow, startCol]
      }
    ],
    intermediate: [
      {
        type: 'navigation',
        instruction: 'Move cursor to the beginning of the current line',
        command: '0',
        check: (startRow, startCol, endRow, endCol) => endRow === startRow && endCol === 0,
        getTarget: (startRow, startCol, text) => [startRow, 0]
      },
      {
        type: 'navigation',
        instruction: 'Move cursor to the end of the current line',
        command: '$',
        check: (startRow, startCol, endRow, endCol, text) => 
          endRow === startRow && endCol === text[startRow].length - 1,
        getTarget: (startRow, startCol, text) => [startRow, text[startRow].length - 1]
      },
      {
        type: 'navigation',
        instruction: 'Move cursor to the beginning of the next word',
        command: 'w',
        check: (startRow, startCol, endRow, endCol, text) => {
          const [expectedRow, expectedCol] = findNextWord(text, startRow, startCol);
          return endRow === expectedRow && endCol === expectedCol;
        },
        getTarget: (startRow, startCol, text) => findNextWord(text, startRow, startCol)
      },
      {
        type: 'navigation',
        instruction: 'Move cursor to the beginning of the previous word',
        command: 'b',
        check: (startRow, startCol, endRow, endCol, text) => {
          const [expectedRow, expectedCol] = findPrevWord(text, startRow, startCol);
          return endRow === expectedRow && endCol === expectedCol;
        },
        getTarget: (startRow, startCol, text) => findPrevWord(text, startRow, startCol)
      }
    ],
    advanced: [
      {
        type: 'navigation',
        instruction: 'Move cursor to the first line of the text',
        command: 'gg',
        check: (startRow, startCol, endRow, endCol) => endRow === 0,
        getTarget: (startRow, startCol, text) => [0, 0]
      },
      {
        type: 'navigation',
        instruction: 'Move cursor to the last line of the text',
        command: 'G',
        check: (startRow, startCol, endRow, endCol, text) => endRow === text.length - 1,
        getTarget: (startRow, startCol, text) => [text.length - 1, 0]
      },
      {
        type: 'navigation',
        instruction: 'Move cursor to the beginning of the next word',
        command: 'w',
        check: (startRow, startCol, endRow, endCol, text) => {
          const [expectedRow, expectedCol] = findNextWord(text, startRow, startCol);
          return endRow === expectedRow && endCol === expectedCol;
        },
        getTarget: (startRow, startCol, text) => findNextWord(text, startRow, startCol)
      },
      {
        type: 'navigation',
        instruction: 'Move cursor to the beginning of the previous word',
        command: 'b',
        check: (startRow, startCol, endRow, endCol, text) => {
          const [expectedRow, expectedCol] = findPrevWord(text, startRow, startCol);
          return endRow === expectedRow && endCol === expectedCol;
        },
        getTarget: (startRow, startCol, text) => findPrevWord(text, startRow, startCol)
      },
      {
        type: 'navigation',
        instruction: 'Move cursor to the end of the current line',
        command: '$',
        check: (startRow, startCol, endRow, endCol, text) => 
          endRow === startRow && endCol === text[startRow].length - 1,
        getTarget: (startRow, startCol, text) => [startRow, text[startRow].length - 1]
      },
      {
        type: 'navigation',
        instruction: 'Move cursor to the beginning of the current line',
        command: '0',
        check: (startRow, startCol, endRow, endCol) => endRow === startRow && endCol === 0,
        getTarget: (startRow, startCol, text) => [startRow, 0]
      }
    ]
  };

  const generateExercise = () => {
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    const availableExercises = exercises[difficulty];
    const randomExercise = availableExercises[Math.floor(Math.random() * availableExercises.length)];
    
    setTextContent(randomText);
    setCurrentExercise(randomExercise);
    
    let startRow, startCol;
    
    if (difficulty === 'beginner') {
      startRow = Math.max(1, Math.min(randomText.length - 2, Math.floor(Math.random() * randomText.length)));
      startCol = Math.max(1, Math.min(randomText[startRow].length - 2, Math.floor(Math.random() * randomText[startRow].length)));
    } else {
      startRow = Math.floor(Math.random() * randomText.length);
      startCol = Math.min(
        Math.floor(Math.random() * randomText[startRow].length),
        randomText[startRow].length - 1
      );
    }
    
    setCursorRow(startRow);
    setCursorCol(Math.max(0, startCol));
    
    const [tRow, tCol] = randomExercise.getTarget(startRow, startCol, randomText);
    setTargetRow(tRow);
    setTargetCol(tCol);
    
    setMode('normal');
    setIsCorrect(null);
    setFeedback('');
    setExerciseComplete(false);
    setWaitingForSecondG(false);
    
    // Focus editor after generating exercise
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }, 100);
  };

  const checkExercise = () => {
    if (!currentExercise || exerciseComplete) return;

    // Use the stored starting position, or fall back to the current values if not set
    const startRow = startingRow !== null ? startingRow : cursorRow;
    const startCol = startingCol !== null ? startingCol : cursorCol;
    
    // First check if we're at the target position (simple position match)
    const atTarget = cursorRow === targetRow && cursorCol === targetCol;
    
    // Also check using the exercise's validation function
    const passedValidation = currentExercise.check(startRow, startCol, cursorRow, cursorCol, textContent);
    
    // Pass if either condition is true (prioritize being at target)
    const passed = atTarget || passedValidation;
    
    setIsCorrect(passed);
    setExerciseComplete(true);
    setScore(prev => ({
      correct: prev.correct + (passed ? 1 : 0),
      total: prev.total + 1
    }));

    if (passed) {
      setFeedback(`Correct! You used "${currentExercise.command}" to navigate successfully.`);
    } else {
      setFeedback(`Not quite right. Try using "${currentExercise.command}" to ${currentExercise.instruction.toLowerCase()}. Expected position: Row ${targetRow + 1}, Column ${targetCol + 1}. Debug: Start(${startRow + 1},${startCol + 1}) Current(${cursorRow + 1},${cursorCol + 1}) Target(${targetRow + 1},${targetCol + 1})`);
    }
  };

  const handleKeyDown = (e) => {
    if (mode !== 'normal' || !currentExercise || exerciseComplete) return;

    // Prevent browser defaults for all vim keys
    const vimKeys = ['h', 'j', 'k', 'l', 'w', 'b', 'g', 'G', '0', '$', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (vimKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const maxRow = textContent.length - 1;
    let newRow = cursorRow;
    let newCol = cursorCol;

    if (e.key === 'g' && !e.shiftKey) {
      if (waitingForSecondG) {
        newRow = 0;
        newCol = 0;
        setWaitingForSecondG(false);
      } else {
        setWaitingForSecondG(true);
        setTimeout(() => setWaitingForSecondG(false), 1000);
        return;
      }
    } else {
      setWaitingForSecondG(false);
    }

    switch (e.key) {
      case 'h':
      case 'ArrowLeft':
        newCol = Math.max(0, cursorCol - 1);
        break;
      case 'j':
      case 'ArrowDown':
        if (cursorRow < maxRow) {
          newRow = cursorRow + 1;
          newCol = Math.min(cursorCol, textContent[newRow].length - 1);
        }
        break;
      case 'k':
      case 'ArrowUp':
        if (cursorRow > 0) {
          newRow = cursorRow - 1;
          newCol = Math.min(cursorCol, textContent[newRow].length - 1);
        }
        break;
      case 'l':
      case 'ArrowRight':
        newCol = Math.min(textContent[cursorRow].length - 1, cursorCol + 1);
        break;
      case '0':
        newCol = 0;
        break;
      case '$':
        newCol = textContent[cursorRow].length - 1;
        break;
      case 'w':
        const [nextRow, nextCol] = findNextWord(textContent, cursorRow, cursorCol);
        newRow = nextRow;
        newCol = nextCol;
        break;
      case 'b':
        const [prevRow, prevCol] = findPrevWord(textContent, cursorRow, cursorCol);
        newRow = prevRow;
        newCol = prevCol;
        break;
      case 'G':
        newRow = maxRow;
        newCol = 0;
        break;
      case 'g':
        break;
      default:
        return;
    }

    setCursorRow(newRow);
    setCursorCol(Math.max(0, newCol));
  };

  const handleGlobalKeyPress = (e) => {
    // Block CMD/CTRL + N at the highest priority
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      generateExercise();
      return false;
    }
    
    // Alternative shortcuts that browsers don't typically use
    if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
      e.preventDefault();
      e.stopPropagation();
      generateExercise();
      return;
    }
    
    // F5 for new exercise (common refresh alternative)
    if (e.key === 'F5') {
      e.preventDefault();
      e.stopPropagation();
      generateExercise();
      return;
    }
    
    // Handle other shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      checkExercise();
    }
    
    // Ensure focus stays on editor
    if (editorRef.current && (e.ctrlKey || e.metaKey)) {
      editorRef.current.focus();
    }
  };

  // Chromium-specific aggressive blocking for macOS
  useEffect(() => {
    // Multiple blocking strategies for Chromium on macOS
    const blockCmdN = (e) => {
      if (e.metaKey && e.key === 'n') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        generateExercise();
        return false;
      }
    };

    // Strategy 1: Capture phase blocking at the highest level
    const captureHandler = (e) => {
      if (e.metaKey && e.key === 'n') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setTimeout(() => generateExercise(), 0); // Defer to next tick
        return false;
      }
    };

    // Strategy 2: Multiple event types
    const preventMultiple = (e) => {
      if (e.metaKey && (e.key === 'n' || e.code === 'KeyN' || e.which === 78 || e.keyCode === 78)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        generateExercise();
        return false;
      }
    };

    // Strategy 3: Focus stealing prevention
    const maintainFocus = () => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    };

    // Register all strategies
    document.addEventListener('keydown', captureHandler, true);
    window.addEventListener('keydown', captureHandler, true);
    document.body.addEventListener('keydown', preventMultiple, true);
    document.addEventListener('keypress', preventMultiple, true);
    document.addEventListener('keyup', preventMultiple, true);
    
    // Prevent focus loss which might allow browser shortcuts
    window.addEventListener('blur', maintainFocus);
    document.addEventListener('focusout', maintainFocus);
    
    // Try to override browser behavior by preventing default on all meta key combinations
    const preventMetaKeys = (e) => {
      if (e.metaKey) {
        if (e.key === 'n') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          generateExercise();
          return false;
        }
        // Also prevent other potentially interfering shortcuts
        if (['t', 'w', 'r'].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    
    // Add at the earliest possible phase
    document.addEventListener('keydown', preventMetaKeys, { capture: true, passive: false });
    window.addEventListener('keydown', preventMetaKeys, { capture: true, passive: false });
    
    // Try to intercept before browser processes
    const earliestCapture = (e) => {
      if (e.metaKey && e.key === 'n') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Immediate execution
        generateExercise();
        return false;
      }
    };
    
    // Add to document element itself
    if (document.documentElement) {
      document.documentElement.addEventListener('keydown', earliestCapture, true);
    }
    
    return () => {
      document.removeEventListener('keydown', captureHandler, true);
      window.removeEventListener('keydown', captureHandler, true);
      document.body.removeEventListener('keydown', preventMultiple, true);
      document.removeEventListener('keypress', preventMultiple, true);
      document.removeEventListener('keyup', preventMultiple, true);
      window.removeEventListener('blur', maintainFocus);
      document.removeEventListener('focusout', maintainFocus);
      document.removeEventListener('keydown', preventMetaKeys, { capture: true });
      window.removeEventListener('keydown', preventMetaKeys, { capture: true });
      if (document.documentElement) {
        document.documentElement.removeEventListener('keydown', earliestCapture, true);
      }
    };
  }, []);

  useEffect(() => {
    generateExercise();
  }, []);

  useEffect(() => {
    if (currentExercise && !exerciseComplete) {
      setCurrentExercise(prev => ({
        ...prev,
        startRow: cursorRow,
        startCol: cursorCol
      }));
    }
  }, [currentExercise?.instruction]);

  useEffect(() => {
    const handleKeyDownWrapper = (e) => handleKeyDown(e);
    const handleGlobalKeyPressWrapper = (e) => handleGlobalKeyPress(e);
    
    // Add event listeners at capture phase to intercept browser shortcuts
    document.addEventListener('keydown', handleGlobalKeyPressWrapper, true);
    
    if (editorRef.current) {
      editorRef.current.addEventListener('keydown', handleKeyDownWrapper);
      editorRef.current.focus();
    }
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyPressWrapper, true);
      if (editorRef.current) {
        editorRef.current.removeEventListener('keydown', handleKeyDownWrapper);
      }
    };
  }, [mode, currentExercise, exerciseComplete, cursorRow, cursorCol, textContent, waitingForSecondG]);

  // Add focus handler to ensure editor stays focused
  useEffect(() => {
    const handleWindowFocus = () => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    };
    
    const handleClick = (e) => {
      // If click is outside editor but inside the app, refocus editor
      if (editorRef.current && !editorRef.current.contains(e.target)) {
        editorRef.current.focus();
      }
    };
    
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('click', handleClick);
    
    // Prevent right-click context menu which can steal focus
    document.addEventListener('contextmenu', (e) => {
      if (editorRef.current) {
        e.preventDefault();
        editorRef.current.focus();
      }
    });
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  const renderTextWithCursor = () => {
    return textContent.map((line, rowIndex) => (
      <div key={rowIndex} className="font-mono text-lg leading-relaxed flex">
        {line.split('').map((char, colIndex) => {
          const isCursor = rowIndex === cursorRow && colIndex === cursorCol;
          const isTarget = rowIndex === targetRow && colIndex === targetCol;
          
          let className = '';
          if (isCursor && isTarget) {
            className = 'bg-purple-500 text-white';
          } else if (isCursor) {
            className = 'bg-blue-500 text-white';
          } else if (isTarget) {
            className = 'bg-red-200 text-red-800 border border-red-400';
          }
          
          return (
            <span key={colIndex} className={className}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
        {rowIndex === cursorRow && cursorCol >= line.length && (
          <span className="bg-blue-500 text-white w-2">&nbsp;</span>
        )}
        {rowIndex === targetRow && targetCol >= line.length && (
          <span className="bg-red-200 text-red-800 border border-red-400 w-2">&nbsp;</span>
        )}
      </div>
    ));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Keyboard className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Vim Navigation Trainer</h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Difficulty:</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Score: {score.correct}/{score.total} ({accuracy}%)
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Text Editor</h2>
            <div 
              ref={editorRef}
              tabIndex={0}
              className="border-2 border-gray-300 rounded-lg p-4 min-h-64 bg-gray-50 focus:outline-none focus:border-blue-500"
              onBlur={(e) => {
                // Prevent losing focus to other elements
                setTimeout(() => {
                  if (editorRef.current && !editorRef.current.contains(document.activeElement)) {
                    editorRef.current.focus();
                  }
                }, 0);
              }}
            >
              {renderTextWithCursor()}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Mode:</span> 
              <span className="ml-2 font-mono text-blue-600">-- NORMAL --</span>
              {waitingForSecondG && <span className="ml-4 text-orange-600">Waiting for second 'g'...</span>}
            </div>
            <div className="text-sm text-gray-600">
              Position: Row {cursorRow + 1}, Column {cursorCol + 1}
              {targetRow !== null && targetCol !== null && (
                <span className="ml-4">Target: Row {targetRow + 1}, Column {targetCol + 1}</span>
              )}
              {startingRow !== null && startingCol !== null && (
                <span className="ml-4 text-gray-500">Start: Row {startingRow + 1}, Column {startingCol + 1}</span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              <span className="inline-block w-4 h-4 bg-blue-500 mr-2"></span>Current Position
              <span className="inline-block w-4 h-4 bg-red-200 border border-red-400 ml-4 mr-2"></span>Target Position
              <span className="inline-block w-4 h-4 bg-purple-500 ml-4 mr-2"></span>Success (both match)
            </div>
          </div>

          <div className="space-y-6">
            {currentExercise && (
              <div>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
                  <div className="flex items-center mb-2">
                    <Target className="w-5 h-5 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-blue-800">Exercise</h2>
                  </div>
                  <p className="text-lg text-blue-700 mb-2">{currentExercise.instruction}</p>
                  <p className="text-sm text-blue-600">Use the vim command: <code className="bg-blue-100 px-2 py-1 rounded font-mono">{currentExercise.command}</code></p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={checkExercise}
                    disabled={exerciseComplete}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Check Position <span className="text-xs opacity-75">(Ctrl/Cmd+Enter)</span>
                  </button>
                  <button
                    onClick={generateExercise}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>New Exercise</span>
                  </button>
                </div>

                {feedback && (
                  <div className={`mt-6 p-4 rounded-lg flex items-start space-x-3 ${
                    isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {feedback}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Navigation Commands ({difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level)
              </h3>
              <div className="grid gap-4">
                {difficulty === 'beginner' && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Basic Movement</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><code className="bg-gray-200 px-1 rounded">h j k l</code> - Left, down, up, right</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">Focus on single-character movements</p>
                  </div>
                )}
                {difficulty === 'intermediate' && (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Line Movement</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li><code className="bg-gray-200 px-1 rounded">0</code> - Beginning of line</li>
                        <li><code className="bg-gray-200 px-1 rounded">$</code> - End of line</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Word Movement</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li><code className="bg-gray-200 px-1 rounded">w</code> - Next word</li>
                        <li><code className="bg-gray-200 px-1 rounded">b</code> - Previous word</li>
                      </ul>
                    </div>
                  </>
                )}
                {difficulty === 'advanced' && (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">All Commands</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li><code className="bg-gray-200 px-1 rounded">0 $</code> - Line start/end</li>
                        <li><code className="bg-gray-200 px-1 rounded">w b</code> - Word movement</li>
                        <li><code className="bg-gray-200 px-1 rounded">gg G</code> - File start/end</li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">Mixed difficulty with all navigation commands</p>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-800">
                  <strong>Shortcuts:</strong> <kbd className="bg-blue-100 px-1 rounded">Cmd+Enter</kbd> to check position
                </p>
              </div>
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-xs text-green-800">
                  <strong>New Exercise:</strong> <kbd className="bg-green-100 px-1 rounded">Cmd+N</kbd> or <kbd className="bg-green-100 px-1 rounded">Cmd+G</kbd> or <kbd className="bg-green-100 px-1 rounded">F5</kbd> or click "New Exercise" button
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VimTrainer;