// data/contentOptions.ts

export const bodyTypeOptions = {
    female: ['Cân đối, tự nhiên', 'Đường cong mềm mại, nữ tính', 'Vóc dáng đồng hồ cát, quyến rũ', 'Fitness model, săn chắc', 'Thanh mảnh, mình hạc xương mai (ethereal)', 'Đầy đặn, gợi cảm (voluptuous)', 'Mũm mĩm, đáng yêu'].sort(),
    male: ['Cân đối, thư sinh', 'Lịch lãm, cân đối', 'Lực lưỡng, vạm vỡ (bodybuilder)', 'Thân hình săn chắc, 6 múi (fitness)', 'Cao gầy, người mẫu (slim/fashion)', 'Phong trần, tự nhiên', 'Thân hình cường tráng (athletic)'].sort(),
    girl: ['Bụ bẫm, đáng yêu', 'Cân đối, tự nhiên', 'Mảnh mai, cao', 'Nhanh nhẹn, hoạt bát'],
    boy: ['Cân đối, tự nhiên', 'Hơi gầy, thư sinh', 'Hơi tròn, lém lỉnh', 'Khỏe khoắn, năng động']
};

const adultPoses = [
    // 1. Tư thế cơ bản (đứng)
    "Đứng thẳng, tay buông tự nhiên",
    "Đứng khoanh tay",
    "Đứng một tay chống hông (power pose)",
    "Đứng hai tay chống hông (supermodel pose)",
    "Đứng bắt chéo chân",
    "Đứng nghiêng hông (hip pop)",
    "Đứng quay nửa người, mặt hướng ống kính",
    "Đứng quay lưng, ngoái đầu nhìn lại",
    "Đứng khoanh tay sau lưng",
    "Đứng dang chân (tư thế mạnh mẽ)",
    // 2. Tư thế ngồi
    "Ngồi thẳng ghế, nhìn chính diện",
    "Ngồi bắt chéo chân (chair pose)",
    "Ngồi xoay ngang,ựa lưng ghế",
    "Ngồi một chân co, một chân duỗi",
    "Ngồi cúi người về phía trước",
    "Ngồi chống tay lên bàn/ghế",
    "Ngồi trên sàn, hai chân duỗi thẳng",
    "Ngồi trên sàn, ôm đầu gối",
    "Ngồi vắt vẻo (edge sitting pose)",
    "Ngồi ngửa lưng ra sau, tạo đường cong",
    "Sitting pose (ngồi)",
    // 3. Tư thế nằm
    "Nằm nghiêng, chống đầu bằng tay",
    "Nằm sấp, nâng cằm lên",
    "Nằm ngửa, một tay đặt lên trán",
    "Nằm vắt chéo chân (relax pose)",
    "Nằm cuộn tròn (foetus style, gợi cảm giác mềm mại)",
    "Nằm trên bụng, chân co lên phía sau",
    "Nằm trải dài toàn thân (glamour pose)",
    "Lying down (nằm, chụp từ trên xuống hoặc ngang)",
    // 4. Tư thế tay & cử chỉ
    "Tay chống hông",
    "Tay chạm tóc (hair touch)",
    "Tay vuốt tóc ngược ra sau",
    "Tay chạm môi (playful pose)",
    "Tay che mặt một phần (mysterious)",
    "Hai tay giơ cao lên trời",
    "Tay cầm phụ kiện (nón, hoa, áo khoác…)",
    "Tay chắp sau đầu (thư giãn)",
    "Tay tạo khung cho gương mặt (face frame pose)",
    // 5. Tư thế chân & chuyển động
    "Bước đi tự nhiên (walking pose)",
    "Bước dài như sải catwalk",
    "Bước ngang (side step)",
    "Nhảy lên (jump shot)",
    "Xoay người (twirl pose, váy bay)",
    "Ngồi xổm (squat pose)",
    "Ngả người dồn trọng tâm vào một chân",
    "Chân bắt chéo nhẹ (elegant stance)",
    "Walking shot (chụp khi đang bước đi)",
    "Hair flip (hất tóc)",
    "Toàn thân, đi về phía máy ảnh (Full body, walking towards camera)",
    "Twirling / spinning (xoay váy, xoay người)",
    // 6. Tư thế gợi cảm & high-fashion
    "Arch back (ưỡn lưng cong)",
    "Lean against wall (tựa tường)",
    "Ngửa đầu ra sau (dramatic fashion)",
    "Tay vuốt dọc cơ thể (seductive)",
    "Che một phần cơ thể bằng vải/phụ kiện",
    "Pose hở vai, trễ áo (off-shoulder pose)",
    "Ngồi dạng chân mạnh mẽ (powerful edgy)",
    "Pose “sẵn sàng catwalk” (runway prep)",
    // 7. Hướng nhìn & góc mặt
    "Back shot (từ phía sau)",
    "Candid / natural (tự nhiên, không nhìn máy)",
    "Looking away (nhìn ra ngoài khung)",
    "Looking down (cúi xuống)",
    "Looking up (ngẩng lên)",
    "Profile (nghiêng 90°)",
    "Three-quarter view (nghiêng 45°)",
    "Toàn thân, từ phía sau (Full body, from behind)",
    // 8. Tư thế sáng tạo / ý tưởng
    "Dùng vải che bay (flowing fabric pose)",
    "Pose tương tác với ghế/đạo cụ (chair, thang, hộp)",
    "Pose trong khung (cửa sổ, khung tranh)",
    "Pose cùng bóng đổ (shadow art)",
    "Tạo dáng với gương (mirror reflection)",
    "Pose phá cách (chân tay vặn xoắn, high-fashion editorial)",
    "Pose ngẫu nhiên (candid moment)",
    "Pose “freeze action” (dừng khoảnh khắc chuyển động)",
    "Pose với vật thể trong tay (sách, túi, điện thoại)",
    "Pose động tác thể thao / võ thuật (fitness, strong pose)"
];


export const poseOptions = {
    female: adultPoses.sort(),
    male: adultPoses.sort(),
    girl: [
        "Cười tít mắt", 
        "Chạy nhảy vui đùa", 
        "Làm mặt xấu đáng yêu",
        "Ngồi đọc truyện tranh", 
        "Múa ballet",
        "Ôm gấu bông",
        "Thổi bong bóng xà phòng",
        "Trang trí bánh cupcake"
    ],
    boy: [
        "Chơi đá bóng", 
        "Đọc sách phiêu lưu", 
        "Lái xe đạp",
        "Ngồi lắp ráp lego", 
        "Tạo dáng siêu anh hùng",
        "Thả diều",
        "Vẽ tranh",
        "Chơi game console"
    ]
};

export const contentOptions = {
    female: {
        contexts: ["Bãi biển Đà Nẵng", "Ban công view đẹp", "Bên cửa sổ ngắm thành phố", "Bên hồ bơi", "Bên bồn tắm thư giãn", "Bữa tối lãng mạn trên bãi biển", "Buổi hòa nhạc", "Chợ hoa", "Công viên giải trí", "Đọc sách trên giường", "Khu nghỉ dưỡng sang trọng (luxury resort)", "Lớp học làm gốm", "Lớp học nấu ăn", "Nhà hàng/khách sạn 5 sao", "Phòng GYM", "Phòng khách hiện đại", "Phòng ngủ ấm cúng", "Phòng tắm sang trọng", "Phòng tranh", "Phố cổ Hà Nội", "Quán bar jazz", "Quán cafe Sài Gòn", "Sân bay thương gia", "Sân golf", "Sân tennis", "Sân thượng (rooftop) buổi tối", "Siêu thị", "Spa thư giãn trong resort", "Studio chụp ảnh", "Sự kiện thảm đỏ", "Thư giãn trên sofa", "Thư giãn ở hồ bơi riêng tư", "Thư viện", "Tiệm bánh ngọt", "Trên du thuyền sang trọng", "Trên thuyền buồm", "Triển lãm nghệ thuật", "Trong bếp đang nấu ăn", "Trong bồn tắm đầy bọt", "Trong căn hộ cao cấp", "Uống trà ở ban công buổi sáng", "Villa riêng tư có hồ bơi", "Vườn hoa", "Yoga buổi sáng ở resort"].sort(),
        clothing: ["Áo choàng ngủ ren", "Áo choàng tắm lụa hờ hững", "Áo corset và quần da", "Áo crop-top siêu ngắn và quần short jean", "Áo dài truyền thống/cách tân", "Áo hai dây và quần short lụa", "Áo khoác dạ dáng dài", "Áo khoác lông sành điệu", "Áo khoác trench coat", "Áo len cổ lọ và chân váy", "Áo len oversize (kiểu giấu quần)", "Áo ống (bandeau) và chân váy xẻ", "Áo sơ mi trắng oversize (kiểu giấu quần)", "Áo sweater oversize", "Áo yếm hở lưng và quần short", "Bikini 2 mảnh dây mảnh", "Bikini cổ yếm (Halter bikini)", "Bikini tam giác siêu nhỏ (Micro bikini)", "Bikini/Đồ bơi nghệ thuật", "Bodysuit ren mặc cùng quần jean ống rộng", "Bodysuit ren tinh xảo", "Bohemian (du mục)", "Bộ đồ lót ren nghệ thuật", "Bộ đồ mặc nhà cotton", "Bộ đồ ngủ co-ord ren và lụa", "Bộ đồ tập GYM", "Bộ pijama lụa satin", "Bộ suit len (wool suit)", "Business-casual", "Chân váy da siêu ngắn", "Cyberpunk", "Dạo phố (casual)", "Đầm bodycon hở lưng sâu", "Đồ bơi một mảnh khoét eo", "Đồ da cá tính", "Đồ ngủ satin kiểu Pháp (negligee)", "Gothic", "Nội y ren nghệ thuật", "Nội y ren xuyên thấu nghệ thuật", "Nội y thể thao", "Phong cách Nữ thần", "Preppy (học đường)", "Quần cạp trễ và áo crop-top", "Quần short siêu ngắn và áo hai dây", "Streetwear (hoodie, sneaker)", "Thanh lịch (công sở)", "Tối giản (Minimalist)", "Trang phục Cosplay", "Trang phục cut-out táo bạo", "Trang phục thể thao/yoga", "Váy bodycon siêu ngắn", "Váy da bó", "Váy dạ hội quyến rũ", "Váy hai dây lụa xẻ tà cao", "Váy hai dây mini ôm sát", "Váy len body ấm áp", "Váy lưới nghệ thuật mặc ngoài bodysuit", "Váy lụa hai dây mỏng manh", "Váy maxi hở lưng", "Váy ngủ hai dây", "Váy ngủ lụa gợi cảm", "Váy ngủ lụa mỏng manh", "Váy xuyên thấu nghệ thuật (với lớp lót tinh tế)", "Vintage/Retro"].sort(),
        styles: ["Bí ẩn, ma mị", "Cá tính, 'cool ngầu'", "Cổ điển (classic)", "Đơn giản, mộc mạc", "Giản dị, mộc mạc", "Hoang dã, tự do", "Hiện đại, thành thị", "Mộng mơ, bay bổng", "Nàng thơ, nghệ thuật", "Ngọt ngào, trong sáng", "Nổi loạn, phá cách", "Phiêu lưu, khám phá", "Quyến rũ, bí ẩn", "Sang chảnh, kiêu kỳ", "Sang trọng, quyền lực", "Streetwear/Hiphop", "Thanh lịch, tinh tế", "Thể thao, năng động", "Thư thái, nhẹ nhàng", "Trí thức, điềm đạm", "Tương lai (futuristic)", "Vintage/Retro", "Vui vẻ, hoạtát"].sort()
    },
    male: {
        contexts: ["Bên quầy bar tại nhà", "Bến du thuyền", "Buổi hòa nhạc rock", "Câu lạc bộ đêm", "Chơi console game trên sofa", "Chơi nhạc cụ (guitar/piano)", "Đọc sách trên ghế bành", "Đường đua xe", "Đường phố đô thị", "Garage sửa xe cổ", "Khu nghỉ dưỡng trên núi", "Làm việc tại nhà", "Leo núi trong nhà", "Nhà xưởng, garage", "Nghe nhạc thư giãn trong phòng ngủ", "Phòng GYM", "Phòng họp ban giám đốc", "Phòng lab công nghệ", "Phòng khách sang trọng", "Quán bar, lounge", "Quán cafe sách", "Quán rượu whisky", "Quầy bar cạnh hồ bơi ở resort", "Sảnh chờ resort cao cấp", "Sân bóng rổ", "Sân golf", "Sân tennis", "Studio chụp ảnh", "Sự kiện thảm đỏ", "Thư giãn tại spa resort", "Thư viện cổ", "Tiệm cafe", "Trên núi, trekking", "Trong bồn tắm", "Trong hồ bơi", "Trong căn hộ penthouse", "Trong bếp pha cafe", "Trong xe hơi sang trọng", "Văn phòng làm việc hiện đại", "Villa hướng biển"].sort(),
        clothing: ["Áo choàng tắm (bathrobe)", "Áo hoodie và quần jogger", "Áo khoác bomber", "Áo khoác da (biker jacket)", "Áo khoác da lộn", "Áo khoác dạ", "Áo khoác phao", "Áo len cổ lọ", "Áo sơ mi linen", "Bộ đồ ngủ pijama", "Bộ đồ trekking", "Bộ suit lịch lãm", "Cardigan len", "Cyberpunk", "Đồ da", "Đồ đi phượt", "Đồ mặc nhà (quần đùi và áo thun)", "Đồ thể thao nam tính", "Đồ vintage", "Gothic", "Overcoat dài", "Phong cách Business-casual", "Phong cách Casual (áo polo, quần khaki)", "Phong cách Preppy", "Quân đội (military)", "Quần bơi nam", "Quần short thể thao", "Smart-casual", "Streetwear (hoodie, sneaker)", "Trang phục công sở (sơ mi, quần tây)", "Trang phục đi biển", "Trang phục rock-chic", "Trang phục truyền thống (áo dài nam)"].sort(),
        styles: ["Bí ẩn, lạnh lùng", "Bụi bặm, đường phố", "Công nghệ, tương lai", "Cổ điển, hoài niệm", "Chất phác, thật thà", "Đam mê, nhiệt huyết", "Doanh nhân thành đạt", "Geek-chic, thông minh", "Hào hoa, phong nhã", "Lãng tử, nghệ sĩ", "Lịch lãm, trưởng thành", "Năng động, thể thao", "Nổi loạn, gai góc", "Phiêu lưu, mạo hiểm", "Phong trần, từng trải", "Sang trọng, quyền quý", "Thân thiện, hòa đồng", "Thư sinh", "Tối giản, tinh tế", "Trí thức, học giả", "Vui tính, hài hước"].sort()
    },
    girl: {
        contexts: ["Bãi biển", "Bảo tàng khoa học", "Bữa tiệc sinh nhật", "Công viên giải trí", "Công viên nước", "Cửa hàng đồ chơi", "Cửa hàng kẹo", "Dã ngoại trong công viên", "Khu vườn cổ tích", "Khu vui chơi nhà bóng", "Lễ hội hóa trang", "Lớp học ballet", "Lớp học làm bánh", "Lớp học vẽ", "Phòng ngủ trang trí dễ thương", "Rạp xiếc", "Sân băng", "Studio chụp ảnh cho bé", "Thư viện thiếu nhi", "Trang trại, nông trại", "Vườn bách thú"].sort(),
        clothing: ["Áo choàng có mũ", "Áo dài trẻ em", "Áo khoác len cardigan", "Bộ đồ làm vườn", "Bộ đồ thủy thủ", "Đồ bơi cho bé", "Đồ đôi mẹ và bé", "Đồ đi học (đồng phục, balo)", "Pijama hình thú", "Quần legging và áo thun in hình", "Trang phục dân tộc", "Trang phục hóa trang (công chúa, tiên nữ)", "Trang phục múa lân", "Trang phục Noel", "Trang phục thể thao cho bé", "Váy ballet", "Váy công chúa", "Váy vintage hoa nhí", "Váy xếp ly", "Váy yếm jean"].sort(),
        styles: ["Cá tính, mạnh mẽ", "Chững chạc, ra dáng người lớn", "Dịu dàng, nữ tính", "Điệu đà, làm duyên", "Đáng yêu, ngây thơ", "E thẹn, nhút nhát", "Hài hước, lém lỉnh", "Hướng ngoại", "Hướng nội", "Mộng mơ, cổ tích", "Năng động, tinh nghịch", "Thông minh, lanh lợi", "Thích nghệ thuật", "Thích âm nhạc", "Thích đọc sách", "Thích thể thao", "Tò mò, ham khám phá", "Vui vẻ, hoạtát", "Yêu động vật", "Yêu màu hồng", "Yêu thiên nhiên"].sort()
    },
    boy: {
        contexts: ["Bãi biển xây lâu đài cát", "Bảo tàng khủng long", "Bể bơi", "Bến cảng", "Câu lạc bộ cờ vua", "Công viên skate", "Đường đua xe đạp", "Khu rừng thám hiểm", "Lớp học khoa học", "Lớp học lập trình robot", "Lớp võ karate", "Nhà trên cây", "Phòng chơi game", "Phòng thí nghiệm mini", "Sân bay", "Sân bóng đá", "Sân bóng rổ đường phố", "Studio chụp ảnh cho bé", "Trại hè, cắm trại", "Trạm vũ trụ đồ chơi", "Trường học", "Xưởng lắp ráp robot"].sort(),
        clothing: ["Áo dài cách tân nam", "Áo khoác hoodie và quần jogger", "Áo khoác jean", "Áo len", "Áo thun in hình khủng long/xe hơi", "Bộ đồ bác sĩ", "Bộ đồ thám hiểm", "Bộ vest cho bé trai", "Đồ đi biển", "Đồ đi học (đồng phục, balo)", "Pijama, đồ ngủ", "Quần áo lính cứu hỏa", "Quần áo siêu anh hùng", "Quần short kaki", "Quần yếm và áo thun", "Trang phục cao bồi", "Trang phục nhà khoa học", "Trang phục ninja", "Trang phục phi hành gia", "Trang phục thể thao (bóng đá, bóng rổ)"].sort(),
        styles: ["Dũng cảm, mạnh mẽ", "Dễ thương, hoạtát", "Gan dạ, không sợ hãi", "Hài hước, lém lỉnh", "Hiếu động, tinh nghịch", "Hòa đồng, thân thiện", "Lãnh đạo", "Mê xe hơi", "Năng động, dũng cảm", "Nghệ sĩ, sáng tạo", "Nghiêm túc, chững chạc", "Ngầu, cá tính", "Thích âm nhạc", "Thích khám phá", "Thích đọc truyện tranh", "Thích sáng tạo, lắp ráp", "Thích thể thao", "Thông minh, ham học hỏi", "Trầm tính, ít nói", "Yêu động vật", "Yêu thiên nhiên"].sort()
    }
};

export const cameraAngleOptions = [
    // Ánh sáng (Lighting)
    "Ánh sáng: Chụp bóng đêm nghệ thuật (Artistic Night Shot)",
    "Ánh sáng: Chơi với bóng đổ (Shadow Play)",
    "Ánh sáng: Cửa sổ (Window Lighting)",
    "Ánh sáng: Giờ vàng (Golden Hour)",
    "Ánh sáng: Giờ xanh (Blue Hour)",
    "Ánh sáng: High Key (Tông sáng)",
    "Ánh sáng: Low Key (Tông tối)",
    "Ánh sáng: Màu (Color Gel Lighting)",
    "Ánh sáng: Mềm (Soft Light)",
    "Ánh sáng: Ngược sáng (Backlight / Rim Light)",
    "Ánh sáng: Silhouette (Chụp bóng)",
    "Ánh sáng: Ánh sáng gắt (Hard Light)",
    
    // Bố cục (Composition)
    "Bố cục: Khung trong khung (Frame within a Frame)",
    "Bố cục: Quy tắc 1/3 (Rule of Thirds)",
    "Bố cục: Tỷ lệ vàng (Golden Ratio)",
    "Bố cục: Đối xứng (Symmetry)",
    "Bố cục: Đường dẫn (Leading Lines)",

    // Chuyển động (Motion)
    "Chuyển động: Lia máy (Panning)",
    "Chuyển động: Làm mờ chuyển động (Motion Blur)",
    "Chuyển động: Đóng băng hành động (Freeze Motion)",
    "Chuyển động: Zoom Burst",

    // Góc máy (Camera Angle)
    "Góc máy: Góc cao (High Angle)",
    "Góc máy: Góc nghiêng (Dutch Angle)",
    "Góc máy: Góc thấp (Low Angle)",
    "Góc máy: Mắt chim (Bird's-eye View, từ trên xuống)",
    "Góc máy: Mắt sâu (Worm's-eye View, từ đất lên)",
    "Góc máy: Ngang tầm mắt (Eye-level)",
    "Góc máy: Qua vai (Over-the-shoulder)",
    "Góc máy: Góc nhìn chủ quan (POV - Point of View)",

    // Khoảng cách & Khung hình (Framing & Distance)
    "Khoảng cách: Cận cảnh (Close-up)",
    "Khoảng cách: Chân dung (Headshot, từ vai trở lên)",
    "Khoảng cách: Cảnh 3/4 (Three-quarter Shot, từ đầu gối lên)",
    "Khoảng cách: Siêu cận cảnh (Extreme Close-up)",
    "Khoảng cách: Toàn cảnh (Long Shot, thấy môi trường)",
    "Khoảng cách: Toàn thân (Full Body Shot)",
    "Khoảng cách: Trung-cận (Medium Close-up, từ ngực lên)",
    "Khoảng cách: Trung cảnh (Medium Shot, từ hông lên)",
    "Khoảng cách: Viễn cảnh (Extreme Long Shot, người nhỏ trong cảnh lớn)",
    "Khung hình: Chân dung môi trường (Environmental Portrait)",

    // Ống kính & Kỹ thuật (Lens & Technique)
    "Kỹ thuật: Chồng ảnh (Double Exposure)",
    "Kỹ thuật: Chụp qua gương/phản chiếu (Reflection Shot)",
    "Kỹ thuật: Lóe sáng (Lens Flare)",
    "Ống kính: Góc rộng (Wide-angle)",
    "Ống kính: Mắt cá (Fisheye)",
    "Ống kính: Tele (Telephoto Compression)",
    "Ống kính: Xóa phông (Shallow Depth of Field / Bokeh)",
].sort();

export const mirrorSelfieContextOptions = [
    "Trong thang máy hiện đại, ánh sáng lạnh",
    "Trong phòng tắm sang trọng, có bồn tắm phía sau",
    "Trong phòng thay đồ ở phòng gym",
    "Qua gương ô tô, ánh sáng tự nhiên buổi sáng",
    "Qua gương soi toàn thân trong phòng ngủ",
    "Qua một chiếc gương cổ điển, có khung trang trí công phu",
    "Qua gương bẩn hoặc có vệt nước, tạo hiệu ứng nghệ thuật",
    "Trong phòng gương (infinity mirror room)"
].sort();

export const handheldSelfieContextOptions = [
    "Tại một lễ hội âm nhạc, đám đông phía sau",
    "Trên đỉnh núi với quang cảnh hùng vĩ",
    "Trên bãi biển lúc hoàng hôn",
    "Trong một quán cafe đông đúc",
    "Trên đường phố nhộn nhịp về đêm, ánh đèn neon",
    "Trong một khu vườn đầy hoa",
    "Khi đang nằm trên giường, góc chụp từ trên xuống"
].sort();

export const aspectRatioOptions = [
    'Vuông (1:1)',
    'Dọc (9:16)',
    'Ngang (16:9)',
    'Ngang Cực Rộng (21:9)',
    'Chân dung (3:4)',
    'Cổ điển (4:3)'
];

export const interactionOptions = [
    // General & Friendly
    "Đứng cạnh nhau, nhìn vào ống kính và mỉm cười",
    "Đang trò chuyện vui vẻ và cười với nhau",
    "Cùng nhau đi dạo",
    "Khoác vai nhau thân thiện",
    "High-five (đập tay)",
    "Cùng nhìn về một hướng, vẻ mặt suy tư",
    "Ngồi trên ghế sofa, thư giãn",
    "Tựa lưng vào nhau",
    "Cụng ly (cheers)",

    // Romantic
    "Nắm tay nhau đi dạo",
    "Nhìn vào mắt nhau trìu mến",
    "Một người ôm từ phía sau",
    "Khiêu vũ cùng nhau",
    "Cùng nhau ngắm hoàng hôn",
    "Hôn nhẹ lên má/trán",
    "Tựa đầu vào vai nhau",

    // Professional & Colleagues
    "Bắt tay chuyên nghiệp",
    "Cùng nhau thảo luận trên một tài liệu/máy tính bảng",
    "Đứng trong một cuộc họp, trình bày ý tưởng",
    "Đi cạnh nhau trong văn phòng",
    "Chụp ảnh nhóm công ty",

    // Family
    "Gia đình đang quây quần bên nhau",
    "Cha mẹ đang chơi đùa cùng con cái",
    "Anh chị em trêu chọc nhau",
    "Cả nhà cùng nấu ăn",

    // Action & Dynamic
    "Cùng nhau chơi một môn thể thao (ví dụ: tennis, bóng rổ)",
    "Chạy đua với nhau",
    "Đối đầu trong một cuộc thi",
    "Cùng nhau khám phá một địa điểm mới",
    "Nhảy lên không trung cùng lúc",

    // High Fashion & Editorial
    "Đứng cạnh nhau với biểu cảm lạnh lùng, high-fashion",
    "Tạo dáng đối xứng",
    "Tạo dáng phức tạp, chồng chéo lên nhau một cách nghệ thuật",
    "Một người ngồi, một người đứng phía sau",
].sort();


export const strategyOptions = {
    female: {
        channel: {
            goals: ['Xây dựng thương hiệu cá nhân về thời trang bền vững.', 'Trở thành chuyên gia về chăm sóc da khoa học.', 'Tăng nhận diện cho thương hiệu mỹ phẩm handmade.', 'Thu hút 10,000 học viên cho khóa học yoga online.', 'Xây dựng cộng đồng về lối sống tối giản và hạnh phúc.', 'Tạo kênh podcast về phát triển bản thân cho phụ nữ.', 'Trở thành influencer du lịch sang chảnh.'],
            niches: ['Thời trang & Làm đẹp', 'Fitness & Sức khỏe tinh thần', 'Du lịch & Khám phá văn hóa', 'Ẩm thực & Nấu ăn tại nhà', 'Phát triển bản thân & Sự nghiệp', 'Trang trí nhà cửa & Lối sống', 'Đầu tư tài chính cho phái nữ', 'Nghệ thuật & Sáng tạo']
        },
        funnel: {
            products: ['Khóa học online "7 ngày detox cơ thể"', 'Ebook "Bí quyết xây dựng tủ đồ con nhộng"', 'Dịch vụ coaching 1:1 về xây dựng thương hiệu cá nhân', 'Bộ mỹ phẩm organic "Pure Glow"', 'Workshop "Kỹ năng nói trước công chúng"', 'Gói membership cho cộng đồng riêng', 'Buổi tư vấn thiết kế nội thất online'],
            audiences: ['Phụ nữ văn phòng 25-40 tuổi, muốn cải thiện sức khỏe nhưng bận rộn.', 'Sinh viên mới ra trường, tìm kiếm định hướng phong cách cá nhân.', 'Nữ chủ doanh nghiệp nhỏ muốn tối ưu marketing online.', 'Người nội trợ muốn học nấu ăn ngon và lành mạnh.', 'Phụ nữ muốn vượt qua nỗi sợ và tự tin hơn.', 'Freelancer muốn tăng thu nhập và tìm kiếm khách hàng.']
        },
        offer: {
            products: ['Ebook "Bí quyết trang điểm tự nhiên"', 'Template Kế hoạch Chăm sóc bản thân', 'Bộ preset chỉnh ảnh Lightroom tone "Nàng thơ"', 'Khóa học mini "Thiền cho người mới bắt đầu"', 'Checklist "Dọn dẹp nhà cửa trong 30 phút"'],
            problems: ['Không biết cách trang điểm đi làm hàng ngày.', 'Cảm thấy kiệt sức, không có thời gian cho bản thân.', 'Ảnh chụp "sống ảo" không đẹp, không thu hút.', 'Cảm thấy căng thẳng, khó tập trung trong công việc.', 'Không gian sống bừa bộn, ảnh hưởng tâm trạng.']
        },
        landing: {
            products: ['Bộ mỹ phẩm organic "Pure Glow"', 'Chương trình mentoring "Xây dựng sự nghiệp freelancer thành công"', 'Ứng dụng di động về thiền và giấc ngủ', 'Vé tham dự sự kiện "Women Empowerment Summit"', 'Bộ sưu tập thời trang mới nhất'],
            audiences: ['Phụ nữ 20-35 tuổi, da nhạy cảm, yêu thích sản phẩm tự nhiên.', 'Phụ nữ đang làm việc tự do hoặc muốn chuyển sang làm freelancer.', 'Người trẻ muốn cải thiện sức khỏe tinh thần.', 'Nữ lãnh đạo, chủ doanh nghiệp muốn kết nối và học hỏi.', 'Tín đồ thời trang tìm kiếm phong cách độc đáo.'],
            ctas: ['Đặt hàng ngay để sở hữu làn da rạng rỡ!', 'Đăng ký ngay để thay đổi sự nghiệp của bạn!', 'Tải ứng dụng miễn phí và bắt đầu hành trình bình yên!', 'Mua vé ngay hôm nay!', 'Khám phá bộ sưu tập ngay!']
        }
    },
    male: {
        channel: {
            goals: ['Trở thành nguồn thông tin đáng tin cậy về đầu tư tài chính cá nhân.', 'Xây dựng kênh review công nghệ số 1 Việt Nam.', 'Tạo cộng đồng về thể hình và dinh dưỡng cho người bận rộn.', 'Chia sẻ kinh nghiệm khởi nghiệp và phát triển kinh doanh.', 'Review và đánh giá các dòng xe hơi mới nhất.', 'Trở thành một travel blogger khám phá những vùng đất mạo hiểm.'],
            niches: ['Công nghệ & Review sản phẩm', 'Tài chính cá nhân & Đầu tư', 'Fitness & Thể hình', 'Kinh doanh & Khởi nghiệp', 'Xe cộ & Đam mê tốc độ', 'Phong cách sống & Phát triển bản thân cho nam giới', 'Du lịch mạo hiểm & Phượt', 'Gaming & E-sports']
        },
        funnel: {
            products: ['Khóa học "Đầu tư chứng khoán cho người mới bắt đầu"', 'Template "Bảng kế hoạch tài chính cá nhân"', 'Dịch vụ tư vấn chiến lược kinh doanh 1:1', 'Bộ sản phẩm chăm sóc râu và tóc "The Gentleman"', 'Vé tham dự workshop "Tối ưu hiệu suất công việc"', 'Gói mentoring 1:1 về giao dịch crypto', 'Series video độc quyền về độ xe'],
            audiences: ['Nam giới 22-35 tuổi, muốn gia tăng thu nhập thụ động.', 'Người yêu công nghệ, luôn tìm kiếm sản phẩm mới.', 'Chủ doanh nghiệp nhỏ đang gặp khó khăn trong vận hành.', 'Nam giới quan tâm đến ngoại hình và phong cách.', 'Nhân viên văn phòng muốn thăng tiến trong sự nghiệp.', 'Người mới tìm hiểu về thị trường tiền điện tử.']
        },
        offer: {
            products: ['Ebook "5 bước xây dựng thói quen hiệu quả"', 'Checklist "Tối ưu góc làm việc tại nhà"', 'Bộ preset chỉnh ảnh Lightroom tone "Doanh nhân"', 'Khóa học mini "Nhập môn về Blockchain"', 'Hướng dẫn "Các bài tập 5 phút tại văn phòng"'],
            problems: ['Làm việc kém hiệu quả, dễ bị xao nhãng.', 'Không gian làm việc bừa bộn, thiếu cảm hứng.', 'Hình ảnh cá nhân trên mạng xã hội thiếu chuyên nghiệp.', 'Muốn tìm hiểu về công nghệ mới nhưng không biết bắt đầu từ đâu.', 'Ngồi nhiều, bị đau lưng và mỏi vai gáy.']
        },
        landing: {
            products: ['Bộ sản phẩm chăm sóc da cho nam "Active Men"', 'Chương trình huấn luyện "6 tuần thay đổi vóc dáng"', 'Ứng dụng di động theo dõi danh mục đầu tư', 'Vé tham dự sự kiện "Vietnam Tech Summit"', 'Đồng hồ thông minh phiên bản giới hạn'],
            audiences: ['Nam giới 25-45 tuổi, quan tâm đến việc chăm sóc bản thân.', 'Người muốn có thân hình săn chắc nhưng không có thời gian đến phòng gym.', 'Nhà đầu tư cá nhân muốn quản lý tài sản hiệu quả.', 'Lập trình viên, kỹ sư, người làm trong ngành công nghệ.', 'Người đam mê phụ kiện và đồng hồ cao cấp.'],
            ctas: ['Trải nghiệm ngay để thấy sự khác biệt!', 'Bắt đầu hành trình lột xác của bạn!', 'Tải ứng dụng và quản lý tài chính thông minh!', 'Giữ chỗ của bạn tại sự kiện công nghệ lớn nhất năm!', 'Đặt mua ngay phiên bản giới hạn!']
        }
    },
    girl: {
        channel: {
            goals: ['Tạo kênh review đồ chơi an toàn và sáng tạo cho bé gái.', 'Xây dựng một kênh giải trí với các thử thách vui nhộn.', 'Chia sẻ các dự án nghệ thuật và thủ công (DIY) dễ làm.', 'Kể những câu chuyện cổ tích và bài học ý nghĩa.', 'Hướng dẫn các điệu nhảy K-Pop đơn giản cho trẻ em.'],
            niches: ['Review đồ chơi', 'Nghệ thuật & Thủ công (DIY)', 'Kể chuyện & Đọc sách', 'Nhảy múa & Âm nhạc', 'Thử thách vui nhộn (Fun challenges)', 'Học tiếng Anh qua bài hát']
        },
        funnel: {
            products: ['Bộ kit làm đồ thủ công "Công chúa sáng tạo"', 'Sách tô màu nhân vật độc quyền', 'Khóa học online "Học vẽ nhân vật hoạt hình"', 'Hộp đồ chơi bất ngờ hàng tháng', 'Album nhạc thiếu nhi do KOL thể hiện'],
            audiences: ['Các bé gái từ 5-10 tuổi yêu thích sáng tạo.', 'Phụ huynh tìm kiếm hoạt động giải trí lành mạnh cho con.', 'Trẻ em thích vẽ và muốn phát triển kỹ năng.', 'Các bé thích sưu tầm đồ chơi và khám phá điều mới.']
        },
        offer: {
            products: ['Giấy dán tường (Sticker) nhân vật độc quyền', 'File PDF bộ tranh tô màu miễn phí', 'Video hướng dẫn làm vòng tay tình bạn', 'Checklist "Những cuốn sách hay nên đọc"'],
            problems: ['Căn phòng của bé trông nhàm chán.', 'Bé không biết chơi gì vào cuối tuần.', 'Bé muốn làm quà tặng bạn bè nhưng không biết làm gì.', 'Phụ huynh muốn khuyến khích con đọc sách.']
        },
        landing: {
            products: ['Búp bê nhân vật "Cô bé Mộng Mơ"', 'Bộ dụng cụ làm bánh cupcake cho trẻ em', 'Vé tham gia buổi fan meeting và workshop', 'Ứng dụng game giáo dục "Cuộc phiêu lưu kỳ thú"'],
            audiences: ['Bé gái là fan hâm mộ của kênh.', 'Phụ huynh muốn mua quà sinh nhật ý nghĩa cho con.', 'Gia đình tìm kiếm hoạt động cuối tuần.', 'Phụ huynh muốn con vừa chơi vừa học.'],
            ctas: ['Rước ngay bé búp bê về nhà!', 'Đặt mua ngay để cùng bé trổ tài làm bánh!', 'Gặp gỡ thần tượng và nhận quà đặc biệt!', 'Tải game và bắt đầu cuộc phiêu lưu ngay!']
        }
    },
    boy: {
        channel: {
            goals: ['Trở thành kênh unbox và review LEGO hàng đầu.', 'Thực hiện các thí nghiệm khoa học vui và dễ hiểu tại nhà.', 'Hướng dẫn chơi và stream các tựa game thân thiện với trẻ em.', 'Xây dựng các mô hình xe hơi, máy bay.', 'Chia sẻ kiến thức về thế giới khủng long và động vật hoang dã.'],
            niches: ['Gaming & Hướng dẫn', 'Khoa học & Thí nghiệm', 'Lắp ráp mô hình (LEGO, Gundam)', 'Khám phá thế giới động vật', 'Review sách và truyện tranh phiêu lưu', 'Thể thao (bóng đá, bóng rổ)']
        },
        funnel: {
            products: ['Bộ kit "Thí nghiệm khoa học tại nhà"', 'Khóa học online "Lập trình game cơ bản với Scratch"', 'Mô hình robot lắp ráp độc quyền', 'Ebook "Khám phá thế giới khủng long"', 'Áo thun in hình nhân vật game của kênh'],
            audiences: ['Các bé trai 6-12 tuổi tò mò, ham học hỏi.', 'Phụ huynh muốn con tiếp cận khoa học một cách thú vị.', 'Trẻ em yêu thích công nghệ và muốn tự tạo game.', 'Các bé thích sưu tầm và lắp ráp mô hình.']
        },
        offer: {
            products: ['Poster các loại xe đua thể thao', 'Video hướng dẫn ảo thuật đơn giản', 'Template "Nhật ký khám phá khoa học"', 'Bộ sưu tập hình dán (sticker) siêu anh hùng'],
            problems: ['Bé muốn trang trí phòng ngủ thật ngầu.', 'Bé muốn gây bất ngờ cho bạn bè.', 'Phụ huynh muốn con ghi lại quá trình học tập.', 'Bé thích sưu tầm và trao đổi sticker.']
        },
        landing: {
            products: ['Bộ đồ chơi lắp ráp "Robot đại chiến"', 'Vé tham dự "Ngày hội Khoa học Nhí"', 'Sách truyện tranh "Cuộc phiêu lưu của Siêu nhân Tí hon"', 'Ứng dụng học lập trình qua trò chơi'],
            audiences: ['Bé trai là fan của kênh và yêu thích robot.', 'Gia đình tìm kiếm sự kiện khoa học cho trẻ.', 'Phụ huynh muốn con đọc truyện tranh có tính giáo dục.', 'Phụ huynh muốn con làm quen với lập trình sớm.'],
            ctas: ['Sở hữu ngay Robot Bất khả chiến bại!', 'Đăng ký tham gia và nhận quà hấp dẫn!', 'Đặt mua sách ngay hôm nay!', 'Tải app và trở thành nhà lập trình nhí!']
        }
    }
};

export const calendarTopicOptions = {
    female: ['Thời trang & Làm đẹp', 'Fitness & Sức khỏe tinh thần', 'Du lịch & Khám phá văn hóa', 'Ẩm thực & Nấu ăn tại nhà', 'Phát triển bản thân & Sự nghiệp', 'Trang trí nhà cửa & Lối sống', 'Đầu tư tài chính cho phái nữ', 'Nghệ thuật & Sáng tạo', 'Hẹn hò & Mối quan hệ', 'Mẹo vặt cuộc sống'].sort(),
    male: ['Công nghệ & Review sản phẩm', 'Tài chính cá nhân & Đầu tư', 'Fitness & Thể hình', 'Kinh doanh & Khởi nghiệp', 'Xe cộ & Đam mê tốc độ', 'Phong cách sống & Phát triển bản thân', 'Du lịch mạo hiểm & Phượt', 'Gaming & E-sports', 'Kỹ năng sinh tồn', 'DIY & Sửa chữa nhà cửa'].sort(),
    girl: ['Review đồ chơi', 'Nghệ thuật & Thủ công (DIY)', 'Kể chuyện & Đọc sách', 'Nhảy múa & Âm nhạc', 'Thử thách vui nhộn', 'Học tiếng Anh qua bài hát', 'Khám phá khoa học vui', 'Tìm hiểu về động vật', 'Hoạt động ngoài trời', 'Học các kỹ năng mới'].sort(),
    boy: ['Review đồ chơi', 'Nghệ thuật & Thủ công (DIY)', 'Kể chuyện & Đọc sách', 'Nhảy múa & Âm nhạc', 'Thử thách vui nhộn', 'Học tiếng Anh qua bài hát', 'Khám phá khoa học vui', 'Tìm hiểu về động vật', 'Hoạt động ngoài trời', 'Học các kỹ năng mới'].sort(),
};

export const museOptions = {
    outfits: [
        "Áo choàng voan dài quét đất",
        "Bodysuit ren tinh xảo",
        "Bộ đồ lụa gồm crop top và chân váy dài",
        "Bộ đồ lót ren nghệ thuật",
        "Nội y lụa cao cấp",
        "Trang phục 'ướt át' (wet look dress)",
        "Trang phục bằng vải lưới (mesh) nghệ thuật",
        "Trang phục nữ thần Hy Lạp (chiton)",
        "Trang phục tiên nữ (fairy-like costume)",
        "Váy ballet tu-tu cách điệu",
        "Váy có tà dài bay trong gió",
        "Váy cổ yếm (halter dress)",
        "Váy dạ hội đuôi cá",
        "Váy đính cườm, sequin lấp lánh",
        "Váy làm từ chất liệu metallic lỏng (liquid metal fabric)",
        "Váy làm từ những dải lụa quấn quanh người",
        "Váy lụa mỏng manh bay bổng",
        "Váy lụa satin hở lưng",
        "Váy nhung đen huyền bí",
        "Váy organza phồng, bồng bềnh",
        "Váy ren trắng dài, xuyên thấu nghệ thuật",
        "Váy trễ vai (off-shoulder)",
        "Váy voan mỏng màu pastel (hồng phấn, xanh baby)",
        "Váy voan trắng nhiều lớp",
        "Váy yếm lụa (slip dress)"
    ].sort(),
    accessories: [
        "Áo giáp trang trí nghệ thuật (fantasy armor pieces)",
        "Body chain vàng/bạc mảnh",
        "Bụi kim tuyến lấp lánh trên da",
        "Cánh bướm tiên nữ (fairy wings)",
        "Cánh thiên thần lớn bằng lông vũ trắng",
        "Chuỗi ngọc trai quấn quanh tóc",
        "Dải lụa quấn quanh người",
        "Găng tay lụa dài qua khuỷu",
        "Hoa cài tóc (cài một bông hoa lớn)",
        "Hoa tai dài và cầu kỳ",
        "Khăn choàng lông vũ",
        "Không có phụ kiện đặc biệt",
        "Kiếm trang trí (fantasy sword)",
        "Mạng che mặt bằng ren hoặc lưới",
        "Mặt nạ vũ hội (masquerade mask)",
        "Một quả cầu pha lê trong tay",
        "Những cánh bướm giả đậu trên người",
        "Những sợi dây chuyền pha lê rủ xuống",
        "Quạt lông vũ",
        "Trang sức bạc tinh xảo",
        "Trang sức bằng ngọc trai",
        "Vòng hoa đội đầu",
        "Vương miện pha lê"
    ].sort(),
    backgrounds: [
        "Bối cảnh siêu thực, hành tinh khác",
        "Bên một cây đàn piano lớn",
        "Bên một hồ nước trong xanh, tĩnh lặng",
        "Bên một thác nước hùng vĩ",
        "Bên cạnh một tác phẩm điêu khắc cổ điển",
        "Cung điện băng giá",
        "Dưới bầu trời đêm đầy sao",
        "Dưới nước (underwater)",
        "Giữa một cánh đồng hoa oải hương (lavender)",
        "Giữa một cơn mưa sao băng",
        "Ngồi trên mặt trăng lưỡi liềm",
        "Phòng khiêu vũ lộng lẫy",
        "Phòng ngủ cổ điển kiểu Pháp",
        "Studio tối giản với ánh sáng trắng mềm",
        "Trên cầu thang xoắn ốc bằng đá cẩm thạch",
        "Trên một con thuyền hoa trôi trên sông",
        "Trên một đám mây bồng bềnh",
        "Trên một vách đá nhìn ra biển",
        "Trong khu vườn thần tiên, huyền ảo",
        "Trong một khu rừng đầy sương mù",
        "Trong một lâu đài cổ kính, đổ nát",
        "Trong một nhà kính đầy cây cỏ nhiệt đới",
        "Trong một ngôi đền bị lãng quên",
        "Trong một thư viện cổ, đầy sách"
    ].sort(),
    lighting: [
        "Ánh nến lung linh, ấm áp",
        "Ánh sáng bình minh (blue hour)",
        "Ánh sáng chiếu qua kính màu (stained glass)",
        "Ánh sáng chiếu qua mặt nước (caustic light)",
        "Ánh sáng chiếu qua rèm cửa mỏng",
        "Ánh sáng High-key (tông sáng, trong trẻo)",
        "Ánh sáng hoàng hôn (golden hour)",
        "Ánh sáng lốm đốm qua tán lá cây",
        "Ánh sáng Low-key (tông tối, nhấn mạnh hình khối)",
        "Ánh sáng mềm mại, mơ màng (Soft light)",
        "Ánh sáng neon màu hồng/xanh",
        "Ánh sáng ngược tạo viền tóc (Backlit/Rim light)",
        "Ánh sáng từ một quả cầu pha lê",
        "Ánh sáng từ một vầng hào quang (halo light)",
        "Ánh sáng từ những con đom đóm",
        "Ánh sáng tự nhiên từ cửa sổ",
        "Ánh trăng huyền ảo",
        "Chiếu bóng (projector light) hình hoa lá/thiên hà lên người mẫu"
    ].sort(),
    poses: [
        "Chạm tay vào tấm gương, nhìn vào hình ảnh phản chiếu",
        "Cúi xuống ngửi một bông hoa",
        "Đang chơi một loại nhạc cụ (hạc cầm, sáo)",
        "Đang đọc một cuốn sách cổ",
        "Đang xoay người nhẹ nhàng, tà váy bay lên",
        "Đi chân trần trên cỏ",
        "Đứng trong vườn hoa, tay nâng một bông hoa lên ngang tầm mắt",
        "Giơ tay như đang đón nhận ánh sáng",
        "Một tay che hờ mắt",
        "Ngồi bên hồ nước, tay nhẹ nhàng chạm vào mặt nước, nhìn xuống",
        "Ngồi trên ngai vàng, vẻ mặt quyền lực",
        "Ngồi trên xích đu kết bằng hoa, chân duỗi thẳng",
        "Nhảy múa dưới mưa",
        "Quay lưng lại, ngoái đầu nhìn qua vai với nụ cười bí ẩn",
        "Tay vuốt nhẹ mái tóc, ánh mắt nhìn thẳng vào ống kính",
        "Tựa đầu vào cửa sổ kính",
        "Tựa người vào một thân cây cổ thụ, mắt nhắm hờ",
        "Tư thế chiến binh, cầm kiếm",
        "Tư thế không trọng lực, lơ lửng",
        "Tư thế múa ballet đương đại",
        "Tư thế yoga/thiền định"
    ].sort(),
    vibes: [
        "Buồn man mác, đậm chất thơ",
        "Cao ngạo, lạnh lùng",
        "Cổ điển, hoài niệm",
        "Cô đơn, lẻ loi",
        "Ethereal, thoát tục",
        "Hoang dã, tự do",
        "Hy vọng, lạc quan",
        "Ma mị, hắc ám (dark fantasy)",
        "Mạnh mẽ, quyền lực",
        "Mơ màng và suy tư",
        "Thanh lịch và kiêu sa",
        "Tĩnh lặng, bình yên",
        "Tinh nghịch, vui tươi",
        "Tổn thương, mong manh",
        "Trang nghiêm, thánh thiện",
        "Trí tuệ, uyên bác",
        "Trong trẻo và ngây thơ",
        "Tự nhiên và thư thái",
        "Vui vẻ, tỏa nắng"
    ].sort(),
};

export const nudeArtOptions = {
    concealmentLevels: [
        "Bán nude nghệ thuật (che phần trên)",
        "Bán nude nghệ thuật (che phần dưới)",
        "Nude nghệ thuật (che phủ tinh tế các vùng nhạy cảm)",
        "Nude toàn thân (dùng bóng tối/góc máy để che khuất)",
    ].sort(),
    concealmentTechniques: [
        "Body painting mô phỏng trang phục (suit, váy)",
        "Body painting nghệ thuật (họa tiết hoa lá, thiên hà)",
        "Body painting ánh kim (vàng, bạc lỏng)",
        "Bodysuit xuyên thấu nghệ thuật",
        "Bóng tối kịch tính (Chiaroscuro)",
        "Bọt xà phòng dày đặc",
        "Che phủ bằng đất sét hoặc bùn khô nghệ thuật",
        "Che phủ bằng sticker/icon vui nhộn (playful stickers)",
        "Che phủ bằng một cuốn sách đang mở",
        "Che phủ bằng một chiếc lá cây lớn (lá cọ, lá chuối)",
        "Che phủ bằng một quả bóng bay",
        "Góc máy & Bố cục thông minh",
        "Hơi nước mờ ảo trong phòng tắm",
        "Mái tóc dài buông xõa",
        "Những đóa hoa lớn che phủ",
        "Nội y ren mỏng manh",
        "Phản chiếu qua mặt nước gợn sóng",
        "Tư thế tự che (dùng tay/chân)",
        "Vải lụa mỏng quấn hờ"
    ].sort(),
    backgrounds: [
        "Bên cửa sổ lớn nhìn ra thành phố mưa",
        "Bên lò sưởi ấm cúng",
        "Dưới một thác nước nhỏ",
        "Giữa một khu rừng sương mù",
        "Phòng ngủ tối giản với ga trải giường trắng",
        "Phòng tắm sang trọng, có hơi nước mờ ảo",
        "Studio tối giản với phông nền đen/xám",
        "Trên bãi biển vắng lúc hoàng hôn",
        "Trên tấm ga trải giường bằng lụa",
        "Trong bồn tắm cổ điển đầy sữa hoặc cánh hoa",
        "Trong một nhà kho cũ với ánh sáng xuyên qua khe cửa"
    ].sort(),
    lighting: [
        "Ánh nến lung linh, ấm áp",
        "Ánh sáng chiếu qua rèm cửa mỏng",
        "Ánh sáng kịch tính, chiếu từ một phía (Dramatic side light)",
        "Ánh sáng kịch tính che đi các vùng nhạy cảm (Chiaroscuro)",
        "Ánh sáng Low-key (tông tối, nhấn mạnh hình khối)",
        "Ánh sáng mềm mại, mơ màng (Soft light)",
        "Ánh sáng ngược tạo viền cơ thể (Backlit/Rim light)",
        "Ánh sáng từ một ngọn lửa",
        "Ánh sáng tự nhiên từ cửa sổ lớn",
        "Ánh trăng huyền ảo",
    ].sort(),
    poses: [
        "Nằm nghiêng, co người (fetal position)",
        "Nằm nghiêng, dùng tay và tóc che ngực",
        "Nằm sấp, hai tay ôm đầu",
        "Ngồi bó gối, cằm tựa lên đầu gối",
        "Ngồi quay lưng, khoe trọn tấm lưng trần",
        "Ngồi trên sàn, hai tay chống về phía sau",
        "Ôm lấy chính mình một cách dịu dàng",
        "Quay lưng lại, ngoái đầu nhìn qua vai",
        "Đứng trong bóng tối, chỉ để lộ một phần cơ thể",
        "Tựa người vào tường, một tay che ngực",
        "Tư thế yoga/thiền định nude",
    ].sort(),
    vibes: [
        "Buồn man mác, nội tâm",
        "Cô đơn, tĩnh lặng",
        "Đam mê, nồng cháy",
        "Mạnh mẽ, tự tin vào cơ thể",
        "Mong manh, dễ vỡ",
        "Quyến rũ và bí ẩn",
        "Thanh thản, bình yên",
        "Tự do, không ràng buộc"
    ].sort(),
    accessories: [
        "Bụi kim tuyến trên vai",
        "Chuỗi ngọc trai",
        "Dây chuyền cơ thể (body chain)",
        "Không có phụ kiện",
        "Một dải lụa mỏng",
        "Nước chảy trên da",
        "Vài cánh hoa hồng dính trên người"
    ].sort(),
};

export const costumeOptions = {
    girl: {
        characters: ["Công chúa", "Tiên nữ", "Nữ siêu anh hùng", "Phù thủy nhỏ", "Nữ thần Thiên nhiên", "Nhà thám hiểm vũ trụ"].sort(),
        outfits: ["Váy dạ hội lộng lẫy", "Trang phục dân tộc cách điệu", "Bộ đồ hóa trang động vật dễ thương", "Áo choàng phép thuật", "Bộ giáp ánh kim"].sort(),
        backgrounds: ["Lâu đài cổ tích trên mây", "Khu rừng phép thuật phát sáng", "Vương quốc kẹo ngọt", "Hành tinh ngoài vũ trụ đầy màu sắc", "Cung điện băng giá"].sort(),
    },
    boy: {
        characters: ["Siêu anh hùng", "Hiệp sĩ dũng mãnh", "Phi hành gia", "Cướp biển", "Nhà thám hiểm rừng xanh", "Pháp sư quyền năng"].sort(),
        outfits: ["Bộ giáp sắt", "Áo choàng bay", "Đồ phi hành gia hiện đại", "Trang phục ninja bí ẩn", "Bộ đồ thám hiểm với nhiều túi hộp"].sort(),
        backgrounds: ["Thành phố tương lai trên không", "Tàu cướp biển trên biển lớn", "Hang rồng với kho báu", "Kim tự tháp cổ đại trong sa mạc", "Trạm không gian vũ trụ"].sort(),
    }
};


const adultFemaleFaceOptions = {
    face: {
        label: "Tổng thể khuôn mặt",
        groups: {
            geometry: {
                label: "Hình học & Tỷ lệ",
                options: {
                    shape: { label: "Hình dạng", items: ["tròn", "oval", "vuông", "trái xoan", "kim cương", "tam giác", "dài", "trái tim"] },
                    ratio: { label: "Cân đối", items: ["cân xứng", "hơi lệch (tự nhiên)", "trán cao", "cằm V-line"] },
                    size: { label: "Độ lớn", items: ["mặt to", "nhỏ", "dài", "ngắn"] },
                }
            },
            vibe: {
                label: "Thần thái",
                options: {
                    vibe: { label: "Nét tổng quan", items: ["sắc sảo", "hiền hậu", "lạnh lùng", "phúc hậu", "thông minh", "nghiêm nghị", "trẻ thơ"] }
                }
            }
        }
    },
    eyes: {
        label: "Mắt",
        groups: {
            shapeAndPosition: {
                label: "Hình dáng & Vị trí",
                options: {
                    shape: { label: "Hình dáng", items: ["mắt to", "nhỏ", "hạnh nhân", "xếch", "cụp", "tròn", "dài"] },
                    distance: { label: "Khoảng cách", items: ["xa", "gần", "cân đối"] },
                }
            },
            details: {
                label: "Chi tiết",
                options: {
                    color: { label: "Màu mắt", items: ["đen", "nâu", "xanh", "xám", "hổ phách"] },
                    eyelid: { label: "Mi mắt", items: ["một mí", "hai mí", "mí lót", "mí sụp"] },
                    eyelashes: { label: "Lông mi", items: ["dài", "dày", "cong", "thưa", "cụp"] },
                }
            },
            expression: {
                label: "Biểu cảm & Đặc điểm",
                options: {
                    gaze: { label: "Ánh nhìn", items: ["sắc bén", "dịu dàng", "trầm buồn", "tinh nghịch", "lạnh lùng", "sáng rực"] },
                    bags: { label: "Quầng/Bọng mắt", items: ["thâm nhẹ", "không có", "bọng mắt cười"] }
                }
            }
        }
    },
    nose: {
        label: "Mũi",
        groups: {
            main: {
                label: "Cấu trúc mũi",
                options: {
                    shape: { label: "Dáng tổng thể", items: ["cao", "thấp", "thẳng", "gãy nhẹ", "tẹt", "cong", "hếch"] },
                    bridge: { label: "Sống mũi", items: ["dày", "mảnh", "thẳng", "gãy", "lõm"] },
                    wings: { label: "Cánh mũi", items: ["mỏng", "dày", "nở rộng", "hẹp"] },
                    tip: { label: "Đầu mũi", items: ["tròn", "nhọn", "dẹt", "hếch lên", "chúc xuống"] }
                }
            }
        }
    },
    mouth: {
        label: "Miệng và môi",
        groups: {
            shape: {
                label: "Hình dáng",
                options: {
                    shape: { label: "Dáng miệng", items: ["nhỏ", "rộng", "cong", "thẳng", "trái tim", "hơi lệch"] },
                    thickness: { label: "Độ dày môi", items: ["dày", "mỏng", "cân đối", "môi trên dày hơn", "môi dưới dày hơn"] },
                    lipShape: { label: "Hình môi", items: ["trái tim", "cong nhẹ", "môi trề", "môi cười"] },
                }
            },
            details: {
                label: "Chi tiết & Biểu cảm",
                options: {
                    color: { label: "Màu môi tự nhiên", items: ["hồng", "đỏ", "nhạt", "thâm"] },
                    expression: { label: "Biểu cảm", items: ["cười mỉm", "mím chặt", "cười hở răng", "trề", "nghiêng"] },
                    teeth: { label: "Răng", items: ["đều", "khấp khểnh", "trắng", "răng khểnh"] }
                }
            }
        }
    },
    ears: {
        label: "Tai",
        groups: {
            main: {
                label: "Đặc điểm tai",
                 options: {
                    size: { label: "Kích thước", items: ["to", "nhỏ", "cân xứng"] },
                    position: { label: "Vị trí", items: ["cao", "thấp", "cân đối"] },
                    shape: { label: "Hình dạng", items: ["tròn", "dài", "nhọn", "cụp", "dày dái tai", "mỏng"] }
                }
            }
        }
    },
    eyebrows: {
        label: "Lông mày",
        groups: {
           main: {
               label: "Đặc điểm lông mày",
                options: {
                    shape: { label: "Hình dáng", items: ["cong", "ngang", "xếch", "lá liễu", "rậm", "thưa", "cụt", "dài"] },
                    color: { label: "Màu sắc", items: ["đen", "nâu", "nhạt", "xám"] },
                    distance: { label: "Khoảng cách", items: ["gần", "xa", "trung bình"] },
                    style: { label: "Nét mày", items: ["mềm mại", "mạnh mẽ", "sắc", "hiền"] }
                }
            }
        }
    },
    chin: {
        label: "Cằm và hàm",
        groups: {
            main: {
                label: "Cấu trúc cằm & hàm",
                options: {
                    shape: { label: "Hình cằm", items: ["nhọn", "chẻ", "vuông", "tròn", "dài"] },
                    jawline: { label: "Đường viền hàm", items: ["sắc nét", "mềm mại", "mờ nhạt"] },
                    width: { label: "Hàm", items: ["rộng", "hẹp", "cân đối"] },
                }
            }
        }
    },
    forehead: {
        label: "Trán và tóc",
        groups: {
            forehead: {
                label: "Trán",
                options: {
                    shape: { label: "Hình trán", items: ["cao", "thấp", "rộng", "hẹp", "dô", "phẳng"] },
                    hairline: { label: "Đường chân tóc", items: ["cao", "thấp", "lượn sóng", "góc nhọn (widow’s peak)"] }
                }
            },
            hair: {
                label: "Tóc",
                options: {
                    hairStyle: { label: "Kiểu tóc", items: ["thẳng", "xoăn", "ngắn", "dài", "mái bằng", "rẽ ngôi", "tóc tém", "tóc bob", "tóc layer", "búi cao"] },
                    hairColor: { label: "Màu tóc", items: ["đen", "nâu", "vàng", "bạc", "nhuộm màu nổi bật (VD: hồng, xanh)"] },
                    hairDensity: { label: "Mật độ tóc", items: ["dày", "mỏng", "rậm"] },
                }
            }
        }
    },
    skin: {
        label: "Da & Đặc điểm riêng",
        groups: {
            main: {
                label: "Đặc điểm da & tuổi tác",
                options: {
                    features: { label: "Đặc điểm", items: ['không có đặc điểm', 'nốt ruồi duyên gần môi', 'nốt ruồi duyên trên má', 'tàn nhang nhẹ trên mũi và má', 'vết chân chim khóe mắt khi cười', 'vết sẹo nhỏ trên lông mày'].sort() },
                    tone: { label: "Tông da", items: ['căng bóng (dewy/glass skin)', 'da thật, có kết cấu tự nhiên', 'hơi bóng dầu vùng chữ T', 'hơi khô', 'lỗ chân lông nhỏ, da đều màu', 'mịn màng không tì vết'].sort() },
                    texture: { label: "Kết cấu da", items: ['da ô-liu (olive skin)', 'ngăm khỏe khoắn (tanned)', 'nâu sô-cô-la', 'trắng hồng', 'trắng sứ', 'vàng sáng (light-warm)', 'vàng trung bình'].sort() },
                    age: { label: "Dấu hiệu tuổi tác", items: ["trẻ trung", "có vết chân chim", "quầng mắt nhẹ", "trung niên"] },
                    specificAge: { label: "Độ tuổi cụ thể", type: 'input' }
                }
            }
        }
    }
};

// FIX: Cast the result of JSON.parse to the correct type to prevent type errors.
const adultMaleFaceOptions: typeof adultFemaleFaceOptions = JSON.parse(JSON.stringify(adultFemaleFaceOptions)); // Deep copy to prevent reference issues
adultMaleFaceOptions.face.groups.vibe.options.vibe = { label: "Nét tổng quan", items: ["nam tính", "thư sinh", "lạnh lùng", "phong trần", "thông minh", "nghiêm nghị", "hài hước"] };
adultMaleFaceOptions.chin.groups.main.options.shape = { label: "Hình cằm", items: ["vuông", "chẻ", "nhọn", "tròn", "dài"] };
adultMaleFaceOptions.eyebrows.groups.main.options.shape = { label: "Hình dáng", items: ["rậm", "ngang", "xếch", "dài", "thưa"] };
adultMaleFaceOptions.forehead.groups.hair.options.hairStyle = { label: "Kiểu tóc", items: ["undercut", "side-part", "tóc xoăn", "tóc dài buộc", "đầu đinh (buzz cut)", "mohican"] };
adultMaleFaceOptions.forehead.groups.hair.options.hairDensity = { label: "Mật độ tóc", items: ["dày", "mỏng", "hói nhẹ", "rậm"] };

const girlFaceOptions = {
    face: {
        label: "Tổng thể khuôn mặt",
        groups: {
            main: {
                label: "Nét chính",
                options: {
                    shape: { label: "Hình dạng", items: ["tròn bầu bĩnh", "trái xoan", "phúng phính"] },
                    vibe: { label: "Thần thái", items: ["đáng yêu", "lém lỉnh", "dịu dàng", "tinh nghịch", "trầm tính"] }
                }
            }
        }
    },
    eyes: {
        label: "Mắt",
        groups: {
            main: {
                label: "Đặc điểm mắt",
                 options: {
                    shape: { label: "Hình dáng", items: ["to tròn đen láy", "một mí cười híp", "long lanh"] },
                    eyelashes: { label: "Lông mi", items: ["dài", "cong", "thưa"] },
                }
            }
        }
    },
    nose: {
        label: "Mũi",
        groups: {
            main: {
                label: "Đặc điểm mũi",
                 options: {
                    shape: { label: "Hình dáng", items: ["nhỏ xinh", "tẹt dễ thương", "cao nhẹ"] },
                }
            }
        }
    },
    mouth: {
        label: "Miệng và môi",
        groups: {
            main: {
                label: "Đặc điểm miệng",
                options: {
                    shape: { label: "Hình dáng", items: ["chúm chím", "nhỏ xinh", "hay cười"] },
                    teeth: { label: "Răng", items: ["răng sún", "đều", "răng thỏ"] }
                }
            }
        }
    },
    forehead: {
        label: "Tóc",
        groups: {
            main: {
                label: "Đặc điểm tóc",
                options: {
                    hairStyle: { label: "Kiểu tóc", items: ["buộc hai bên", "tóc bob", "tết bím", "dài xõa tự nhiên", "mái ngố"] },
                    hairColor: { label: "Màu tóc", items: ["đen", "nâu hạt dẻ", "vàng hoe"] },
                }
            }
        }
    },
    skin: {
        label: "Da & Đặc điểm riêng",
        groups: {
            main: {
                label: "Đặc điểm da",
                options: {
                    features: { label: "Đặc điểm", items: ["má lúm đồng tiền", "không có", "tàn nhang nhẹ"] },
                    tone: { label: "Tông da", items: ["trắng hồng", "vàng", "hơi ngăm"] },
                    specificAge: { label: "Độ tuổi cụ thể", type: 'input' }
                }
            }
        }
    }
};

// FIX: Cast the result of JSON.parse to the correct type to prevent type errors.
const boyFaceOptions: typeof girlFaceOptions = JSON.parse(JSON.stringify(girlFaceOptions)); // Deep copy to prevent reference issues
boyFaceOptions.face.groups.main.options.vibe = { label: "Thần thái", items: ["nghịch ngợm", "hiếu động", "thông minh", "mọt sách", "hài hước"] };
boyFaceOptions.forehead.groups.main.options.hairStyle = { label: "Kiểu tóc", items: ["đầu đinh", "mái ngố", "xoăn nhẹ", "vuốt dựng"] };

export const kolCharacterOptions = {
    female: adultFemaleFaceOptions,
    male: adultMaleFaceOptions,
    girl: girlFaceOptions,
    boy: boyFaceOptions
};

export const weatherOptions = [
    'Mưa phùn',
    'Nhiều mây, mát mẻ',
    'Nóng ẩm',
    'Nắng đẹp',
    'Ngày u ám',
    'Se lạnh, có gió',
    'Tuyết (cho bối cảnh du lịch nước ngoài)'
].sort();

export const captionToneOptions = [
    'Bí ẩn, quyến rũ',
    'Chuyên nghiệp, cung cấp thông tin',
    'Hài hước, lém lỉnh',
    'Sang trọng, tinh tế',
    'Sâu lắng, suy tư',
    'Thân thiện, gần gũi',
    'Truyền cảm hứng, động lực',
    'Vui vẻ, lạc quan'
].sort();

export const skinToneOptions = [
    'Trắng hồng', 
    'Trắng sứ', 
    'Vàng sáng (light-warm)', 
    'Vàng trung bình', 
    'Ngăm khỏe khoắn (tanned)', 
    'Da ô-liu (olive skin)', 
    'Nâu sô-cô-la'
].sort();

export const hairStylingOptions = {
    female: {
        styles: ["Bob ngắn", "Tém (Pixie)", "Tóc dài tỉa lớp (Long layers)", "Búi cao (High bun)", "Đuôi ngựa (Ponytail)", "Xoăn sóng nước", "Tóc thẳng mượt", "Tóc tết xương cá", "Tóc uốn cụp"].sort(),
        colors: ["Đen tự nhiên", "Nâu sô-cô-la", "Vàng bạch kim (Platinum blonde)", "Đỏ rượu vang", "Nâu hạt dẻ", "Ombre khói xám", "Balayage nâu tây", "Hồng pastel", "Xanh dương đậm", "Bạc kim loại"].sort(),
        accessories: ["Không có", "Băng đô lụa", "Vương miện hoa", "Kẹp tóc ngọc trai", "Khăn turban", "Mũ rộng vành"].sort(),
    },
    male: {
        styles: ["Undercut", "Slick back (vuốt ngược)", "Crew cut (đầu đinh)", "Man bun (búi tó)", "Tóc xoăn bổ luống (Curly fringe)", "Mohican", "Side part (rẽ ngôi bên)"].sort(),
        colors: ["Đen", "Nâu đậm", "Muối tiêu (Salt & pepper)", "Vàng bạch kim", "Xanh rêu", "Xám khói"].sort(),
        accessories: ["Không có", "Mũ lưỡi trai", "Mũ beanie", "Khăn bandana"].sort(),
    },
    girl: {
        styles: ["Buộc hai bên", "Tết bím", "Bob mái ngố", "Đuôi ngựa", "Búi Na Tra", "Tóc xù mì"].sort(),
        colors: ["Đen tự nhiên", "Nâu hạt dẻ", "Nhuộm dip-dye màu hồng", "Highlight màu tím pastel"].sort(),
        accessories: ["Nơ to bản", "Kẹp tóc hình thú", "Băng đô tai mèo", "Bờm có kim tuyến"].sort(),
    },
    boy: {
        styles: ["Đầu đinh (buzz cut)", "Tóc vuốt dựng (spiky)", "Tóc bát úp (bowl cut)", "Tóc xoăn tự nhiên", "Undercut kẻ vạch"].sort(),
        colors: ["Đen tự nhiên", "Nâu sáng"].sort(),
        accessories: ["Không có", "Mũ lưỡi trai ngược", "Kính râm trẻ em"].sort(),
    },
};