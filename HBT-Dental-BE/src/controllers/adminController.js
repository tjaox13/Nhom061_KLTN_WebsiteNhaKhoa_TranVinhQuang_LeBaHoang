import adminService from "../services/adminService";

let getRevenueByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query; // Lấy ngày từ query string

    // Kiểm tra xem startDate và endDate có được cung cấp không
    if (!startDate || !endDate) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Vui lòng cung cấp startDate và endDate",
      });
    }

    // Gọi service để lấy dữ liệu doanh thu
    let infor = await adminService.getRevenueByDateRange(startDate, endDate);

    return res.status(200).json(infor);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi từ server",
    });
  }
};

let getWeeklyRevenue = async (req, res) => {
  try {
    let infor = await adminService.getWeeklyRevenue();
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let getTotalNewUserDay = async (req, res) => {
  try {
    let infor = await adminService.getTotalNewUserDay();
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let getTotalHealthAppointmentDone = async (req, res) => {
  try {
    let infor = await adminService.getTotalHealthAppointmentDone();
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let getTotalDoctor = async (req, res) => {
  try {
    let infor = await adminService.getTotalDoctor();
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let getTopThreeDoctorsOfTheYear = async (req, res) => {
  try {
    let infor = await adminService.getTopThreeDoctorsOfTheYear();
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let getTopFourVipPatient = async (req, res) => {
  try {
    let infor = await adminService.getTopFourVipPatient();
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

let getMonthlyRevenueSpecialty = async (req, res) => {
  try {
    let infor = await adminService.getMonthlyRevenueSpecialty();
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

module.exports = {
  getWeeklyRevenue: getWeeklyRevenue,
  getTotalNewUserDay: getTotalNewUserDay,
  getTotalHealthAppointmentDone: getTotalHealthAppointmentDone,
  getTotalDoctor: getTotalDoctor,
  getTopThreeDoctorsOfTheYear: getTopThreeDoctorsOfTheYear,
  getTopFourVipPatient: getTopFourVipPatient,
  getMonthlyRevenueSpecialty: getMonthlyRevenueSpecialty,
  getRevenueByDateRange: getRevenueByDateRange,
};
