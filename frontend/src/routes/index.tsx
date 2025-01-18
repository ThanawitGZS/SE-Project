import { useRoutes, RouteObject } from "react-router-dom";
import AdminRoutes from "../routes/AdminRoutes";
import LoginRoutes from "../routes/LoginRoutes";


function ConfigRoutes() {
  const isLoggedIn = localStorage.getItem("isLogin") === "true";
  const positionID = localStorage.getItem("positionID"); 
  let role = "";
  if (positionID === '1' || positionID === '2') {
    role = "Manager"
  } else if (positionID === '6'){
    role = "Member"
  } else {
    role = "Employee"
  }
  let routes: RouteObject[] = [];

  if (isLoggedIn) {
    routes = [AdminRoutes(isLoggedIn, role || "Member"), LoginRoutes()];
  } else {
    routes = [LoginRoutes()];
  }

  return useRoutes(routes);
}

export default ConfigRoutes;

