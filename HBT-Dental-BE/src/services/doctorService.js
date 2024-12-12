import db from "../models/index";
require("dotenv").config();
import _ from "lodash";
import emailService from "../services/emailService";
const textToImage = require("text-to-image");
const { Op } = require("sequelize");
const nodeHtmlToImage = require("node-html-to-image");
const { Sequelize } = require("sequelize");
const fs = require("fs");

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

const units = [
  { key: "pill", valueVi: "Viên", valueEn: "Pill" },
  { key: "package", valueVi: "Gói", valueEn: "Package" },
  { key: "bottle", valueVi: "Chai", valueEn: "Bottle" },
  { key: "tube", valueVi: "Ống", valueEn: "Tube" },
  { key: "set", valueVi: "Bộ", valueEn: "Set" },
];

let getTopDoctorHome = (dataInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      let options = {
        where: { roleId: "R2" },
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Doctor_Infor,
            attributes: ["specialtyId"],
            include: [
              {
                model: db.Specialty,
                as: "specialtyData",
                attributes: ["name"],
              },
            ],
          },
        ],
        raw: true,
        nest: true,
      };

      if (dataInput.limit) options.limit = parseInt(dataInput.limit);

      let users = await db.User.findAll(options);

      resolve({
        errCode: 0,
        data: users,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getAllDoctors = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: { roleId: "R2" },
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Doctor_Infor,
            attributes: ["specialtyId", "provinceId"],
            include: [
              {
                model: db.Specialty,
                as: "specialtyData",
                attributes: ["name"],
              },
              {
                model: db.Allcode,
                as: "provinceTypeData",
                attributes: ["valueEn", "valueVi"],
              },
              {
                model: db.Clinic,
                as: "clinicData",
                attributes: ["name"],
              },
            ],
          },
        ],
        raw: true,
        nest: true,
      });

      resolve({
        errCode: 0,
        data: doctors,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let filterDoctors = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let options = {
        where: {},
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Doctor_Infor,
            attributes: ["specialtyId", "provinceId"],
            include: [
              {
                model: db.Specialty,
                as: "specialtyData",
                attributes: ["name"],
              },
              {
                model: db.Allcode,
                as: "provinceTypeData",
                attributes: ["valueEn", "valueVi"],
              },
              {
                model: db.Clinic,
                as: "clinicData",
                attributes: ["name"],
              },
            ],
          },
        ],
        raw: true,
        nest: true,
      };

      let firstName = data.firstName;
      let lastName = data.lastName;
      let role = "R2";
      let position = data.position;

      if (firstName) {
        options.where.firstName = {
          [Op.like]: "%" + firstName + "%",
        };
      }
      if (lastName) {
        options.where.lastName = {
          [Op.like]: "%" + lastName + "%",
        };
      }
      if (position) options.where.positionId = position;
      if (role) options.where.roleId = role;

      let dataDoctors = await db.User.findAll(options);

      // Convert image buffer to Base64 for each doctor
      if (data && data.image) {
        data.image = new Buffer(data.image, "base64").toString("binary");
      }

      dataDoctors = dataDoctors.map((doctor) => {
        if (doctor.image) {
          doctor.image = new Buffer(doctor.image, "base64").toString("binary");
        }
        return doctor;
      });

      resolve({
        errCode: 0,
        data: dataDoctors,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// let getAllDoctors = () => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let doctors = await db.User.findAll({
//         where: { roleId: "R2" },
//         attributes: {
//           exclude: ["password", "image"],
//         },
//       });

//       resolve({
//         errCode: 0,
//         data: doctors,
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };
let checkRequiredFields = (inputData) => {
  let arrFields = [
    "doctorId",
    "contentHTML",
    "contentMarkdown",
    "action",
    "selectedPrice",
    "selectedPayment",
    "selectedProvice",
    "nameClinic",
    "addressClinic",
    "note",
    "specialtyId",
  ];

  let isValid = true;
  let element = "";
  for (let i = 0; i < arrFields.length; i++) {
    if (!inputData[arrFields[i]]) {
      isValid = false;
      element = arrFields[i];
      break;
    }
  }
  return {
    isValid: isValid,
    element: element,
  };
};

let saveDetailInforDoctor = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      let checkObj = checkRequiredFields(inputData);
      if (checkObj.isValid === false) {
        resolve({
          errCode: 1,
          errMessage: `Missing parameter: ${checkObj.element}`,
        });
      } else {
        //upsert to Markdown
        if (inputData.action === "CREATE") {
          await db.Markdown.create({
            contentHTML: inputData.contentHTML,
            contentMarkdown: inputData.contentMarkdown,
            description: inputData.description,
            doctorId: inputData.doctorId,
          });
        } else if (inputData.action === "EDIT") {
          let doctorMarkdown = await db.Markdown.findOne({
            where: { doctorId: inputData.doctorId },
            raw: false,
          });

          if (doctorMarkdown) {
            doctorMarkdown.contentHTML = inputData.contentHTML;
            doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
            doctorMarkdown.description = inputData.description;
            doctorMarkdown.doctorId = inputData.doctorId;
            // doctorMarkdown.updatedAt = new Date();
            await doctorMarkdown.save();
          }
        }

        //upsert to Doctor_infor tabel
        let doctorInfor = await db.Doctor_Infor.findOne({
          where: {
            doctorId: inputData.doctorId,
          },
          raw: false,
        });

        if (doctorInfor) {
          //update
          doctorInfor.doctorId = inputData.doctorId;
          doctorInfor.priceId = inputData.selectedPrice;
          doctorInfor.provinceId = inputData.selectedProvice;
          doctorInfor.paymentId = inputData.selectedPayment;
          doctorInfor.nameClinic = inputData.nameClinic;
          doctorInfor.addressClinic = inputData.addressClinic;
          doctorInfor.note = inputData.note;
          doctorInfor.specialtyId = inputData.specialtyId;
          doctorInfor.clinicId = inputData.clinicId;

          await doctorInfor.save();
        } else {
          //create
          await db.Doctor_Infor.create({
            doctorId: inputData.doctorId,
            priceId: inputData.selectedPrice,
            provinceId: inputData.selectedProvice,
            paymentId: inputData.selectedPayment,
            nameClinic: inputData.nameClinic,
            addressClinic: inputData.addressClinic,
            note: inputData.note,
            specialtyId: inputData.specialtyId,
            clinicId: inputData.clinicId,
          });
        }
        resolve({
          errCode: 0,
          errMessage: "Save infor doctor succeed!",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getDetailDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else {
        let data = await db.User.findOne({
          where: { id: inputId },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentHTML", "contentMarkdown"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });

        //convert image tu buffer sang base64
        if (data && data.image) {
          data.image = new Buffer(data.image, "base64").toString("binary");
        }

        if (!data) {
          data = {};
        }

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let bulkCreateSchedule = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.arrSchedule || !data.doctorId || !data.date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required param",
        });
      } else {
        let schedule = data.arrSchedule;
        if (schedule && schedule.length > 0) {
          schedule = schedule.map((item) => {
            item.maxNumber = MAX_NUMBER_SCHEDULE;
            return item;
          });
        }

        //get all existing data
        let existing = await db.Schedule.findAll({
          where: { doctorId: data.doctorId, date: data.date },
          attributes: ["timeType", "date", "doctorId", "maxNumber"],
          raw: true,
        });

        //convert date
        // if (existing && existing.length > 0) {
        //   existing = existing.map((item) => {
        //     item.date = new Date(item.date).getTime();
        //     return item;
        //   });
        // }

        //compare difference
        let toCreate = _.differenceWith(schedule, existing, (a, b) => {
          return a.timeType === b.timeType && +a.date === +b.date;
        });

        //create data
        if (toCreate && toCreate.length > 0) {
          await db.Schedule.bulkCreate(toCreate);
        }

        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getScheduleByDate = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let dataSchedule = await db.Schedule.findAll({
          where: { doctorId: doctorId, date },
          include: [
            {
              model: db.Allcode,
              as: "timeTypeData",
              attributes: ["valueEn", "valueVi", "value"],
            },
            {
              model: db.User,
              as: "doctorData",
              attributes: ["firstName", "lastName"],
            },
          ],
          raw: false,
          nest: true,
        });

        if (!dataSchedule) {
          dataSchedule = [];
        }
        resolve({
          errCode: 0,
          data: dataSchedule,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getExtraInforDoctorById = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let data = await db.Doctor_Infor.findOne({
          where: { doctorId: doctorId },
          attributes: {
            exclude: ["id", "doctorId"],
          },
          include: [
            {
              model: db.Allcode,
              as: "priceTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Allcode,
              as: "provinceTypeData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Allcode,
              as: "paymentTypeData",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });

        if (!data) {
          data = [];
        }
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getProfileDoctorById = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let data = await db.User.findOne({
          where: { id: doctorId },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentHTML", "contentMarkdown"],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });

        //convert image tu buffer sang base64
        if (data && data.image) {
          data.image = new Buffer(data.image, "base64").toString("binary");
        }

        if (!data) {
          data = {};
        }

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getListPatientForDoctor = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let data = await db.Booking.findAll({
          where: { statusId: "S2", doctorId: doctorId, date: date },
          include: [
            {
              model: db.User,
              as: "patientData",
              attributes: [
                "email",
                "firstName",
                "address",
                "gender",
                "phonenumber",
              ],
              include: [
                {
                  model: db.Allcode,
                  as: "genderData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
            {
              model: db.Allcode,
              as: "timeTypeDataPatient",
              attributes: ["valueEn", "valueVi"],
            },
          ],
          raw: false,
          nest: true,
        });

        if (!data) {
          data = {};
        }

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const removeVietnameseTones = (str) => {
  if (!str) return str;
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

let getAllPatient = (searchKeyword) => {
  return new Promise(async (resolve, reject) => {
    try {
      let whereCondition = {
        roleId: {
          [Op.or]: [null, "R3"],
        },
      };

      // Nếu có searchKeyword, thêm điều kiện lọc
      if (searchKeyword) {
        let normalizedKeyword =
          removeVietnameseTones(searchKeyword).toLowerCase();
        whereCondition[Op.or] = [
          Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("firstName")), {
            [Op.like]: `%${normalizedKeyword}%`,
          }),
          Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("lastName")), {
            [Op.like]: `%${normalizedKeyword}%`,
          }),
          Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("phonenumber")), {
            [Op.like]: `%${normalizedKeyword}%`,
          }),
          Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("email")), {
            [Op.like]: `%${normalizedKeyword}%`,
          }),
        ];
      }

      let users = await db.User.findAll({
        where: whereCondition,
        attributes: {
          exclude: ["password"], // Loại bỏ trường password
        },
      });

      resolve({
        errCode: 0,
        data: users,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getAllBooking = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Booking.findAll({
        where: {
          statusId: {
            [Op.or]: ["S1", "S2"], // Chỉ lấy các booking có statusId là S1 hoặc S2
          },
        },
        include: [
          {
            model: db.User,
            as: "patientData",
            attributes: [
              "email",
              "firstName",
              "address",
              "gender",
              "phonenumber",
            ],
            include: [
              {
                model: db.Allcode,
                as: "genderData",
                attributes: ["valueEn", "valueVi"],
              },
            ],
          },
          {
            model: db.User,
            as: "doctorData", // Thêm dữ liệu bác sĩ
            attributes: ["firstName", "lastName", "email", "phonenumber"],
          },
          {
            model: db.Allcode,
            as: "timeTypeDataPatient",
            attributes: ["valueEn", "valueVi"],
          },
        ],
        raw: false,
        nest: true,
      });

      if (!data) {
        data = {};
      }

      resolve({
        errCode: 0,
        data: data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getAllPatientForUser = (date) => {
  return new Promise(async (resolve, reject) => {
    try {
      let whereCondition = {
        statusId: {
          [Op.or]: ["S1", "S2"], // Lọc statusId là S1 hoặc S2
        },
      };

      // Nếu `date` được cung cấp, thêm điều kiện lọc theo `date`
      if (date) {
        whereCondition.date = date;
      }

      let data = await db.Booking.findAll({
        where: whereCondition, // Áp dụng điều kiện where linh hoạt
        include: [
          {
            model: db.User,
            as: "patientData",
            attributes: [
              "email",
              "firstName",
              "address",
              "gender",
              "phonenumber",
            ],
            include: [
              {
                model: db.Allcode,
                as: "genderData",
                attributes: ["valueEn", "valueVi"],
              },
            ],
          },
          {
            model: db.User,
            as: "doctorData", // Thêm dữ liệu bác sĩ
            attributes: ["firstName", "lastName", "email", "phonenumber"],
          },
          {
            model: db.Allcode,
            as: "timeTypeDataPatient",
            attributes: ["valueEn", "valueVi"],
          },
        ],
        raw: false,
        nest: true,
      });

      if (!data) {
        data = {};
      }

      resolve({
        errCode: 0,
        data: data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const changeStatusBookingById = async (id, statusId) => {
  try {
    // Validate input
    if (!id || !statusId) {
      return {
        errCode: 1,
        errMessage: "Missing required parameters",
      };
    }

    // Find booking by ID
    let booking = await db.Booking.findOne({
      where: { id: id },
      raw: false, // Đảm bảo trả về instance của model
    });

    if (!booking) {
      return {
        errCode: 2,
        errMessage: "Booking not found",
      };
    }

    // Update statusId
    booking.statusId = statusId;
    await booking.save();

    return {
      errCode: 0,
      errMessage: "Status updated successfully",
    };
  } catch (error) {
    console.error("Error updating status:", error);
    return {
      errCode: -1,
      errMessage: "Internal server error",
    };
  }
};

let getBookingById = (bookingId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!bookingId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let data = await db.Booking.findOne({
          where: { id: bookingId },
          include: [
            {
              model: db.User,
              as: "patientData",
              attributes: [
                "email",
                "firstName",
                "address",
                "gender",
                "phonenumber",
              ],
              include: [
                {
                  model: db.Allcode,
                  as: "genderData",
                  attributes: ["valueEn", "valueVi"],
                },
              ],
            },
            {
              model: db.Allcode,
              as: "timeTypeDataPatient",
              attributes: ["valueEn", "valueVi"],
            },
            {
              model: db.Specialty,
              as: "specialtyData",
              attributes: ["name", "price", "isDental"],
            },
          ],
          raw: false,
          nest: true,
        });

        if (!data) {
          data = {};
        }

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let cancelBooking = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.date || !data.doctorId || !data.patientId || !data.timeType) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        //update booking status
        let appoinment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            timeType: data.timeType,
            date: data.date,
            statusId: "S2",
          },
          raw: false,
        });

        if (appoinment) {
          appoinment.statusId = "S4";
          await appoinment.save();
        }

        resolve({
          errCode: 0,
          errMessage: "ok",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let sendRemedy = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.patientId ||
        !data.bookingId ||
        !data.imgBase64 ||
        !data.historyId || // Thêm kiểm tra historyId
        !data.paymentMethod
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        // Find the history record
        let historyRecord = await db.History.findOne({
          where: { id: data.historyId },
          raw: false,
        });

        if (!historyRecord) {
          return resolve({
            errCode: 2,
            errMessage: "History not found",
          });
        }

        // Update paymentMethod and paymentStatus
        historyRecord.paymentMethod = data.paymentMethod;
        historyRecord.paymentStatus = true;
        await historyRecord.save();

        // Update patient status in Booking
        let appointment = await db.Booking.findOne({
          where: {
            id: data.bookingId,
          },
          raw: false,
        });

        if (appointment) {
          appointment.statusId = "S3";
          await appointment.save();
        }

        // Send email with remedy
        await emailService.sendAttachment(data);

        // Create Invoice table record
        await db.Invoice.create({
          doctorId: data.doctorId,
          patientId: data.patientId,
          specialtyId: data.specialtyId,
          totalCost: data.totalCost ? data.totalCost : 0,
        });

        // Update total revenue for the doctor
        let doctor = await db.User.findOne({
          where: { id: data.doctorId },
          raw: false,
        });

        if (doctor) {
          doctor.totalRevenue =
            doctor.totalRevenue + parseInt(data.totalCost || 0);
          await doctor.save();
        }

        // Update total cost for the patient
        let patient = await db.User.findOne({
          where: { id: data.patientId },
          raw: false,
        });

        if (patient) {
          patient.totalCost = patient.totalCost + parseInt(data.totalCost || 0);
          await patient.save();
        }

        resolve({
          errCode: 0,
          errMessage: "ok",
        });
      }
    } catch (e) {
      console.error("Error in sendRemedy:", e);
      reject({
        errCode: -1,
        errMessage: "Internal server error",
      });
    }
  });
};

let handleGetValueUnitDrug = (drugKey, language) => {
  for (let i = 0; units.length - 1; i++) {
    if (units[i].key == drugKey) {
      if (language == "vi") return units[i].valueVi;
      else return units[i].valueEn;
    }
  }
};
let createRemedy = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra các tham số đầu vào
      if (
        !data.doctorId ||
        !data.patientId ||
        !data.timeType ||
        !data.date ||
        !data.token ||
        !data.patientName ||
        !data.email ||
        // !data.desciption ||
        !Array.isArray(data.listSeletedDrugs) ||
        !Array.isArray(data.listSelectedTeeth) ||
        typeof data.examinationFee !== "number" ||
        typeof data.additionalFee !== "number" ||
        typeof data.totalFee !== "number" ||
        typeof data.totalDiscount !== "number"
      ) {
        return resolve({
          errCode: 1,
          errMessage: "Missing or invalid required parameters",
        });
      }

      // Kiểm tra giá trị số
      if (
        data.examinationFee < 0 ||
        data.additionalFee < 0 ||
        data.totalFee < 0 ||
        data.totalDiscount < 0
      ) {
        return resolve({
          errCode: 2,
          errMessage: "Invalid fee values",
        });
      }

      // Định nghĩa đơn vị thuốc
      const units = [
        { key: "pill", valueVi: "Viên", valueEn: "Pill" },
        { key: "package", valueVi: "Gói", valueEn: "Package" },
        { key: "bottle", valueVi: "Chai", valueEn: "Bottle" },
        { key: "tube", valueVi: "Ống", valueEn: "Tube" },
        { key: "set", valueVi: "Bộ", valueEn: "Set" },
      ];

      // Hàm để lấy tên đơn vị thuốc bằng tiếng Việt
      const getUnitNameVi = (key) => {
        const unit = units.find((u) => u.key === key);
        return unit ? unit.valueVi : "Không có";
      };

      let today = new Date();
      let dd = String(today.getDate()).padStart(2, "0");
      let mm = String(today.getMonth() + 1).padStart(2, "0");
      let yyyy = today.getFullYear();
      today = `${dd}/${mm}/${yyyy}`;

      // Danh sách răng điều trị
      const teethRows = data.listSelectedTeeth
        .map((tooth, index) => {
          const thanhTien = (tooth.servicePrice || 0) - (tooth.discount || 0); // Tính thành tiền
          return `
            <tr>
              <td>${index + 1}</td>
              <td>${tooth.code}</td>
              <td>${tooth.serviceName || "Không có"}</td>
              <td>${tooth.servicePrice.toLocaleString()} VND</td>
              <td>${tooth.servicePrice.toLocaleString()} VND</td>
            </tr>`;
        })
        .join("");

      // Thêm dịch vụ khám vào bảng nếu isDental là false
      const serviceRow = !data.isDental
        ? `
          <tr>
            <td>-</td>
            <td>CASE</td>
            <td>${data.specialtyData?.name || "Không có"}</td>
            <td>${data.specialtyData?.price.toLocaleString() || "0"} VND</td>
            <td>${data.specialtyData?.price.toLocaleString() || "0"} VND</td>
          </tr>`
        : "";

      // Danh sách thuốc
      const drugRows = data.listSeletedDrugs
        .map((drug, index) => {
          return `
            <tr>
              <td>${index + 1}</td>
              <td>${drug.name || "Không có"}</td>
              <td>${getUnitNameVi(drug.unit)}</td>
              <td>${drug.amount || 0}</td>
              <td>${drug.description_usage || "Không có"}</td>
            </tr>`;
        })
        .join("");

      // Nội dung HTML hóa đơn
      const contentBillHTML = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.5;
                padding: 20px;
              }
              h3, h4 {
                margin: 0;
              }
              .header, .footer {
                text-align: center;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h3>NHA KHOA HBT</h3>
              <h4>Địa chỉ: 877 Tân Kỳ Tân Quý, P.Bình Hưng Hóa A, Q.Bình Tân, TP.HCM</h4>
              <h4>Điện thoại: 0906.070.338</h4>
              <h4>Email: phongkhamnhakhoahbt@gmail.com</h4>
            </div>
            <h2 style="text-align: center;">HÓA ĐƠN ĐIỀU TRỊ RĂNG</h2>
            <p>Ngày: ${today}</p>
            <p>Bác sĩ điều trị: ${data.doctorName}</p>
            <p>Họ và tên bệnh nhân: ${data.patientName}</p>
            <p>Email: ${data.email}</p>
            <h4>Danh sách răng điều trị</h4>
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Răng</th>
                  <th>Tên dịch vụ điều trị</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${teethRows}
                ${serviceRow} <!-- Thêm dịch vụ khám nếu isDental là false -->
              </tbody>
            </table>
            <h4>Danh sách thuốc</h4>
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên thuốc</th>
                  <th>Đơn vị</th>
                  <th>Số lượng</th>
                  <th>Hướng dẫn sử dụng</th>
                </tr>
              </thead>
              <tbody>
                ${drugRows}
              </tbody>
            </table>
            <h4>Chi phí điều trị</h4>
            <p>Phí khám: ${data.examinationFee.toLocaleString()} VND</p>
            <p>Phí phát sinh: ${data.additionalFee.toLocaleString()} VND</p>
            <p>Tổng giảm giá: ${data.totalDiscount.toLocaleString()} VND</p>
            <p>Mô tả phí phát sinh: ${
              data.additionalFeeDescription || "Không có"
            }</p>
            <p><strong>Tổng phí: ${data.totalFee.toLocaleString()} VND</strong></p>
          </body>
        </html>
      `;

      // Tạo hóa đơn dưới dạng hình ảnh
      const billImage = await nodeHtmlToImage({
        html: contentBillHTML,
        quality: 100,
        type: "jpeg",
      });

      const billImageBase64 =
        "data:image/jpeg;base64," + billImage.toString("base64");

      let appointment = await db.Booking.findOne({
        where: {
          doctorId: data.doctorId,
          patientId: data.patientId,
          timeType: data.timeType,
          date: data.date,
          token: data.token,
        },
        raw: false,
      });

      if (appointment) {
        appointment.imageRemedy = billImageBase64;
        await appointment.save();
      }

      await db.History.create({
        doctorId: data.doctorId,
        patientId: data.patientId,
        specialtyId: appointment.specialtyId,
        description: data.desciption,
        files: billImageBase64,
        drugs: JSON.stringify(data.listSeletedDrugs),
        reason: data.patientReason,
        teethExamined: JSON.stringify(data.listSelectedTeeth),
        examinationFee: data.examinationFee,
        additionalFee: data.additionalFee,
        bookingId: appointment.id,
        totalFee: data.totalFee,
        additionalFeeDescription: data.additionalFeeDescription,
        totalDiscount: data.totalDiscount,
      });

      resolve({
        errCode: 0,
        errMessage: "ok",
      });
    } catch (e) {
      console.error("Error in createRemedy:", e);
      reject({
        errCode: 500,
        errMessage: "Internal server error",
      });
    }
  });
};

module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctors: getAllDoctors,
  saveDetailInforDoctor: saveDetailInforDoctor,
  getDetailDoctorById: getDetailDoctorById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleByDate: getScheduleByDate,
  getExtraInforDoctorById: getExtraInforDoctorById,
  getProfileDoctorById: getProfileDoctorById,
  getListPatientForDoctor: getListPatientForDoctor,
  sendRemedy: sendRemedy,
  cancelBooking: cancelBooking,
  createRemedy: createRemedy,
  getBookingById: getBookingById,
  filterDoctors: filterDoctors,
  getAllBooking: getAllBooking,
  changeStatusBookingById: changeStatusBookingById,
  getAllPatientForUser: getAllPatientForUser,
  getAllPatient: getAllPatient,
};
