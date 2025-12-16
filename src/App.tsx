import { useState } from 'react';

interface Selection {
  row: number;
  col: number;
  value: string;
}

interface GridSquare {
  number: number;
  isVisible: boolean;
}

export default function App() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [matchedTargets, setMatchedTargets] = useState<number[]>([]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [completionTime, setCompletionTime] = useState<number>(0);
  const maxSelections = 5;

  const operators = ['+', '−', '×', '÷'];

  // Generate random numbers for the grid (24 squares, 12 visible, 12 hidden)
  const [gridNumbers, setGridNumbers] = useState<GridSquare[][]>(() => generateGrid());

  const isSelected = (row: number, col: number): boolean => {
    return selections.some(s => s.row === row && s.col === col);
  };

  // Determine if next selection should be a number or operator
  const shouldSelectOperator = selections.length % 2 === 1;

  const handleSquareClick = (row: number, col: number) => {
    // Don't allow selection if already selected
    if (isSelected(row, col)) return;
    
    // Don't allow more than 5 selections
    if (selections.length >= maxSelections) return;

    // Check if this is an operator square
    const isOperator = col === 4 && row < 4;

    // Enforce alternating pattern: number, operator, number, operator, number
    if (shouldSelectOperator && !isOperator) return; // Should select operator but clicked number
    if (!shouldSelectOperator && isOperator) return; // Should select number but clicked operator

    const value = col === 4 ? operators[row] : String(gridNumbers[row][col].number);
    setSelections([...selections, { row, col, value }]);
  };

  const handleSubmit = () => {
    if (selections.length === maxSelections) {
      // Calculate result: num1 op1 num2 op2 num3
      const num1 = parseInt(selections[0].value);
      const op1 = selections[1].value;
      const num2 = parseInt(selections[2].value);
      const op2 = selections[3].value;
      const num3 = parseInt(selections[4].value);

      // Calculate first operation
      let result = 0;
      switch (op1) {
        case '+':
          result = num1 + num2;
          break;
        case '−':
          result = num1 - num2;
          break;
        case '×':
          result = num1 * num2;
          break;
        case '÷':
          result = Math.floor(num1 / num2);
          break;
      }

      // Calculate second operation
      switch (op2) {
        case '+':
          result = result + num3;
          break;
        case '−':
          result = result - num3;
          break;
        case '×':
          result = result * num3;
          break;
        case '÷':
          result = Math.floor(result / num3);
          break;
      }

      // Check if result matches any target
      const targets = [0, 1, 2, 3].map(col => gridNumbers[5][col].number);
      const matchedIndex = targets.findIndex((target, idx) => 
        target === result && !matchedTargets.includes(idx)
      );

      if (matchedIndex !== -1) {
        setMatchedTargets([...matchedTargets, matchedIndex]);
        
        // Check if puzzle is complete
        if (matchedTargets.length + 1 === 4) {
          setCompletionTime(Date.now() - startTime);
          setIsGameWon(true);
        }
      }

      // Clear selections for next attempt
      setSelections([]);
    }
  };

  const handleReset = () => {
    setSelections([]);
    // Don't reset matchedTargets - keep gold squares highlighted
  };

  const handlePlayAgain = () => {
    setSelections([]);
    setMatchedTargets([]);
    setGridNumbers(generateGrid());
    setStartTime(Date.now());
    setCompletionTime(0);
    setIsGameWon(false);
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  // Calculate running result based on current selections
  const calculateRunningResult = (): string => {
    if (selections.length === 0) return '';
    if (selections.length === 1) return `= ${selections[0].value}`;
    if (selections.length === 2) return `= ${selections[0].value} ${selections[1].value}`;
    
    // After 3rd selection, calculate first operation
    const num1 = parseInt(selections[0].value);
    const op1 = selections[1].value;
    const num2 = parseInt(selections[2].value);
    
    let result = 0;
    switch (op1) {
      case '+':
        result = num1 + num2;
        break;
      case '−':
        result = num1 - num2;
        break;
      case '×':
        result = num1 * num2;
        break;
      case '÷':
        result = Math.floor(num1 / num2);
        break;
    }
    
    if (selections.length === 3) return `= ${result}`;
    if (selections.length === 4) return `= ${result} ${selections[3].value}`;
    
    // After 5th selection, calculate final result
    const op2 = selections[3].value;
    const num3 = parseInt(selections[4].value);
    
    switch (op2) {
      case '+':
        result = result + num3;
        break;
      case '−':
        result = result - num3;
        break;
      case '×':
        result = result * num3;
        break;
      case '÷':
        result = Math.floor(result / num3);
        break;
    }
    
    return `= ${result}`;
  };

  const renderSquare = (row: number, col: number) => {
    // Target numbers (row 5, cols 0-3) - not selectable, can be highlighted gold
    if (row === 5 && col < 4) {
      const isMatched = matchedTargets.includes(col);
      const squareData = gridNumbers[row][col];
      
      return (
        <div
          key={`${row}-${col}`}
          className={`
            aspect-square border-2 border-gray-800 flex items-center justify-center text-2xl
            transition-colors
            ${isMatched ? 'bg-yellow-400 text-gray-900' : 'bg-purple-100 text-purple-900'}
          `}
        >
          {squareData.number}
        </div>
      );
    }

    // Operators column (column 4, rows 0-3)
    if (col === 4 && row < 4) {
      const selected = isSelected(row, col);
      const isValidSelection = shouldSelectOperator && !selected && selections.length < maxSelections;
      
      return (
        <button
          key={`${row}-${col}`}
          onClick={() => handleSquareClick(row, col)}
          disabled={!isValidSelection}
          className={`
            aspect-square border-2 border-gray-800 flex items-center justify-center text-2xl
            transition-colors cursor-pointer
            ${selected ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}
            ${!isValidSelection ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          {operators[row]}
        </button>
      );
    }

    // RESET button (row 4, col 4)
    if (row === 4 && col === 4) {
      return (
        <button
          key={`${row}-${col}`}
          onClick={handleReset}
          className="aspect-square border-2 border-gray-800 bg-orange-500 text-white flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors"
        >
          RESET
        </button>
      );
    }

    // GO button (row 5, col 4)
    if (row === 5 && col === 4) {
      const isActive = selections.length === maxSelections;
      return (
        <button
          key={`${row}-${col}`}
          onClick={handleSubmit}
          disabled={!isActive}
          className={`
            aspect-square border-2 border-gray-800 flex items-center justify-center
            transition-colors
            ${isActive 
              ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          GO
        </button>
      );
    }

    // Regular selectable squares
    const selected = isSelected(row, col);
    const isValidSelection = !shouldSelectOperator && !selected && selections.length < maxSelections;
    const squareData = gridNumbers[row][col];

    return (
      <button
        key={`${row}-${col}`}
        onClick={() => handleSquareClick(row, col)}
        disabled={!isValidSelection}
        className={`
          aspect-square border-2 border-gray-800 flex items-center justify-center text-2xl
          transition-colors cursor-pointer
          ${selected ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}
          ${!isValidSelection ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        {selected 
          ? squareData.number
          : squareData.isVisible 
            ? squareData.number 
            : '?'
        }
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      {isGameWon ? (
        // Win Screen
        <div className="max-w-2xl w-full">
          <div className="bg-white p-12 rounded-lg shadow-lg text-center">
            <h1 className="text-5xl mb-8 text-green-600">You Are A Winner!</h1>
            <p className="text-3xl text-gray-700 mb-8">
              Completion Time: {formatTime(completionTime)}
            </p>
            <button
              onClick={handlePlayAgain}
              className="px-8 py-4 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      ) : (
        // Game Screen
        <div className="max-w-2xl w-full">
          <h1 className="text-center mb-8">Grid Selection Game</h1>
          <p className="text-center text-gray-600 mb-6">
            Select 5 squares to activate the GO button
          </p>

          {/* Main Grid */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <div className="grid grid-cols-5 gap-2 mb-4 max-w-md mx-auto">
              {Array.from({ length: 6 }).map((_, row) => 
                Array.from({ length: 5 }).map((_, col) => renderSquare(row, col))
              )}
            </div>
          </div>

          {/* 7th Row - Selection Display */}
          {selections.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-center mb-4 text-gray-700">Your Selections</h2>
              <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
                {selections.map((selection, index) => (
                  <div
                    key={index}
                    className="aspect-square border-2 border-blue-500 bg-blue-100 flex items-center justify-center text-2xl"
                  >
                    {selection.value}
                  </div>
                ))}
                {/* Empty placeholders for remaining selections */}
                {Array.from({ length: maxSelections - selections.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square border-2 border-gray-300 border-dashed bg-gray-50"
                  />
                ))}
              </div>
              <p className="text-center mt-4 text-gray-500">{calculateRunningResult()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to generate the grid
function generateGrid(): GridSquare[][] {
  // Generate array of numbers 1-100
  const allNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
  
  // Fisher-Yates shuffle
  for (let i = allNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
  }
  
  // Ensure at least 5 numbers from 1-10 are in the first 24 positions
  const smallNumbers = allNumbers.filter(n => n >= 1 && n <= 10);
  const otherNumbers = allNumbers.filter(n => n > 10);
  
  // Take 5 small numbers for guaranteed inclusion
  const guaranteedSmall = smallNumbers.slice(0, 5);
  
  // Combine with other numbers for remaining 19 slots (24 - 5)
  const remaining = [...smallNumbers.slice(5), ...otherNumbers];
  
  // Shuffle remaining numbers
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }
  
  // First 24: 5 guaranteed small + 19 from remaining
  const gridNumbers = [...guaranteedSmall, ...remaining.slice(0, 19)];
  
  // Shuffle grid numbers to distribute small numbers randomly
  for (let i = gridNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gridNumbers[i], gridNumbers[j]] = [gridNumbers[j], gridNumbers[i]];
  }
  
  // Generate 4 target numbers with specific ranges
  const targetNumbers = [
    Math.floor(Math.random() * 100) + 1,           // First: 1-100
    Math.floor(Math.random() * 151) + 100,         // Second: 100-250
    Math.floor(Math.random() * 151) + 250,         // Third: 250-400
    Math.floor(Math.random() * 601) + 400          // Fourth: 400-1000
  ];
  
  const numbers: GridSquare[] = [];
  
  // Use first 24 numbers for the main grid
  for (let i = 0; i < 24; i++) {
    numbers.push({
      number: gridNumbers[i],
      isVisible: false
    });
  }
  
  // Randomly select 12 to be visible
  const indices = Array.from({ length: 24 }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  // Make first 12 shuffled indices visible
  for (let i = 0; i < 12; i++) {
    numbers[indices[i]].isVisible = true;
  }
  
  // Convert to 2D array (6 rows × 4 cols)
  const grid: GridSquare[][] = [];
  for (let row = 0; row < 6; row++) {
    grid[row] = [];
    for (let col = 0; col < 4; col++) {
      if (row === 5) {
        // Target row uses the 4 target numbers
        grid[row][col] = {
          number: targetNumbers[col],
          isVisible: true
        };
      } else {
        grid[row][col] = numbers[row * 4 + col];
      }
    }
  }
  
  return grid;
}