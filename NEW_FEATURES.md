# 🆕 CÁC TÍNH NĂNG MỚI ĐÃ BỔ SUNG

## 1. 🏪 Thông tin Quầy Bán Vé (cho user KHÔNG cần đăng nhập)

### Vấn đề được giải quyết:
- User tìm được tuyến nhưng không muốn/không biết mua vé online
- User muốn mua vé trực tiếp tại quầy
- User cần biết địa chỉ, giờ mở cửa của quầy vé

### Demo Flow:
1. User tìm tuyến: "Mỹ Đình" → "Giáp Bát"
2. Thấy kết quả tuyến 03
3. Click "Quầy bán vé" (KHÔNG cần đăng nhập)
4. Hiện modal với địa chỉ, giờ mở cửa, số điện thoại

## 2. 🎁 Miễn Phí Vé Cho Người Cao Tuổi (>60 tuổi)

### Demo Flow:
**User chưa đăng nhập:**
- Thấy thông báo "Người cao tuổi >60: Miễn phí" trên mọi tuyến
- Click "Quầy bán vé" để biết nơi mua

**User đã đăng nhập, >60 tuổi:**
- Profile điền ngày sinh (VD: 1950)
- Mua vé → Tự động MIỄN PHÍ (price = 0)

## 📊 Files đã thay đổi:
- Backend: BusStop.js, User.js, ticketRoutes.js, seedData.js
- Frontend: index.html, routes.html
