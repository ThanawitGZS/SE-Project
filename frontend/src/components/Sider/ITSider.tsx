import { useState, useEffect } from "react";
import { Layout, Menu, message, Button } from "antd";
import {
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
  DollarOutlined,
  AppstoreOutlined,
  SolutionOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  TeamOutlined,
  OrderedListOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import "../../App.css";

function ITSider() {
    const page = localStorage.getItem("page");
    const { Sider } = Layout;
    const [messageApi, contextHolder] = message.useMessage();
    const [collapsed, setCollapsed] = useState(false);
    const [currentTime, setCurrentTime] = useState<string>("");
  
    useEffect(() => {
      const interval = setInterval(() => {
        const current = new Date();
        const formattedTime = current.toLocaleTimeString();
        setCurrentTime(formattedTime);
      }, 1000);
  
      // Clean up the interval when component unmounts
      return () => clearInterval(interval);
    }, []);
  
    const setCurrentPage = (val: string) => {
      localStorage.setItem("page", val);
    };
  
    const Logout = () => {
      localStorage.clear();
      messageApi.success("ออกจากระบบสำเร็จ");
      setTimeout(() => {
        location.href = "/login";
      }, 2000);
    };
  
    const toggleCollapsed = () => {
      setCollapsed(!collapsed);
    };
  
    return (
      <>
        {contextHolder}
        <Sider collapsed={collapsed} className="custom-sider">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
            }}
          >
            <div style={{ position: "relative" }}>
              {/* <Button onClick={toggleCollapsed} className="toggle-button">
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </Button> */}
              
              <Menu
                className="menu"
                defaultSelectedKeys={[page ? page : "dashboard"]}
                mode="inline"
                inlineCollapsed={collapsed}
              >
                <Menu.Item
                  key="dashboard"
                  onClick={() => setCurrentPage("dashboard")}
                >
                  <Link to="/dashboard">
                    <DashboardOutlined />
                    <span>แดชบอร์ด</span>
                  </Link>
                </Menu.Item>
  
                {/* <Menu.Item key="member" onClick={() => setCurrentPage("member")}>
                  <Link to="/member">
                    <UserOutlined />
                    <span>สมาชิก</span>
                  </Link>
                </Menu.Item>
  
                <Menu.Item key="table" onClick={() => setCurrentPage("table")}>
                  <Link to="/booking">
                    <SolutionOutlined />
                    <span>จองโต๊ะ</span>
                  </Link>
                </Menu.Item>
  
                <Menu.Item
                  key="payment"
                  onClick={() => setCurrentPage("payment")}
                >
                  <Link to="/receipt">
                    <DollarOutlined />
                    <span>ชำระเงิน</span>
                  </Link>
                </Menu.Item>
                <Menu.Item key="coupon" onClick={() => setCurrentPage("coupon")}>
                  <Link to="/coupon">
                    <CodeOutlined />
                    <span>คูปอง</span>
                  </Link>
                </Menu.Item>
  
                <Menu.Item key="Order" onClick={() => setCurrentPage("Order")}>
                  <Link to="/order">
                    <OrderedListOutlined />
                    <span>รายละเอียดออเดอร์</span>
                  </Link>
                </Menu.Item>
  
                <Menu.Item key="stock" onClick={() => setCurrentPage("stock")}>
                  <Link to="/ManageStock">
                    <AppstoreOutlined />
                    <span>จัดการข้อมูลสินค้า</span>
                  </Link>
                </Menu.Item>
  
                <Menu.Item
                  key="employee"
                  onClick={() => setCurrentPage("employee")}
                >
                  <Link to="/employee">
                    <TeamOutlined />
                    <span>พนักงาน</span>
                  </Link>
                </Menu.Item> */}
              </Menu>
            </div>
  
            <Menu className="menu" mode="inline">
              <Menu.Item key="logout" onClick={Logout}>
                <LogoutOutlined />
                <span>ออกจากระบบ</span>
              </Menu.Item>
            </Menu>
          </div>
        </Sider>
      </>
    );
  }
  
  export default ITSider;