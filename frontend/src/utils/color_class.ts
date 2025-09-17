export function classifyColor(r: number, g: number, b: number): string {
  // 1. Milky White (ขาวขุ่น / น้ำนม)
  if (r >= 200 && r <= 255 && g >= 200 && g <= 255 && b >= 200 && b <= 255) {
    return 'Milky White (ขาวขุ่น / น้ำนม)';
  }

  // 2. Green (เขียว)
  if (r >= 0 && r <= 120 && g >= 150 && g <= 255 && b >= 0 && b <= 120) {
    return 'Green (เขียว)';
  }

  // 3. Blue (ฟ้า)
  if (r >= 0 && r <= 120 && g >= 0 && g <= 150 && b >= 150 && b <= 255) {
    return 'Blue (ฟ้า)';
  }

  // 4. Brown / Dark (น้ำตาล / โทนดำ)
  if (r >= 60 && r <= 150 && g >= 40 && g <= 120 && b >= 20 && b <= 100) {
    return 'Brown (น้ำตาล)';
  }
  
  // Very dark (close to black)
  if (r >= 0 && r <= 60 && g >= 0 && g <= 60 && b >= 0 && b <= 60) {
    return 'Dark (โทนดำ)';
  }

  // 5. Red (แดง)
  if (r >= 180 && r <= 255 && g >= 0 && g <= 100 && b >= 0 && b <= 100) {
    return 'Red (แดง)';
  }

  // 6. Pink (ชมพู)
  if (r >= 200 && r <= 255 && g >= 100 && g <= 200 && b >= 120 && b <= 220) {
    return 'Pink (ชมพู)';
  }

  // If no category matches
  return 'Unknown';
}