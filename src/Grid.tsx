export interface GridSquare {
  number: number;
  isVisible: boolean;
}


export function generateGrid(): GridSquare[][] {
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