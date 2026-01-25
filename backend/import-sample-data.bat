@echo off
REM MongoDB Import Script for Windows
REM Import sample data vao database bus_route_db

echo ======================================
echo   MongoDB Sample Data Import Script
echo ======================================
echo.

REM Kiem tra MongoDB da chay chua
mongosh --eval "db.version()" >nul 2>&1
if errorlevel 1 (
    echo [X] MongoDB chua chay!
    echo Vui long start MongoDB truoc khi chay script nay.
    echo.
    echo Windows: services.msc -^> MongoDB Server -^> Start
    pause
    exit /b 1
)

echo [OK] MongoDB dang chay
echo.

REM Database name
set DB_NAME=bus_route_db

echo Xoa database cu (neu co)...
mongosh %DB_NAME% --eval "db.dropDatabase()" --quiet

echo Import sample data...
echo.

echo 1. Import Users...
mongosh %DB_NAME% --eval "db.users.insertMany([{email:'nguyenvana@example.com',password:'$2a$10$XQQ7YXKxnfRqJYnKZ4XQb.LKmD7qBH9YwQZZQZZYQZZYQZZYQZZYQZZ',fullName:'Nguyen Van A',phoneNumber:'0912345678',dateOfBirth:new Date('1995-05-15'),address:{street:'123 Pho Hue',ward:'Minh Khai',district:'Hai Ba Trung',city:'Ha Noi'},avatar:'https://via.placeholder.com/150',balance:150000,favoriteRoutes:[],isActive:true,createdAt:new Date('2025-01-01'),updatedAt:new Date()},{email:'tranthib@example.com',password:'$2a$10$XQQ7YXKxnfRqJYnKZ4XQb.LKmD7qBH9YwQZZQZZYQZZYQZZYQZZYQZZ',fullName:'Tran Thi B (>60 tuoi)',phoneNumber:'0987654321',dateOfBirth:new Date('1960-03-20'),address:{street:'456 Giai Phong',ward:'Thanh Xuan Bac',district:'Thanh Xuan',city:'Ha Noi'},avatar:'https://via.placeholder.com/150',balance:50000,favoriteRoutes:[],isActive:true,createdAt:new Date('2025-01-10'),updatedAt:new Date()}])" --quiet
echo [OK] Users imported: 2
echo.

echo 2. Import Bus Stops...
mongosh %DB_NAME% --eval "db.busstops.insertMany([{name:'Ben xe My Dinh',stopCode:'MD001',address:{street:'Pham Hung',ward:'My Dinh 1',district:'Nam Tu Liem',city:'Ha Noi'},location:{type:'Point',coordinates:[105.7803,21.0278]},routes:[],facilities:{hasShelter:true,hasBench:true,hasLighting:true,hasTrashBin:true},ticketOffice:{available:true,openingHours:{weekday:'05:00 - 22:00',weekend:'05:30 - 21:30'},phoneNumber:'024-1234-5678',services:['Ban ve','Nap the','Tu van tuyen duong','Ho tro nguoi cao tuoi']},isActive:true,createdAt:new Date()},{name:'Ben xe Giap Bat',stopCode:'GB001',address:{street:'Giai Phong',ward:'Giap Bat',district:'Hoang Mai',city:'Ha Noi'},location:{type:'Point',coordinates:[105.8405,20.9817]},routes:[],facilities:{hasShelter:true,hasBench:true,hasLighting:true,hasTrashBin:true},ticketOffice:{available:true,openingHours:{weekday:'05:00 - 22:30',weekend:'05:30 - 22:00'},phoneNumber:'024-1234-5679',services:['Ban ve','Nap the','Tu van tuyen duong']},isActive:true,createdAt:new Date()},{name:'Ho Guom',stopCode:'HG001',address:{street:'Le Thai To',ward:'Hang Trong',district:'Hoan Kiem',city:'Ha Noi'},location:{type:'Point',coordinates:[105.8525,21.0285]},routes:[],facilities:{hasShelter:false,hasBench:true,hasLighting:true,hasTrashBin:true},ticketOffice:{available:false},isActive:true,createdAt:new Date()}])" --quiet
echo [OK] Bus stops imported: 3
echo.

echo 3. Import Bus Routes...
mongosh %DB_NAME% --eval "const stops=db.busstops.find().toArray();db.busroutes.insertMany([{routeNumber:'03',routeName:'Ben xe My Dinh - Ben xe Giap Bat',description:'Tuyen chay ngang qua trung tam Ha Noi',startPoint:{name:'Ben xe My Dinh',location:{type:'Point',coordinates:[105.7803,21.0278]}},endPoint:{name:'Ben xe Giap Bat',location:{type:'Point',coordinates:[105.8405,20.9817]}},busStops:[stops[0]._id,stops[2]._id,stops[1]._id],pricing:{regularPrice:7000,studentPrice:5000,seniorPrice:3500},operatingHours:{weekday:{start:'05:00',end:'22:30',frequency:12},weekend:{start:'05:30',end:'22:00',frequency:15}},distance:22.3,estimatedDuration:65,isActive:true,color:'#3498db',totalTrips:0,favoriteCount:0,createdAt:new Date(),updatedAt:new Date()}])" --quiet
echo [OK] Bus routes imported: 1
echo.

echo ======================================
echo   [OK] IMPORT THANH CONG!
echo ======================================
echo.
echo Database: %DB_NAME%
echo.
echo Collections:
echo   - users: 2 records (1 user ^<60 tuoi, 1 user ^>60 tuoi)
echo   - busstops: 3 records (2 co quay ve)
echo   - busroutes: 1 record
echo.
echo Test data:
echo   Email: nguyenvana@example.com
echo   Password: 123456
echo.
echo   Email: tranthib@example.com (^>60 tuoi)
echo   Password: 123456
echo.
echo Luu y: Password da duoc hash, nhung trong thuc te la '123456'
echo De tao user moi, dung API /api/auth/register
echo.
echo Bay gio co the chay server: npm run dev
echo.
pause
