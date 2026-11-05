import { ToneType } from '../types/qc';

export interface SampleTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  targetTone: ToneType;
  text: string;
}

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: 'email-report',
    title: 'Báo cáo tiến độ tuần gửi Ban Lãnh đạo',
    category: 'Báo cáo công việc',
    description: 'Chứa lỗi chính tả x/s, viết tắt chat và văn phong chưa đạt chuẩn báo cáo cấp trên.',
    targetTone: 'formal',
    text: `Chào các sếp,
Em xin gửi báo cáo tuần của phòng ban mình ak.
Tuần qua đội ngũ đã hoàn thành xuất xắc các chỉ tiêu đề ra, tuy nhiên việc sử lý dữ liệu còn gặp chút trục trặc do hệ thống cọ sát với phần mềm mới.
Rút cuộc thì các task chính đều đã xong và ko có vấn đề gì quá lớn. Đội ngũ xin đề xuất bổ xung thêm 2 nv thử việc để kịp tiến độ quý sau.
Nhằm mục đích để dự án đạt kết quả tốt nhất, em mong các sếp duyệt sớm giúp em nhen!
Em cảm ơn ạ.`,
  },
  {
    id: 'email-customer',
    title: 'Email phản hồi & xin lỗi khách hàng / đối tác',
    category: 'Chăm sóc khách hàng',
    description: 'Cần nâng cấp văn phong thành kính, chuyên nghiệp, khắc phục lỗi sơ xuất và từ ngữ suồng sã.',
    targetTone: 'professional',
    text: `Chào anh Hoàng,
Bên em có nhận đc phản ánh của anh về việc đơn hàng bị giao trễ 2 ngày.
Thực sự bên em vô cùng là lấy làm tiếc vì sơ xuất này. Đợt này kho hàng đang sát nhập địa điểm mới nên nhân sự chuẩn chu chưa kịp, dẫn tới việc giao hàng ko đúng hẹn.
Anh thông cảm dùm bên em nha! Tụi em xin tặng anh voucher giảm giá 15% cho lần mua tới.
Có gì anh cứ ib trực tiếp cho em qua số này để em giải quyết liền ạ.`,
  },
  {
    id: 'proposal-project',
    title: 'Tờ trình đề xuất dự án chuyển đổi số',
    category: 'Đề xuất & Dự án',
    description: 'Văn bản đề xuất cần tính thuyết phục cao, cấu trúc câu gãy gọn và số liệu đanh thép.',
    targetTone: 'persuasive',
    text: `Kính gửi Ban Giám Đốc,
Phòng Công Nghệ xin gửi tờ trình về dự án số hóa quy trình quản trị nội bộ.
Hiện tại các phòng ban đang làm việc thủ công rất là mất thời gian và dễ xảy ra sai sót dữ liệu. Nếu triển khai nền tảng mới này thì tựu chung lại sẽ tiết kiệm đc 30% thời gian cho toàn thể nhân sự công ty.
Chúng tôi đã liên hệ với đối tác nhằm mục đích để deal mức chi phí ưu đãi nhất cho công ty trong tháng này.
Kính mong Ban Lãnh đạo xem xét và cho ý kiến chỉ đạo để dự án sáng lạng hơn trong năm tài chính tới.`,
  },
  {
    id: 'email-leave',
    title: 'Email xin nghỉ phép & bàn giao công việc',
    category: 'Hành chính nhân sự',
    description: 'Email nhân sự thường ngày, loại bỏ từ viết tắt "mn", "bh", "đc", thêm thông tin liên hệ khẩn cấp.',
    targetTone: 'professional',
    text: `Gửi anh Trưởng phòng và mn trong team,
Em viết mail này để xin phép nghỉ 2 ngày vào thứ Năm và thứ Sáu tuần này do gia đình có việc bận đột xuất ak.
Công việc của em bh đã đc bàn giao lại cho bạn Tuấn theo dõi, nếu có việc gì gấp thì mn cứ gọi điện thoại cho em.
Mong anh duyệt phép giúp em nhe!
Em cảm ơn mn nhiều.`,
  },
  {
    id: 'internal-notice',
    title: 'Thông báo quy chế làm việc & giờ giấc văn phòng',
    category: 'Thông báo nội bộ',
    description: 'Quy định nội bộ cần tính trang trọng, rõ ràng, dứt khoát và lịch sự.',
    targetTone: 'formal',
    text: `Thông báo tới toàn thể cán bộ nhân viên công ty,
Thời gian qua phòng Nhân sự nhận thấy tình trạng đi làm muộn diễn ra khá nhiều, làm ảnh hưởng đến tiến độ chung.
Kể từ thứ Hai tuần tới, cty yêu cầu mn phải có mặt đúng 8h30 tại văn phòng. Trường hợp có việc đột xuất ko đến kịp phải thông báo cho quản lý trước 8h00.
Các trường hợp vi phạm nhiều lần sẽ bị xử lý theo đúng quy chế đã ban hành.
Yêu cầu các phòng ban phổ biến và thực hiện nghiêm túc nhen.`,
  },
];
