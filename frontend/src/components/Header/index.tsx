import { useState, useEffect } from 'react';
import { Layout, ConfigProvider, MenuProps, Menu, message  , Dropdown } from 'antd';
import { IdcardOutlined, TeamOutlined, AppstoreOutlined , LogoutOutlined , HomeOutlined , SmileOutlined , RobotOutlined , ProductOutlined } from '@ant-design/icons';
import Logo from '../../assets/logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import 'antd/dist/reset.css';
import "../Header/index.css";

import { PositionInterface } from '../../interfaces/Position';
import { GetPositions } from '../../services/https';
import { EmployeeInterface } from '../../interfaces/Employee';
import { GetEmployeeByID } from '../../services/https';

type MenuItem = Required<MenuProps>['items'][number];

const { Header } = Layout;

function HeaderComponent() {
  const [current, setCurrent] = useState("course");
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();

  const [_firstName, setFirstName] = useState("");
  const [_lastName, setLastName] = useState("");
  const [_positionName, setPositionName] = useState("");
  const [profile, setProfile] = useState("");
  const employeeID = localStorage.getItem("employeeID");

  const getEmployeeById = async () => {
    try {
      const res = await GetEmployeeByID(employeeID || "");
      if (res.status === 200) {
        const employee: EmployeeInterface = res.data;
        setFirstName(employee.FirstName || "");
        setLastName(employee.LastName || "");
        setProfile(employee.Profile || "");
        if (employee.PositionID) {
          getPositionNameById(employee.PositionID); // Fetch position name based on PositionID
        } else {
          setPositionName("Unknown Position");
        }
      } else {
        messageApi.error(res.data.error || "ไม่สามารถดึงข้อมูลได้");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
  };

  const getPositionNameById = async (positionID: number) => {
    try {
      const res = await GetPositions(); // Fetch all positions
      if (res.status === 200) {
        const positions: PositionInterface[] = res.data;
        const position = positions.find((pos) => pos.ID === positionID);
        if (position) {
          setPositionName(position.Name || "Unknown Position");
        } else {
          setPositionName("Unknown Position");
        }
      } else {
        messageApi.error(res.data.error || "ไม่สามารถดึงตำแหน่งได้");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูลตำแหน่ง");
    }
  };
  
  const items: MenuItem[] = [
    {
      label: "สมาชิก", // ชื่อเมนูหลัก
      key: "Member",
      icon: <TeamOutlined />,
      popupClassName: "custom-submenu", // คลาสสำหรับเมนูย่อย
      children: [
        {
          label: <Link to="/employee">พนักงาน</Link>, // ลิงก์ไปยังหน้า "รายชื่อสมาชิก"
          key: "employee",
          icon: <RobotOutlined />,
        },
        {
          label: <Link to="/member">ผู้พักอาศัย</Link>, // ลิงก์ไปยังหน้า "เพิ่มสมาชิก"
          key: "member",
          icon: <SmileOutlined />,
        },
      ],
    },
    {
      label: "การจัดการ",
      key: "Mangae",
      icon: <AppstoreOutlined />,
      popupClassName: "custom-submenu",
      children: [
        {
          label: <Link to="/room">ห้องพัก</Link>,
          key: "Room",
          icon: <HomeOutlined />,
        },
        {
          label: <Link to="/facilityarea">พื้นที่ส่วนกลาง</Link>,
          key: "Facility",
          icon: <ProductOutlined />,
        },
        {
          label: <Link to="/">สัญญาเช่า</Link>,
          key: "Contract",
          icon: <SmileOutlined />,
        },
        {
          label: <Link to="/">พัสดุ</Link>,
          key: "Parcel",
          icon: <SmileOutlined />,
        },
      ],
    },
    {
      label: "ค่าใช้จ่ายและบิล",
      key: "Bill",
      icon: <TeamOutlined />,
      popupClassName: "custom-submenu",
      children: [
        {
          label: <Link to="/">จดมิตเตอร์</Link>,
          key: "A",
          icon: <RobotOutlined />,
        },
        {
          label: <Link to="/">ค่าใช่จ่ายเพิ่มเติม</Link>,
          key: "B",
          icon: <SmileOutlined />,
        },
        {
          label: <Link to="/">อัตราค่าบริการ</Link>,
          key: "C",
          icon: <SmileOutlined />,
        },
        {
          label: <Link to="/">จัดการบิล</Link>,
          key: "D",
          icon: <SmileOutlined />,
        },
      ],
    },
    {
      label: "บริการ",
      key: "Serve",
      icon: <TeamOutlined />,
      popupClassName: "custom-submenu",
      children: [
        {
          label: <Link to="/">ตรวจสอบการเงิน</Link>,
          key: "Money",
          icon: <RobotOutlined />,
        },
        {
          label: <Link to="/">มอบหมายงาน</Link>,
          key: "Work",
          icon: <SmileOutlined />,
        },
        {
          label: <Link to="/">รายงานการทำงาน</Link>,
          key: "Report",
          icon: <SmileOutlined />,
        },
      ],
    },
  ];
  
  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
    
    if (e.key === 'logout') {
      localStorage.clear(); 
      
      message.success("ออกจากระบบสำเร็จ");
      
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  };
  
  useEffect(() => {
    getEmployeeById();
    setCurrent(location.pathname.substring(1) || '');
  }, [location]);
  
  const profileMenu = (
    <Menu onClick={onClick}>
      <Menu.Item key="profile" icon={<IdcardOutlined />}>
        <Link to="/profileEdit">จัดการโปรไฟล์</Link>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        ออกจากระบบ
      </Menu.Item>
    </Menu>
  );
  
  return (
    <>
      {contextHolder}
      <Header
        // style={{
        //   background: '#333D51',
        //   padding: '0 20px',
        //   height: '70px',
        //   display: 'flex',
        //   width: '100%',
        //   position: 'fixed',
        //   top: 0,
        //   zIndex: 1000,
        //   alignItems: 'center',
        //   justifyContent: 'space-between',  
        // }}

        style={{
          background: '#333D51',
          padding: '0 20px',
          height: '65px',
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100px',
            height: '100%',
          }}
        >
          <Link to="/dashboard">
            <img
              src={Logo}
              alt="Logo"
              style={{ width: '65px', height: '100%', cursor: 'pointer' }} // เพิ่ม cursor: 'pointer' เพื่อให้เห็นว่าเป็นลิงก์
            />
          </Link>
        </div>

        <ConfigProvider
          theme={{
            components: {
              Menu: {
                iconSize: 18,
                itemColor: '#FFFFFF', 
                // itemHoverColor: '#0F0F0F',
                colorPrimary: 'none',
              },
            },
          }}
        >
          <div
            style={{
              justifyContent: 'center',
              width:'100%',
              alignItems: 'center',
              gap: '15px',
              padding: 0,
              margin: 0,
            }}
          >

            <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} 
              style={{
                backgroundColor: '#333D51',
              }}
            />

          </div>
        </ConfigProvider>
      
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                iconSize: 20,
                itemColor: '#555555',
                itemHoverColor: '#D3AC2B',
                colorPrimary: 'none',
              },
            },
          }}
        > 

          <Dropdown overlay={profileMenu} placement="bottomRight" trigger={['click']}>
            <div className="profile-container" style={{ cursor: 'pointer' }}>
              <img
                src={profile}
                alt="Profile"
                style={{ width: '45px', height: '45px', borderRadius: '50%' }}
              />
            </div>
          </Dropdown>

          
        </ConfigProvider>
      </Header>
    </>
  );
}

export default HeaderComponent;