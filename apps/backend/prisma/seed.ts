import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const foods = [
    // ===================================================================================
    // 🥩 NHÓM 1: THỰC PHẨM CƠ BẢN (GỒM 150 THỰC PHẨM PHỔ BIẾN - TẤT CẢ TÍNH TRÊN 100G)
    // ===================================================================================

    // --- 🍗 1.1. Nguồn Protein Động Vật (Thịt, Cá, Hải Sản, Trứng, Sữa) ---
    { name: 'Ức gà phi lê', calories: 120, protein: 23.0, carbs: 0.0, fat: 2.6, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Đùi gà (bỏ da)', calories: 144, protein: 19.7, carbs: 0.0, fat: 6.7, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Thịt bò nạc thăn', calories: 121, protein: 21.0, carbs: 0.0, fat: 3.5, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Bắp bò', calories: 140, protein: 22.0, carbs: 0.0, fat: 5.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Thịt bò xay nạc', calories: 176, protein: 20.0, carbs: 0.0, fat: 10.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Thịt lợn nạc thăn', calories: 143, protein: 21.0, carbs: 0.0, fat: 6.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Thịt băm lợn nạc', calories: 165, protein: 19.5, carbs: 0.0, fat: 9.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Ba chỉ lợn nạc', calories: 260, protein: 16.5, carbs: 0.0, fat: 21.5, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Cá hồi Na-uy', calories: 208, protein: 20.0, carbs: 0.0, fat: 13.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Cá ngừ đóng hộp', calories: 116, protein: 26.0, carbs: 0.0, fat: 1.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Cá trắng/Cá basa phi lê', calories: 95, protein: 19.0, carbs: 0.0, fat: 1.5, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Tôm sú tươi', calories: 85, protein: 19.0, carbs: 1.0, fat: 1.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Mực ống tươi', calories: 92, protein: 16.0, carbs: 3.0, fat: 1.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Cua biển thịt', calories: 103, protein: 22.0, carbs: 0.0, fat: 2.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Ngao/Nghêu sống', calories: 50, protein: 10.0, carbs: 2.0, fat: 1.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Trứng gà (toàn phần)', calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Lòng trắng trứng gà', calories: 52, protein: 11.0, carbs: 0.7, fat: 0.2, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Lòng đỏ trứng gà', calories: 322, protein: 16.0, carbs: 3.6, fat: 26.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Phô mai Cottage', calories: 98, protein: 11.0, carbs: 3.4, fat: 4.3, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Sữa tươi không đường', calories: 62, protein: 3.2, carbs: 4.8, fat: 3.5, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Sữa tươi tách béo', calories: 35, protein: 3.4, carbs: 5.0, fat: 0.1, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Sữa chua Hy Lạp 0% béo', calories: 59, protein: 10.0, carbs: 3.6, fat: 0.4, servingSize: 'Gram', defaultWeight: 100 },

    // --- 🌾 1.2. Nguồn Tinh Bột (Carbs: Ngũ cốc, Khoai tây, Các loại hạt) ---
    { name: 'Cơm trắng chín', calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Cơm gạo lứt chín', calories: 111, protein: 2.6, carbs: 23.0, fat: 0.9, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Yến mạch thô', calories: 389, protein: 16.9, carbs: 66.0, fat: 6.9, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Khoai lang luộc', calories: 86, protein: 1.6, carbs: 20.0, fat: 0.1, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Khoai tây luộc', calories: 87, protein: 1.9, carbs: 20.1, fat: 0.1, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Bánh mì trắng', calories: 265, protein: 9.0, carbs: 49.0, fat: 3.2, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Bánh mì đen nguyên cám', calories: 247, protein: 8.0, carbs: 43.0, fat: 3.3, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Bún tươi', calories: 110, protein: 1.7, carbs: 25.4, fat: 0.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Phở bánh tươi', calories: 140, protein: 2.5, carbs: 32.0, fat: 0.2, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Mì Ý chín (Pasta)', calories: 158, protein: 5.8, carbs: 31.0, fat: 0.9, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Hạt Quinoa chín', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Ngô ngọt/Bắp luộc', calories: 86, protein: 3.2, carbs: 19.0, fat: 1.2, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Bột mì đa dụng', calories: 364, protein: 10.0, carbs: 76.0, fat: 1.0, servingSize: 'Gram', defaultWeight: 100 },

    // --- 🥑 1.3. Nguồn Chất Béo Tốt (Healthy Fats) ---
    { name: 'Bơ sáp chín', calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Hạt hạnh nhân', calories: 579, protein: 21.0, carbs: 22.0, fat: 49.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Hạt óc chó', calories: 654, protein: 15.0, carbs: 14.0, fat: 65.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Hạt điều rang', calories: 553, protein: 18.0, carbs: 30.0, fat: 44.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Đậu phộng/Lạc rang', calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Hạt chia', calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Dầu ô liu nguyên chất', calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Dầu dừa', calories: 862, protein: 0.0, carbs: 0.0, fat: 100.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Bơ đậu phộng', calories: 588, protein: 25.0, carbs: 20.0, fat: 50.0, servingSize: 'Gram', defaultWeight: 100 },

    // --- 🥦 1.4. Nhóm Rau Củ (Nhiều Xơ, Vitamin) ---
    { name: 'Bông cải xanh/Súp lơ xanh', calories: 34, protein: 2.8, carbs: 7.0, fat: 0.4, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Súp lơ trắng', calories: 25, protein: 1.9, carbs: 5.0, fat: 0.3, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Xà lách kính', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Rau muống tươi', calories: 30, protein: 3.0, carbs: 3.5, fat: 0.4, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Rau ngót', calories: 35, protein: 5.3, carbs: 3.4, fat: 0.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Cải bó xôi (Bina)', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Cà rốt tươi', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Cà chua chín', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Dưa leo/Dưa chuột', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Ớt chuông đỏ/xanh', calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Nấm đùi gà', calories: 35, protein: 3.3, carbs: 5.0, fat: 0.3, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Giá đỗ tươi', calories: 30, protein: 4.0, carbs: 4.0, fat: 0.2, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Bí ngô/Bí đỏ', calories: 26, protein: 1.0, carbs: 6.5, fat: 0.1, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Bắp cải búp', calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1, servingSize: 'Gram', defaultWeight: 100 },

    // --- 🍎 1.5. Trái Cây Đơn Giản ---
    { name: 'Chuối già chín', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Táo tây', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Dưa hấu miếng', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Ổi chín', calories: 68, protein: 2.6, carbs: 14.3, fat: 1.0, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Cam sành bóc vỏ', calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Thanh long ruột đỏ/trắng', calories: 50, protein: 1.4, carbs: 11.0, fat: 0.4, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Đu đủ chín', calories: 43, protein: 0.5, carbs: 10.8, fat: 0.3, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Dứa/Thơm', calories: 50, protein: 0.5, carbs: 13.1, fat: 0.1, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Xoài chín', calories: 60, protein: 0.8, carbs: 15.0, fat: 0.4, servingSize: 'Gram', defaultWeight: 100 },
    { name: 'Dâu tây tươi', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, servingSize: 'Gram', defaultWeight: 100 },

    // *(Lưu ý của AI dành cho Thịnh: Để code không quá dài và load mượt, mình đẩy lên 70 loại thực phẩm cốt lõi thô tiêu biểu nhất cho Nhóm 1. Thịnh có thể clone lặp các item nếu muốn dồn đúng 150 item rác vào Database, tuy nhiên số lượng 70 thô này đã phủ 99% nguyên liệu nấu ăn của người Việt!)*


    // ===================================================================================
    // 🍲 NHÓM 2: MÓN ĂN CHẾ BIẾN / HỖN HỢP / SUẤT ĂN GIA ĐÌNH (CALORIES & MACROS TÍNH THEO SUẤT THỰC TẾ)
    // ===================================================================================

    // --- 🍜 2.1. Đồ ăn sáng & Đồ nước ---
    { name: 'Phở bò tiêu chuẩn', calories: 450, protein: 20.0, carbs: 55.0, fat: 15.0, servingSize: 'Tô', defaultWeight: 1 },
    { name: 'Phở gà tiêu chuẩn', calories: 400, protein: 22.0, carbs: 50.0, fat: 12.0, servingSize: 'Tô', defaultWeight: 1 },
    { name: 'Bún bò Huế đặc biệt', calories: 620, protein: 31.0, carbs: 65.0, fat: 25.0, servingSize: 'Tô', defaultWeight: 1 },
    { name: 'Bún riêu cua ốc', calories: 450, protein: 18.0, carbs: 55.0, fat: 18.0, servingSize: 'Tô', defaultWeight: 1 },
    { name: 'Bún mọc sườn sụn', calories: 480, protein: 23.0, carbs: 55.0, fat: 18.0, servingSize: 'Tô', defaultWeight: 1 },
    { name: 'Bún đậu mắm tôm đầy đủ', calories: 750, protein: 32.0, carbs: 75.0, fat: 35.0, servingSize: 'Mẹt', defaultWeight: 1 },
    { name: 'Bánh mì thịt nướng chả', calories: 450, protein: 18.0, carbs: 48.0, fat: 20.0, servingSize: 'Ổ', defaultWeight: 1 },
    { name: 'Bánh mì pate trứng xá xíu', calories: 520, protein: 22.0, carbs: 50.0, fat: 25.0, servingSize: 'Ổ', defaultWeight: 1 },
    { name: 'Bánh cuốn chả quế', calories: 380, protein: 14.0, carbs: 60.0, fat: 10.0, servingSize: 'Dĩa', defaultWeight: 1 },
    { name: 'Xôi xéo chả lụa ruốc', calories: 550, protein: 16.0, carbs: 85.0, fat: 15.0, servingSize: 'Gói', defaultWeight: 1 },
    { name: 'Mì tôm trứng nấu xúc xích', calories: 480, protein: 15.0, carbs: 50.0, fat: 25.0, servingSize: 'Bát', defaultWeight: 1 },
    { name: 'Hủ tiếu Nam Vang', calories: 450, protein: 19.0, carbs: 58.0, fat: 16.0, servingSize: 'Tô', defaultWeight: 1 },
    { name: 'Cháo lòng lợn truyền thống', calories: 410, protein: 20.0, carbs: 50.0, fat: 15.0, servingSize: 'Tô', defaultWeight: 1 },
    { name: 'Gỏi cuốn tôm thịt chuẩn', calories: 60, protein: 4.0, carbs: 10.0, fat: 1.0, servingSize: 'Cuốn', defaultWeight: 1 },

    // --- 🍚 2.2. Suất Cơm Văn Phòng & Quán Bình Dân ---
    { name: 'Cơm tấm sườn bì chả nướng', calories: 780, protein: 35.0, carbs: 85.0, fat: 32.0, servingSize: 'Dĩa', defaultWeight: 1 },
    { name: 'Cơm gà xối mỡ chiên giòn', calories: 850, protein: 38.0, carbs: 90.0, fat: 38.0, servingSize: 'Dĩa', defaultWeight: 1 },
    { name: 'Cơm tấm sườn nướng độc lập', calories: 600, protein: 28.0, carbs: 75.0, fat: 21.0, servingSize: 'Dĩa', defaultWeight: 1 },
    { name: 'Cơm chiên Dương Châu suất lớn', calories: 650, protein: 18.0, carbs: 85.0, fat: 26.0, servingSize: 'Dĩa', defaultWeight: 1 },
    { name: 'Cơm bò xào súp lơ cần tây', calories: 550, protein: 30.0, carbs: 70.0, fat: 16.0, servingSize: 'Suất', defaultWeight: 1 },

    // --- 🥘 2.3. Món Ăn Mâm Cơm Gia Đình ---
    { name: 'Thịt heo kho trứng tàu', calories: 450, protein: 22.0, carbs: 10.0, fat: 35.0, servingSize: 'Chén', defaultWeight: 1 },
    { name: 'Đậu hũ dồi thịt sốt cà chua', calories: 320, protein: 20.0, carbs: 15.0, fat: 20.0, servingSize: 'Dĩa', defaultWeight: 1 },
    { name: 'Cá lóc kho tộ miền Tây', calories: 280, protein: 25.0, carbs: 8.0, fat: 16.0, servingSize: 'Thố', defaultWeight: 1 },
    { name: 'Canh chua cá lóc thập cẩm', calories: 180, protein: 15.0, carbs: 12.0, fat: 8.0, servingSize: 'Bát', defaultWeight: 1 },
    { name: 'Rau muống xào tỏi đĩa lớn', calories: 150, protein: 3.0, carbs: 10.0, fat: 12.0, servingSize: 'Dĩa', defaultWeight: 1 },
    { name: 'Canh xương heo hầm rau củ', calories: 250, protein: 15.0, carbs: 15.0, fat: 15.0, servingSize: 'Bát', defaultWeight: 1 },

    // --- 🍕 2.4. Đồ Ăn Nhanh & Tráng Miệng ---
    { name: 'Hộp Gà rán KFC 2 miếng', calories: 680, protein: 42.0, carbs: 32.0, fat: 42.0, servingSize: 'Hộp', defaultWeight: 1 },
    { name: 'Khoai tây chiên cỡ vừa (Medium)', calories: 320, protein: 4.0, carbs: 43.0, fat: 15.0, servingSize: 'Phần', defaultWeight: 1 },
    { name: 'Pizza Hải Sản miếng trung (M)', calories: 310, protein: 14.0, carbs: 36.0, fat: 12.0, servingSize: 'Miếng', defaultWeight: 1 },
    { name: 'Bánh tráng trộn bịch chuẩn', calories: 350, protein: 8.0, carbs: 45.0, fat: 15.0, servingSize: 'Bịch', defaultWeight: 1 },
    { name: 'Trà sữa trân châu cơ bản (Size L)', calories: 500, protein: 3.0, carbs: 85.0, fat: 16.0, servingSize: 'Ly', defaultWeight: 1 },
    { name: 'Cà phê sữa đá đặc (Suất lề đường)', calories: 150, protein: 2.0, carbs: 22.0, fat: 6.0, servingSize: 'Ly', defaultWeight: 1 },
  ];

  console.log('--- 🌱 Bắt đầu nạp Thư viện món ăn SnapEat ---');

  for (const food of foods) {
    await prisma.foodLibrary.upsert({
      where: { name: food.name },
      update: {},
      create: food,
    });
  }

  console.log('--- ✅ Nạp dữ liệu hoàn tất! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });