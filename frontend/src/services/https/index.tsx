import axios from "axios";
import { LoginInterface  } from "../../interfaces/Login";
import { EmployeeInterface } from "../../interfaces/Employee";
import { ChangePasswordInterface } from "../../interfaces/ChangePassword";
import { MemberInterface } from "../../interfaces/Member";
import { RoomInterface } from "../../interfaces/Room";
import { FacilityInterface } from "../../interfaces/Facility";

const apiUrl = "http://localhost:8000";
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

async function SignIn(data: LoginInterface) {
    return await axios
      .post(`${apiUrl}/signIn`, data, requestOptions)
      .then((res) => res)
      .catch((e) => e.response);
}

// Employee
async function CreateEmployee(data: EmployeeInterface) {
  return await axios
    .post(`${apiUrl}/employee`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetEmployees() {
  return await axios
    .get(`${apiUrl}/employees`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetEmployeeByID(id: string) {
  return await axios
    .get(`${apiUrl}/employee/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateEmployee(id: string | undefined, data: EmployeeInterface) {
  return await axios
    .patch(`${apiUrl}/employee/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteEmployeeByID(id: string | undefined) {
  return await axios
    .delete(`${apiUrl}/employee/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function CheckEmail(email: string) {
  return await axios
    .post(`${apiUrl}/checkEmail/${email}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function CheckPhone(phoneNumber: string) {
  return await axios
    .post(`${apiUrl}/checkPhone/${phoneNumber}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function CheckNationalID(nationalID: string) {
  return await axios
    .post(`${apiUrl}/checkNationalID/${nationalID}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function changePasswordEmployee(
  employeeID: string,
  payload: ChangePasswordInterface
) {
  return await axios
    .patch(
      `${apiUrl}/employee/${employeeID}/changePasswordEmployee`,
      payload,
      requestOptions
    )
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetGenders() {
  return await axios
    .get(`${apiUrl}/genders`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetPositions() {
  return await axios
    .get(`${apiUrl}/positions`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetPositionEmployee() {
  return await axios
    .get(`${apiUrl}/positionEmployee`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// Member
async function CreateMember(data: MemberInterface) {
  return await axios
    .post(`${apiUrl}/member`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetMembers() {
  return await axios
    .get(`${apiUrl}/members`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetMemberByID(id: string | undefined) {
  return await axios
    .get(`${apiUrl}/member/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateMember(id: string | undefined, data: MemberInterface) {
  return await axios
    .patch(`${apiUrl}/member/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteMemberByID(id: string | undefined) {
  return await axios
    .delete(`${apiUrl}/member/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function changePasswordMember(
  memberID: string,
  payload: ChangePasswordInterface
) {
  return await axios
    .patch(
      `${apiUrl}/member/${memberID}/chanagePasswordMember`,
      payload,
      requestOptions
    )
    .then((res) => res)
    .catch((e) => e.response);
}

// Room

async function CreateRoom(data: RoomInterface) {
  return await axios
    .post(`${apiUrl}/room`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateRoom(id: string | undefined, data: RoomInterface) {
  return await axios
    .patch(`${apiUrl}/room/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteRoomByID(id: string | undefined) {
  return await axios
    .delete(`${apiUrl}/room/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetRooms() {
  return await axios
    .get(`${apiUrl}/rooms`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetRoomByID(id: string | undefined) {
  return await axios
    .get(`${apiUrl}/room/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function CheckRoomName(roomName: string) {
  return await axios
    .post(`${apiUrl}/checkRoomName/${roomName}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// RoomType
async function GetRoomTypes() {
  return await axios
    .get(`${apiUrl}/roomtypes`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// RoomType
async function GetPetAllows() {
  return await axios
    .get(`${apiUrl}/petallows`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// Facility

async function CreateFacility(data: FacilityInterface) {
  return await axios
    .post(`${apiUrl}/facility`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateFacility(id: string | undefined, data: FacilityInterface) {
  return await axios
    .patch(`${apiUrl}/facility/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteFacilityByID(id: string | undefined) {
  return await axios
    .delete(`${apiUrl}/facility/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetFacilitys() {
  return await axios
    .get(`${apiUrl}/facilitys`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetFacilityOpen() {
  return await axios
    .get(`${apiUrl}/facilityOpen`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetFacilityByID(id: string | undefined) {
  return await axios
    .get(`${apiUrl}/facility/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function CheckFacilityName(facilityName: string) {
  return await axios
    .post(`${apiUrl}/checkFacilityName/${facilityName}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// FacilityType
async function GetFacilityType() {
  return await axios
    .get(`${apiUrl}/facilitytype`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// FacilityStatus
async function GetFacilityStatus() {
  return await axios
    .get(`${apiUrl}/facilitystatus`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// Booking
async function GetBookingByID(id: string) {
  return await axios
    .get(`${apiUrl}/booking/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetBookingFacilityByID(id: string) {
  return await axios
    .get(`${apiUrl}/bookingsFacility/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetBookingMemberByID(id: string) {
  return await axios
    .get(`${apiUrl}/bookingMembers/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetMemberBookingByID(id: string) {
  return await axios
    .get(`${apiUrl}/memberBooking/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreateBooking(data: RoomInterface) {
  return await axios
    .post(`${apiUrl}/booking`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteBookingByID(id: string | undefined) {
  return await axios
    .delete(`${apiUrl}/booking/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteBookingByFacilityID(id: string | undefined) {
  return await axios
    .delete(`${apiUrl}/bookings/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function CheckBooking(data: any) {
  return await axios
    .put(`${apiUrl}/checkBooking`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);

}

export {
  SignIn,
  
  CreateEmployee,
  GetEmployees,
  GetEmployeeByID,
  UpdateEmployee,
  DeleteEmployeeByID,
  changePasswordEmployee,

  CheckEmail,
  CheckPhone,
  CheckNationalID,
  GetGenders,
  GetPositions,
  GetPositionEmployee,

  CreateMember,
  GetMembers,
  GetMemberByID,
  UpdateMember,
  DeleteMemberByID,
  changePasswordMember,

  CreateRoom,
  UpdateRoom,
  DeleteRoomByID,
  CheckRoomName,
  GetRooms,
  GetRoomByID,
  GetPetAllows,
  GetRoomTypes,

  CreateFacility,
  UpdateFacility,
  DeleteFacilityByID,
  GetFacilitys,
  GetFacilityOpen,
  GetFacilityByID,
  CheckFacilityName,
  GetFacilityType,
  GetFacilityStatus,

  CreateBooking,
  DeleteBookingByID,
  DeleteBookingByFacilityID,
  GetBookingByID,
  GetBookingFacilityByID,
  GetMemberBookingByID,
  GetBookingMemberByID,
  CheckBooking,

}