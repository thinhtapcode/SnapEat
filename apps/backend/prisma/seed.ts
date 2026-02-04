import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const foods = [
    { name: 'Phở bò', calories: 450, protein: 20, carbs: 55, fat: 15 },
    { name: 'Phở gà', calories: 400, protein: 22, carbs: 50, fat: 12 },
    { name: 'Bún chả Hà Nội', calories: 550, protein: 25, carbs: 60, fat: 20 },
    { name: 'Bánh mì thịt', calories: 400, protein: 15, carbs: 45, fat: 18 },
    { name: 'Cơm tấm sườn bì chả', calories: 750, protein: 30, carbs: 85, fat: 28 },
    { name: 'Gỏi cuốn (1 chiếc)', calories: 60, protein: 3, carbs: 10, fat: 1 },
    { name: 'Bún bò Huế', calories: 500, protein: 25, carbs: 55, fat: 18 },
    { name: 'Ức gà áp chảo (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: 'Cơm trắng (1 bát)', calories: 200, protein: 4.5, carbs: 45, fat: 0.5 },
    { name: 'Trứng ốp la (1 quả)', calories: 70, protein: 6, carbs: 0.5, fat: 5 },
    { name: 'Cà phê sữa đá', calories: 120, protein: 2, carbs: 15, fat: 6 },
    { name: 'Sữa chua', calories: 100, protein: 5, carbs: 12, fat: 3 },
    { name: 'Bánh cuốn nóng', calories: 350, protein: 10, carbs: 60, fat: 8 },
    { name: 'Xôi xéo', calories: 450, protein: 8, carbs: 80, fat: 12 },
    { name: 'Bún riêu cua', calories: 400, protein: 15, carbs: 50, fat: 15 },
    { name: 'Mì tôm hảo hảo (1 bát)', calories: 350, protein: 7, carbs: 45, fat: 13 },
    { name: 'Bún đậu mắm tôm (suất đầy đủ)', calories: 700, protein: 30, carbs: 70, fat: 35 },

    // --- NHÓM THỰC PHẨM CƠ BẢN (Cho người tập gym) ---
    { name: 'Thịt bò nạc (100g)', calories: 250, protein: 26, carbs: 0, fat: 15 },
    { name: 'Cá hồi tươi (100g)', calories: 208, protein: 20, carbs: 0, fat: 13 },
    { name: 'Khoai lang luộc (100g)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
    { name: 'Yến mạch (100g)', calories: 389, protein: 16.9, carbs: 66, fat: 6.9 },
    { name: 'Bơ sáp (100g)', calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
    { name: 'Hạt hạnh nhân (100g)', calories: 579, protein: 21, carbs: 22, fat: 49 },

    // --- NHÓM MÓN ĂN CƠM GIA ĐÌNH ---
    { name: 'Thịt kho tàu (1 bát con)', calories: 350, protein: 15, carbs: 5, fat: 30 },
    { name: 'Rau muống xào tỏi (1 đĩa)', calories: 120, protein: 3, carbs: 8, fat: 9 },
    { name: 'Canh chua cá lóc', calories: 150, protein: 12, carbs: 10, fat: 6 },
    { name: 'Đậu phụ sốt cà chua', calories: 200, protein: 12, carbs: 10, fat: 14 },

    // --- NHÓM ĐỒ ĂN NHANH & ĂN VẶT ---
    { name: 'Trà sữa trân châu (500ml)', calories: 450, protein: 2, carbs: 80, fat: 15 },
    { name: 'Pizza Pepperoni (1 miếng trung)', calories: 280, protein: 12, carbs: 30, fat: 12 },
    { name: 'Gà rán KFC (1 miếng ức)', calories: 320, protein: 25, carbs: 15, fat: 18 },
    { name: 'Bánh tráng trộn (1 túi)', calories: 300, protein: 5, carbs: 40, fat: 12 },

    // --- HOA QUẢ ---
    { name: 'Chuối tiêu (1 quả trung)', calories: 88, protein: 1.1, carbs: 23, fat: 0.3 },
    { name: 'Táo đỏ (100g)', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
    { name: 'Dưa hấu (100g)', calories: 30, protein: 0.6, carbs: 8, fat: 0.2 }
  ]

  console.log('--- Đang bắt đầu nạp dữ liệu món ăn ---')

  for (const food of foods) {
    await prisma.foodLibrary.upsert({
      where: { name: food.name },
      update: {},
      create: food,
    })
  }

  console.log('--- Nạp dữ liệu hoàn tất! ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })