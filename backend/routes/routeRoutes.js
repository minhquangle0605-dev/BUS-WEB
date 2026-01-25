const express = require('express');
const router = express.Router();
const BusRoute = require('../models/BusRoute');
const BusStop = require('../models/BusStop');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/routes
 * @desc    Lấy danh sách tất cả tuyến
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const routes = await BusRoute.find({ isActive: true })
            .populate('busStops')
            .sort({ routeNumber: 1 });

        res.json({
            success: true,
            count: routes.length,
            routes
        });
    } catch (error) {
        console.error('Get routes error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/routes/:id
 * @desc    Lấy thông tin chi tiết 1 tuyến
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const route = await BusRoute.findById(req.params.id)
            .populate('busStops');

        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tuyến'
            });
        }

        res.json({
            success: true,
            route
        });
    } catch (error) {
        console.error('Get route error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/routes/search
 * @desc    Tìm tuyến xe từ điểm A đến điểm B
 * @access  Public
 */
router.post('/search', async (req, res) => {
    try {
        const { from, to } = req.body;

        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập điểm đi và điểm đến'
            });
        }

        // Tìm các điểm dừng khớp với from và to
        const fromStops = await BusStop.find({
            $or: [
                { name: { $regex: from, $options: 'i' } },
                { 'address.street': { $regex: from, $options: 'i' } },
                { 'address.district': { $regex: from, $options: 'i' } }
            ]
        });

        const toStops = await BusStop.find({
            $or: [
                { name: { $regex: to, $options: 'i' } },
                { 'address.street': { $regex: to, $options: 'i' } },
                { 'address.district': { $regex: to, $options: 'i' } }
            ]
        });

        if (fromStops.length === 0 || toStops.length === 0) {
            return res.json({
                success: true,
                message: 'Không tìm thấy tuyến phù hợp',
                routes: []
            });
        }

        // Lấy ID của các điểm dừng
        const fromStopIds = fromStops.map(stop => stop._id);
        const toStopIds = toStops.map(stop => stop._id);

        // Tìm tuyến đi qua cả 2 điểm
        const routes = await BusRoute.find({
            isActive: true,
            busStops: {
                $all: [
                    { $elemMatch: { $in: fromStopIds } },
                    { $elemMatch: { $in: toStopIds } }
                ]
            }
        }).populate('busStops');

        // Filter để đảm bảo thứ tự điểm dừng đúng (from trước to)
        const validRoutes = routes.filter(route => {
            const stopIds = route.busStops.map(stop => stop._id.toString());
            const fromIndex = stopIds.findIndex(id => fromStopIds.some(fid => fid.toString() === id));
            const toIndex = stopIds.findIndex(id => toStopIds.some(tid => tid.toString() === id));
            return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
        });

        res.json({
            success: true,
            count: validRoutes.length,
            routes: validRoutes,
            fromStops,
            toStops
        });
    } catch (error) {
        console.error('Search routes error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/routes/search/suggestions
 * @desc    Gợi ý điểm dừng khi gõ
 * @access  Public
 */
router.get('/search/suggestions', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({
                success: true,
                suggestions: []
            });
        }

        const stops = await BusStop.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { 'address.street': { $regex: q, $options: 'i' } },
                { 'address.district': { $regex: q, $options: 'i' } }
            ]
        }).limit(10);

        res.json({
            success: true,
            suggestions: stops.map(stop => ({
                id: stop._id,
                name: stop.name,
                address: `${stop.address.street}, ${stop.address.district}`
            }))
        });
    } catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/routes/:id/favorite
 * @desc    Thêm tuyến vào yêu thích
 * @access  Private
 */
router.post('/:id/favorite', protect, async (req, res) => {
    try {
        const route = await BusRoute.findById(req.params.id);
        
        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tuyến'
            });
        }

        const user = req.user;

        // Kiểm tra đã favorite chưa
        if (user.favoriteRoutes.includes(route._id)) {
            return res.status(400).json({
                success: false,
                message: 'Tuyến đã có trong danh sách yêu thích'
            });
        }

        // Thêm vào favorites
        user.favoriteRoutes.push(route._id);
        await user.save();

        // Tăng favoriteCount của route
        route.favoriteCount += 1;
        await route.save();

        res.json({
            success: true,
            message: 'Đã thêm vào yêu thích',
            favoriteRoutes: user.favoriteRoutes
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/routes/:id/favorite
 * @desc    Xóa tuyến khỏi yêu thích
 * @access  Private
 */
router.delete('/:id/favorite', protect, async (req, res) => {
    try {
        const route = await BusRoute.findById(req.params.id);
        
        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tuyến'
            });
        }

        const user = req.user;

        // Xóa khỏi favorites
        user.favoriteRoutes = user.favoriteRoutes.filter(
            id => id.toString() !== route._id.toString()
        );
        await user.save();

        // Giảm favoriteCount
        route.favoriteCount = Math.max(0, route.favoriteCount - 1);
        await route.save();

        res.json({
            success: true,
            message: 'Đã xóa khỏi yêu thích',
            favoriteRoutes: user.favoriteRoutes
        });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

module.exports = router;
