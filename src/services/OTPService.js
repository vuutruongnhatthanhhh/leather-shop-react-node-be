function generateOTP() {
    let otp = '';
    for (let i = 0; i < 4; i++) {
        otp += Math.floor(Math.random() * 10); // Tạo số ngẫu nhiên từ 0 đến 9
    }
    return otp;
}

module.exports = {
    generateOTP
}