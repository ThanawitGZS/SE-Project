import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import Loadable from "../components/third-party/Loadable";

import FullLayout from "../components/FullLayout/fullLayout";

const LoginPages = Loadable(lazy(() => import("../components/Pages/login/login")));
const Dashboard = Loadable(lazy(() => import("../components/Pages/dashboard/dashboard")))

const Room = Loadable(lazy(() => import("../components/Pages/Room/index")))
const FacilityManager = Loadable(lazy(() => import("../components/Pages/Facility/Manager/index")))
const FacilityBooking = Loadable(lazy(() => import("../components/Pages/Facility/Member/index")))

const ProfileEdit = Loadable(lazy(() => import("../components/Pages/ProfileEdit/profileEdit")))
const ChangePassword = Loadable(lazy(() => import("../components/Pages/ProfileEdit/changePassword")))

const Employee = Loadable(lazy(() => import("../components/Pages/Employee/employee")))
const CreateEmployee = Loadable(lazy(() => import("../components/Pages/Employee/create/createEmployee")))
const EditEmployee = Loadable(lazy(() => import("../components/Pages/Employee/edit/editEmployee")))

const Member = Loadable(lazy(() => import("../components/Pages/Member/member")))
const CreateMember = Loadable(lazy(() => import("../components/Pages/Member/create/createMember")))
const EditMember = Loadable(lazy(() => import("../components/Pages/Member/edit/editMember")))


// const ProfileEdit = Loadable(lazy(() => import("")))

const AdminRoutes = (isLoggedIn: boolean, role: string): RouteObject => {

    const employeeRoutes = [
        {
          path: "/employee",
          element: <Employee />,
        },
        {
          path: "/employee/create",
          element: <CreateEmployee />,
        },
        {
          path: "/employee/edit/:id",
          element: <EditEmployee />,
        },
    ];

    const memberRoutes = [
      {
        path: "/member",
        element: <Member />,
      },
      {
        path: "/member/create",
        element: <CreateMember />,
      },
      {
        path: "/member/edit/:id",
        element: <EditMember />,
      },
    ];

    return {
        path: "/",
        element: isLoggedIn ? <FullLayout /> : <LoginPages />,
        children: [
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
            path: "/profileEdit",
            element: <ProfileEdit />,
        },
        {
            path: "/changePassword",
            element: <ChangePassword />,
        },
        {
            path: "/booking",
            element: <FacilityBooking />,
        },

        ...(role === "Employee" || role === "Manager" ? [
          // {
          //   path: "/room",
          //   element: <Room />,
          // },
        ] : []),

        ...(role === "Manager" ? [
          {
            path: "/employee",
            children: employeeRoutes,
          },
          {
            path: "/member",
            children: memberRoutes,
          },
          {
            path: "/room",
            element: <Room/>,
          },
          {
            path: "/facilityarea",
            element: <FacilityManager/>,
          }
        ] : []),

        ]
    }
}

export default AdminRoutes;