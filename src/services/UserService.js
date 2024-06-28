const User = require("../models/UserModel")
const bcrypt = require("bcryptjs")
const { generalAccessToken, generalRefreshToken } = require("./JwtService")
const { use } = require("../routes/UserRouter")
const OTPService = require("../services/OTPService")
const EmailService = require("../services/EmailService")
// Xử lý api ở đây
const createUser = (newUser) =>{
    return new Promise(async(resolve, reject) =>{
        const {name, email, password, confirmPassword, phone} = newUser
        try{
            // Check xem email đã tồn tại trong db hay chưa, nếu chưa tồn tại trả về null
            const checkUser = await User.findOne({
                email : email
            })
          if(checkUser!==null){
            resolve({
                status: 'ERR',
                message: 'Email đã được sử dụng'
            })
          }

         
        //   Mã hóa mật khẩu
          const hash = bcrypt.hashSync(password, 10)
          const otpSignup = OTPService.generateOTP()
          await EmailService.sendEmailSignUp(email,otpSignup);
            // gọi bên model
            const createdUser = await User.create({
                name, 
                email, 
                password: hash, 
                phone,
                otp: otpSignup
                
            })
            if(createdUser){
                
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createdUser
                   
                })
            }
            resolve({})
        }catch(e){
            reject(e)
        }
    })
}

const verifyUser = async (id, otp) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            return {
                status: 'ERR',
                message: 'Người dùng không tồn tại'
            };
        }

        if (user.otp !== otp) {
            return {
                status: 'ERR',
                message: 'Mã OTP không hợp lệ'
            };
        }

        user.confirmed = true;
        await user.save();

        return {
            status: 'OK',
            message: 'Xác thực thành công'
        };
    } catch (error) {
        return {
            status: 'ERR',
            message: error.message
        };
    }
};

const forgotPassUser = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return {
                status: 'ERR',
                message: 'Người dùng không tồn tại'
            };
        }

        const otpSignup = OTPService.generateOTP()
        await EmailService.sendEmailSignUp(email,otpSignup);

         // Update user's otp field with the new OTP
         user.otp = otpSignup;
         await user.save();

        return {
            status: 'OK',
            message: 'Gửi mã OTP thành công',
            data: user
             
        };
      

     

       
    } catch (error) {
        return {
            status: 'ERR',
            message: error.message
        };
    }
};

const changePassUser = async (id, password, confirmPassword) => {
    try {
        // Step 1: Find the user by id
        const user = await User.findById(id);
        if (!user) {
            return {
                status: 'ERR',
                message: 'Người dùng không tồn tại'
            };
        }

        // Step 2: Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return {
                status: 'ERR',
                message: 'Mật khẩu và xác nhận mật khẩu không khớp'
            };
        }

        // Step 3: Hash the new password
        const hash = bcrypt.hashSync(password, 10);

        // Step 4: Update user's password in the database
        user.password = hash;
        await user.save();

        return {
            status: 'OK',
            message: 'Đổi mật khẩu thành công'
        };
    } catch (error) {
        return {
            status: 'ERR',
            message: error.message
        };
    }
};


const pointUser = async (id, point) => {
    try {
        // Step 1: Find the user by id
        const user = await User.findById(id);
        if (!user) {
            return {
                status: 'ERR',
                message: 'Người dùng không tồn tại'
            };
        }else{

    
        user.point  +=point;
        await user.save();

        return {
            status: 'OK',
            message: 'Cập nhật điểm thưởng thành công'
        };
    }
    } catch (error) {
        return {
            status: 'ERR',
            message: error.message
        };
    }
};

const loginUser = (userLogin) =>{
    return new Promise(async(resolve, reject) =>{
        const {email, password} = userLogin
        try{
            // Check xem email đã tồn tại trong db hay chưa, nếu chưa tồn tại trả về null
            const checkUser = await User.findOne({
                email : email
            })
          if(checkUser===null){
            resolve({
                status: 'ERR',
                message: 'Tài khoản không tồn tại'
            })
          }


          if (!checkUser.confirmed) {
            resolve({
                status: 'ERR',
                message: 'Tài khoản chưa được xác thực'
            });
            return;
        }
        //   Kiểm tra password mã hóa và password mã hóa được lưu trong db
        // comparePassword là true thì mật khẩu trùng khớp và ngược lại
          const comparePassword  = bcrypt.compareSync(password, checkUser.password)
            // gọi bên model
            // const createdUser = await User.create({
            //     name, 
            //     email, 
            //     password: hash, 
            //     phone
            // })
            // if(createdUser){
                if(!comparePassword){
                    resolve({
                        status: 'ERR',
                        message: 'Mật khẩu không đúng'
                    })
                }


                // Mình sẽ lấy được 1 cái mã access_token, paste nó vào jwt.io là biết được id và isadmin của cái tài khoản đó
                const access_token = await generalAccessToken({
                    id: checkUser.id,
                    isAdmin: checkUser.isAdmin
                })

                // Trong trường hợp access_token hết hạn thì refresh token sẽ cấp lại 1 cái token mới
                const refresh_token = await generalRefreshToken({
                    id: checkUser.id,
                    isAdmin: checkUser.isAdmin
                })

                // Trả về cái thằng user có cái email đó sau khi hoàn thành các bước kiểm tra
                // Không trả về user mà trả về cái access_token của cái tài khoản đó
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    access_token,
                    refresh_token
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}

const updateUser = (id, data) =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
            const checkUser = await User.findOne({
                _id: id
            })
            if(checkUser===null){
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                })
            }
            // update user
            const updatedUser = await User.findByIdAndUpdate(id, data, {new : true})
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    // Trả về user mới sau khi update
                    data: updatedUser
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}

const deleteUser = (id) =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
            const checkUser = await User.findOne({
                _id: id
            })
            if(checkUser===null){
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                })
            }
            // delete user
             await User.findByIdAndDelete(id)
                resolve({
                    status: 'OK',
                    message: 'DELETE USER SUCCESS',
                    // Trả về user mới sau khi update
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}

const deleteManyUser = (ids) =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
           
            // delete user
             await User.deleteMany({_id: ids})
                resolve({
                    status: 'OK',
                    message: 'DELETE USER SUCCESS',
                    // Trả về user mới sau khi update
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}


const getAllUser = () =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
           
            // get all user
           const allUser =  await User.find()
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: allUser
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}

const getDetailsUser = (id) =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
            const user = await User.findOne({
                _id: id
            })
            console.log('user',user)
            if(user===null){
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                })
            }
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: user
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}


module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailsUser,
    deleteManyUser,
    verifyUser,
    forgotPassUser,
    changePassUser,
    pointUser
  
}