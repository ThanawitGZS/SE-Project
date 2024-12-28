import axios from "axios";
import { LoginInterface  } from "../../interfaces/Login";
import { EmployeeInterface } from "../../interfaces/Employee";
import { ChangePasswordInterface } from "../../interfaces/ChangePassword";
import { MemberInterface } from "../../interfaces/Member";
import { RoomInterface } from "../../interfaces/Room";

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
}