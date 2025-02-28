function calculateDeviation(foundCell, expectedPosition) {
    const { row, column } = foundCell;
    const { left, top, right, bottom } = expectedPosition;
  
    let deviation = 0;
  
    // Calculate deviation from left position
    const leftDeviation = Math.abs(column - left);
    if (column > left) {
      deviation += leftDeviation;
    } else {
      deviation -= leftDeviation;
    }
  
    // Calculate deviation from top position
    const topDeviation = Math.abs(row - top);
    if (row > top) {
      deviation += topDeviation;
    } else {
      deviation -= topDeviation;
    }
  
    // Calculate deviation from right position
    const rightDeviation = Math.abs(column - right);
    if (column < right) {
      deviation += rightDeviation;
    } else {
      deviation -= rightDeviation;
    }
  
    // Calculate deviation from bottom position
    const bottomDeviation = Math.abs(row - bottom);
    if (row < bottom) {
      deviation += bottomDeviation;
    } else {
      deviation -= bottomDeviation;
    }
  
    return deviation;
  }
  
  // Example usage
  const foundCell = { row: 3, column: 5 };
  const expectedPosition = { left: 2, top: 1, right: 8, bottom: 6 };
  const deviation = calculateDeviation(foundCell, expectedPosition);
  console.log(deviation);