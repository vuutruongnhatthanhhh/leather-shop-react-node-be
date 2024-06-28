const express = require("express");
const router  = express.Router()
const userController = require('../controllers/UserController');
const { authMiddleware, authUserMiddleware } = require("../middleware/authMiddleware");

// Thiết kế theo mô hình MVC thì router sẽ gọi qua controller
router.post('/sign-up', userController.createUser )
router.post('/verify', userController.verifyUser )
router.post('/forgot-pass', userController.forgotPassUser )
router.post('/change-pass', userController.changePassUser )
router.post('/point', userController.pointUser )
router.post('/sign-in', userController.loginUser )
router.post('/log-out', userController.logoutUser )
router.put('/update-user/:id', userController.updateUser )
// Có 1 bước xác thực authMiddleware để xem có phải admin hay không
router.delete('/delete-user/:id', userController.deleteUser )
router.get('/getAll', userController.getAllUser )
// admin thì lấy được tất cả user, user lấy được của chính nó
router.get('/get-details/:id', userController.getDetailsUser )

router.post('/refresh-token', userController.refreshToken )
router.post('/delete-many', userController.deleteMany )

module.exports = router