const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Ticket = require('../models/Ticket');
const BusRoute = require('../models/BusRoute');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

/**
 * Helper: Tạo mã vé unique
 */
const generateTicketCode = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BUS${timestamp}${random}`;
};

/**
 * @route   POST /api/tickets/purchase
 * @desc    Mua vé điện tử
 * @access  Private
 */
router.post('/purchase', protect, async (req, res) => {
    try {
        const { 
            routeId, 
            ticketType = 'single', 
            passengerType = 'regular',
            boardingStopId,
            alightingStopId
        } = req.body;

        // Validate
        if (!routeId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn tuyến'
            });
        }

        // Lấy thông tin tuyến
        const route = await BusRoute.findById(routeId);
        if (!route || !route.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Tuyến không tồn tại hoặc đã ngừng hoạt động'
            });
        }

        // Tính giá vé
        let price;
        
        // Lấy thông tin user để check tuổi
        const user = await User.findById(req.user.id);
        
        // Kiểm tra miễn phí cho người cao tuổi (>60 tuổi)
        if (user.isEligibleForFreeTicket()) {
            price = 0; // Miễn phí
        } else {
            // Tính theo loại hành khách
            switch (passengerType) {
                case 'student':
                    price = route.pricing.studentPrice || route.pricing.regularPrice * 0.8;
                    break;
                case 'senior':
                    price = route.pricing.seniorPrice || route.pricing.regularPrice * 0.5;
                    break;
                default:
                    price = route.pricing.regularPrice;
            }
        }

        // Áp dụng giá theo loại vé
        let validityHours;
        switch (ticketType) {
            case 'day-pass':
                price *= 10;
                validityHours = 24;
                break;
            case 'week-pass':
                price *= 50;
                validityHours = 24 * 7;
                break;
            case 'month-pass':
                price *= 150;
                validityHours = 24 * 30;
                break;
            default: // single
                validityHours = 2;
        }

        // Kiểm tra số dư
        const user = await User.findById(req.user.id);
        if (user.balance < price) {
            return res.status(400).json({
                success: false,
                message: 'Số dư không đủ. Vui lòng nạp thêm tiền.'
            });
        }

        // Trừ tiền
        user.balance -= price;
        await user.save();

        // Tạo mã vé
        const ticketCode = generateTicketCode();

        // Tạo QR code
        const qrData = JSON.stringify({
            ticketCode,
            userId: user._id,
            routeId: route._id,
            routeNumber: route.routeNumber,
            passengerType,
            ticketType,
            price,
            issuedAt: new Date()
        });
        
        const qrCode = await QRCode.toDataURL(qrData);

        // Tính thời gian hiệu lực
        const validFrom = new Date();
        const validUntil = new Date(validFrom.getTime() + validityHours * 60 * 60 * 1000);

        // Tạo vé
        const ticket = await Ticket.create({
            user: user._id,
            route: route._id,
            ticketCode,
            qrCode,
            ticketType,
            passengerType,
            price,
            boardingStop: boardingStopId,
            alightingStop: alightingStopId,
            validFrom,
            validUntil,
            paymentMethod: 'balance',
            paymentStatus: 'completed'
        });

        // Populate để trả về đầy đủ thông tin
        await ticket.populate(['route', 'boardingStop', 'alightingStop']);

        res.status(201).json({
            success: true,
            message: 'Mua vé thành công',
            ticket,
            remainingBalance: user.balance
        });
    } catch (error) {
        console.error('Purchase ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/tickets/my-tickets
 * @desc    Lấy danh sách vé của user
 * @access  Private
 */
router.get('/my-tickets', protect, async (req, res) => {
    try {
        const { status } = req.query;

        let query = { user: req.user.id };
        if (status) {
            query.status = status;
        }

        const tickets = await Ticket.find(query)
            .populate('route')
            .populate('boardingStop')
            .populate('alightingStop')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: tickets.length,
            tickets
        });
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/tickets/:id
 * @desc    Lấy chi tiết 1 vé
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('route')
            .populate('boardingStop')
            .populate('alightingStop');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy vé'
            });
        }

        // Kiểm tra quyền sở hữu
        if (ticket.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem vé này'
            });
        }

        res.json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/tickets/:id/use
 * @desc    Sử dụng vé (quét QR)
 * @access  Private
 */
router.post('/:id/use', protect, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy vé'
            });
        }

        // Kiểm tra quyền sở hữu
        if (ticket.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền sử dụng vé này'
            });
        }

        // Kiểm tra trạng thái
        if (ticket.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: `Vé đã ${ticket.status === 'used' ? 'được sử dụng' : 'hết hạn hoặc bị hủy'}`
            });
        }

        // Kiểm tra còn hiệu lực không
        if (new Date() > ticket.validUntil) {
            ticket.status = 'expired';
            await ticket.save();
            return res.status(400).json({
                success: false,
                message: 'Vé đã hết hạn'
            });
        }

        // Đánh dấu đã sử dụng (chỉ với vé single)
        if (ticket.ticketType === 'single') {
            ticket.status = 'used';
            ticket.usedAt = new Date();
            await ticket.save();
        }

        res.json({
            success: true,
            message: 'Vé hợp lệ',
            ticket
        });
    } catch (error) {
        console.error('Use ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/tickets/:id/cancel
 * @desc    Hủy vé và hoàn tiền
 * @access  Private
 */
router.post('/:id/cancel', protect, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy vé'
            });
        }

        // Kiểm tra quyền sở hữu
        if (ticket.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền hủy vé này'
            });
        }

        // Kiểm tra có thể hủy không
        if (ticket.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy vé này'
            });
        }

        // Hoàn tiền 80%
        const refundAmount = ticket.price * 0.8;
        const user = await User.findById(req.user.id);
        user.balance += refundAmount;
        await user.save();

        // Đánh dấu hủy
        ticket.status = 'cancelled';
        await ticket.save();

        res.json({
            success: true,
            message: `Đã hủy vé và hoàn ${refundAmount.toLocaleString('vi-VN')}đ`,
            refundAmount,
            remainingBalance: user.balance
        });
    } catch (error) {
        console.error('Cancel ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

module.exports = router;
