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

  // 4. Yellow (เหลือง)
  if (r >= 160 && r <= 255 && g >= 120 && g <= 230 && b >= 0 && b <= 120) {
    return 'Yellow (เหลือง)';
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

export function getRecommendation(category: string): string {
  switch (category) {
    case 'Red (แดง)':
    case 'Pink (ชมพู)':
      return `สาเหตุ: มีเลือดปน, กินบีทรูท, ยาบางชนิด 

คำแนะนำ: ถ้าไม่หายภายใน 1–2 วัน หรือมีอาการปวดเอว/ไข้ → พบแพทย์`;
    
    case 'Brown (น้ำตาล)':
    case 'Dark (โทนดำ)':
      return `สาเหตุ: โรคตับ, ตาเหลือง, ยาบางชนิด, ภาวะกล้ามเนื้อสลาย 

คำแนะนำ: ถ้ามี ตาเหลือง ตัวเหลือง หรืออ่อนเพลียมาก → พบแพทย์`;
    
    case 'Green (เขียว)':
    case 'Blue (ฟ้า)':
      return `สาเหตุ: ยาบางชนิด, การติดเชื้อบางชนิด (หายาก) 

คำแนะนำ: ถ้ามีกลิ่นเหม็นผิดปกติ → พบแพทย์`;
    
    case 'Milky White (ขาวขุ่น / น้ำนม)':
      return `สาเหตุ: การติดเชื้อทางเดินปัสสาวะ, นิ่ว, ไขมันปน (chyluria) 

คำแนะนำ: พบแพทย์ทันที`;
    
    default:
      return '-';
  }
}