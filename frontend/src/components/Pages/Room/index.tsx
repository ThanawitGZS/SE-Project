import { useEffect, useState } from "react";
import { Col, Row, Card, Select, Input , Form , Modal, Space , Button , message , Divider , InputNumber , Dropdown , Table , Radio , Pagination } from "antd";
import { PlusSquareOutlined , DeleteOutlined, EditOutlined, SettingOutlined , InboxOutlined , CheckCircleOutlined , UserOutlined , ToolOutlined , FrownOutlined , SmileOutlined} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { RoomInterface } from "../../../interfaces/Room";
import { RoomTypeInterface } from "../../../interfaces/RoomType";
import { PetAllowInterface } from "../../../interfaces/PetAllow";

import '../Room/index.css'

import { GetRoomTypes , GetRooms , GetRoomByID , GetPetAllows , CreateRoom, CheckRoomName , DeleteRoomByID , UpdateRoom } from "../../../services/https";

export default function Room() {
    const [roomtypes, setRoomTypes] = useState<RoomTypeInterface[]>([]);
    const [petallows, setPetAllows] = useState<PetAllowInterface[]>([]);
    const [rooms, setRooms] = useState<RoomInterface[]>([]);
    const employeeID = localStorage.getItem("employeeID");
    const [formCreate] = Form.useForm();
    const [formUpdate] = Form.useForm();
    const [roomID,setRoomID] = useState<string>("");
    const [messageApi, contextHolder] = message.useMessage();
    const [rname,setRName] = useState("");
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
    const [roomLimitInvalid, setRoomLimitInvalid] = useState(false);
    const [roomNameInvalid, setRoomNameInvalid] = useState(false); 

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [petAllowFilter, setPetAllowFilter] = useState<string | null>(null);
    const [minPrice, setMinPrice] = useState<number>(0); // ราคาขั้นต่ำ
    const [maxPrice, setMaxPrice] = useState<number>(100000); // ราคาขั้นสูง
    const { Option } = Select; // นำเข้า Option จาก Select โดยตรง
    const pageSize = 6;

    const filteredRooms = rooms.filter((room) => {
        // ดึงข้อมูล RoomType จาก RoomTypeID
        const roomType = roomtypes.find((type) => type.ID === room.RoomTypeID);
        const roomStatus = roomType ? roomType.Name : "ไม่ทราบ";
        const matchesPrice = room.RoomRent !== undefined && room.RoomRent >= minPrice && room.RoomRent <= maxPrice;
        const petAllowStatus = petallows.find((allow) => allow.ID === room.PetAllowID)?.Name || "ไม่ทราบ";
        
        // กรองตามชื่อห้อง
        const matchesSearch = (room.RoomName || "").toLowerCase().includes(searchTerm.toLowerCase());

        // กรองตามสถานะ
        const matchesStatus = statusFilter ? roomStatus === statusFilter : true;
        const matchesPetAllow = petAllowFilter ? petAllowStatus === petAllowFilter : true;
    
        return matchesSearch && matchesStatus && matchesPetAllow && matchesPrice;
    });

    // Helper functions to get related data
    const getRoomTypeName = (roomTypeID: number) =>
        roomtypes.find((type) => type.ID === roomTypeID)?.Name || "Unknown";

    // เรียงข้อมูลก่อน Render
    const sortedRooms = filteredRooms.sort((a, b) => {
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
        return collator.compare(a.RoomName || "", b.RoomName || "");
    });

    // สร้าง Pagination
    const paginatedRooms = sortedRooms.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const getRoomTypes = async () => {
        try {
          const res = await GetRoomTypes(); // Fetch data from the API
    
          if (res.status === 200) {
            setRoomTypes(res.data); // Set the data from the API response
          } else {
            setRoomTypes([]);
            messageApi.error(res.data.error || "ไม่สามารถดึงข้อมูลได้");
          }
        } catch (error) {
            setRoomTypes([]);
          messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
        }
    };
    
    const getPetAllows = async () => {
    try {
        const res = await GetPetAllows(); // Fetch data from the API

        if (res.status === 200) {
        setPetAllows(res.data); // Set the data from the API response
        } else {
        setPetAllows([]);
        messageApi.error(res.data.error || "ไม่สามารถดึงข้อมูลได้");
        }
    } catch (error) {
        setPetAllows([]);
        messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
    };
    
    // State สำหรับควบคุม Modal
    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenUpdate, setIsModalOpenUpdate] = useState(false);
    const [selectedRoomID, setSelectRoomID] = useState<string | null>(null);

    const showModalCreateRoom = () => {
        setIsModalOpenCreate(true);
    };

    const handleCancelCreateRoom = () => {
        formCreate.resetFields();
        formUpdate.resetFields();
        setIsSubmitting(false);
        setRoomNameInvalid(false);
        setRoomLimitInvalid(false);
        setIsModalOpenCreate(false);
    };
    
    const showModalUpdateRoom = async (id: string) => {
        let res = await GetRoomByID(id);
        if (res.status === 200) {
            const RoomID = res.data.ID;
            setRoomID(RoomID);
            setRName(res.data.RoomName);
            formUpdate.setFieldsValue({
                RoomName: res.data.RoomName,
                RoomRent: res.data.RoomRent,
                RoomLimit: res.data.RoomLimit,
                RoomTypeID: res.data.RoomTypeID,
                PetAllowID: res.data.PetAllowID,
            });
        } else {
            messageApi.open({
                type: "error",
                content: "ไม่พบข้อมูลห้องพัก",
            });
        }
        setIsModalOpenUpdate(true);
    };
    
    const handleCancelUpdateRoom = () => {
        formUpdate.resetFields();
        formCreate.resetFields();
        setIsSubmittingUpdate(false);
        setRoomNameInvalid(false);
        setIsModalOpenUpdate(false);
    };

    const onFinishUpdate = async (values: RoomInterface) => {
        setIsSubmittingUpdate(true);
        // ตรวจสอบค่า employeeID
        if (!employeeID) {
            messageApi.error("ไม่พบข้อมูลพนักงาน");
            setIsModalOpenUpdate(false);
            return;
        }
        values.EmployeeID = parseInt(employeeID, 10);
        try {
            const res = await UpdateRoom(roomID, values);
            if (res.status === 200) {
                messageApi.open({
                type: "success",
                content: res.data.message,
                });
            } else {
                messageApi.open({
                type: "error",
                content: res.data.error,
                });
            }
        }catch{
            messageApi.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูลห้องพัก");
        }finally{
            formUpdate.resetFields();
            setIsModalOpenUpdate(false);
            setIsSubmittingUpdate(false);
            getRooms();
        }
    };

    const showDeleteConfirmModal = (id: string) => {
        setSelectRoomID(id);
        setIsModalOpenDelete(true);
    };

    const handleDeleteRoom = async () => {
        if (selectedRoomID) {
          try {
            const res = await DeleteRoomByID(selectedRoomID);
            if (res.status === 200) {
              messageApi.success("ลบข้อมูลสำเร็จ");
              await getRooms(); // Refresh the list after deleting a room
            } else {
              messageApi.error(res.data.error || "ไม่สามารถลบข้อมูลได้");
            }
          } catch (error) {
            messageApi.error("เกิดข้อผิดพลาดในการลบข้อมูล");
          } finally {
            setIsModalOpenDelete(false);
            setSelectRoomID(null);
          }
        }
    };


    const onFinish = async (values: RoomInterface) => {
        setIsSubmitting(true);
        // ตรวจสอบค่า employeeID
        if (!employeeID) {
            messageApi.error("ไม่พบข้อมูลพนักงาน");
            setIsSubmitting(false);
            return;
        }
        values.EmployeeID = parseInt(employeeID, 10);
        
        try {
            const res = await CreateRoom(values);
            if (res.status === 201) {
                messageApi.open({
                    type: "success",
                    content: res.data.message,
                });
            } else {
                messageApi.open({
                    type: "error",
                    content: res.data.error,
                });
            }
        } catch (error) {
            messageApi.error("เกิดข้อผิดพลาดในการสร้างห้องพัก");
        } finally {
            formCreate.resetFields();
            setIsSubmitting(false);
            setIsModalOpenCreate(false);
            getRooms();
        }
    };

    const handleRoomNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        formCreate.setFieldsValue({ RoomName: value });
        setRoomNameInvalid(false);
    
        if (value.length >= 1) {
            await checkRoomName(value);
        }
    };

    const handleRoomNameChangeUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        formCreate.setFieldsValue({ RoomName: value });
        setRoomNameInvalid(false);
    
        if (value.length >= 1 && rname != value) {
            await checkRoomName(value);
        }
    };

    const checkRoomName = async (name: string) => {
        try {
          const res = await CheckRoomName(name);
          if (res.status === 200) {
            if (res.data.isValid) {
                setRoomNameInvalid(false); 
              return true;
            } else {
              messageApi.error("ชื่อห้องนี้มีอยู่แล้ว");
              setRoomNameInvalid(true);
              return false;
            }
          } else {
            messageApi.error(res.data.error || "ไม่สามารถตรวจชื่อห้องได้");
            return false;
          }
        } catch (error) {
          messageApi.error("เกิดข้อผิดพลาดในการตรวจชื่อห้องพัก");
          return false;
        }
    };
    
    const handleRoomLimitChange = async (value: number | null) => {
        if (value !== null) {
            // อัปเดตค่าฟอร์มใน Form.Item
            formCreate.setFieldsValue({ roomlimit: value });
    
            // ตรวจสอบว่าค่ามีเพียง 1 หลัก
            setRoomLimitInvalid(value.toString().length !== 1);
        } else {
            // กรณีที่ค่าเป็น null
            setRoomLimitInvalid(true);
        }
    };

    // const columns: ColumnsType<RoomInterface> = [
    //     {
    //         title: "ชื่อห้องพัก",
    //         dataIndex: "RoomName",
    //         key: "room_name",
    //         sorter: (a, b) => {
    //             const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    //             return collator.compare(a.RoomName || "", b.RoomName || "");
    //         },
    //         defaultSortOrder: "ascend", // เรียงจากน้อยไปมากโดยอัตโนมัติ
    //     },
    //     {
    //         title: "ค่าเช่าห้องพัก [เดือน]",
    //         dataIndex: "RoomRent",
    //         key: "room_rent",
    //     },
    //     {
    //         title: "จำนวนคนในการพักอาศัย",
    //         dataIndex: "RoomLimit",
    //         key: "room_limit",
    //     },
    //     {
    //         title: "สถานะห้องพัก",
    //         key: "RoomType",
    //         render: (record) => <>{record.RoomType?.Name || "N/A"}</>,
    //     },
    //     {
    //         title: "สถานะเลี้ยงสัตว์",
    //         key: "PetAllow",
    //         render: (record) => <>{record.PetAllow?.Name || "N/A"}</>,
    //     },
    //     {
    //         title: "แก้ไข",
    //         key: "Employee",
    //         render: (record) => <>{record.Employee?.FirstName || "ไม่เจอ"}</>,
    //     },
    //     {
    //       title: "จัดการ",
    //       render: (_record) => (
    //         <Dropdown
    //           menu={{
    //             items: [
    //               {
    //                 label: "แก้ไขข้อมูล",
    //                 key: "1",
    //                 icon: <EditOutlined />,
    //                 onClick: () => showModalUpdateRoom(_record.ID),
    //               },
    //               {
    //                 label: "ลบข้อมูล",
    //                 key: "2",
    //                 icon: <DeleteOutlined />,
    //                 onClick: () => showDeleteConfirmModal(_record.ID),
    //                 danger: true,
    //               },
    //             ],
    //           }}
    //         >
    //           <Button type="primary" icon={<DashOutlined />} size={"small"} className="btn" />
    //         </Dropdown>
    //       ),
    //     },
    
    // ];
    
const getRooms = async () => {
    try {
        const res = await GetRooms(); // Fetch data from the API

        if (res.status === 200) {
        setRooms(res.data); // Set the data from the API response
        } else {
        messageApi.error(res.data.error || "ไม่สามารถดึงข้อมูลได้");
        }
    } catch (error) {
        messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
};

useEffect(() => {
    getPetAllows();
    getRoomTypes();
    getRooms();
}, [ ]);

useEffect(() => {
    setCurrentPage(1); // รีเซ็ตหน้าแรกเมื่อ filter เปลี่ยน
}, [ searchTerm, statusFilter, petAllowFilter, minPrice, maxPrice]);

const getIconTypeRoom = (roomTypeID: number) => {
    switch (roomTypeID) {
      case 1:
        return <Card  className="card-room-green" bodyStyle={{ padding: 8 }} >
            {getRoomTypeName(roomTypeID ?? 0)}{" "}<CheckCircleOutlined />
        </Card>;
      case 2:
        return <Card  className="card-room-blue" bodyStyle={{ padding: 8 }} >  
                {getRoomTypeName(roomTypeID ?? 0)}{" "}<UserOutlined />
        </Card>;
      case 3:
        return <Card  className="card-room-yellow" bodyStyle={{ padding: 8 }} >
                {getRoomTypeName(roomTypeID ?? 0)}{" "}<ToolOutlined />
        </Card>;
      default:
        return <Card  className="card-room-show" bodyStyle={{ padding: 8 }} >
            ไม่พบสถานะห้องพัก
        </Card>;
    }
}

const getIconPetRoom = (PetAllowID: number) => {
    switch (PetAllowID) {
      case 1:
        return <Card  className="card-room-green" bodyStyle={{ padding: 8 }} >
            {"เลี้ยงสัตว์ได้ "}<SmileOutlined />
        </Card>;
      case 2:
        return <Card  className="card-room-red" bodyStyle={{ padding: 8 }} >  
            {"เลี้ยงสัตว์ไม่ได้ "}<FrownOutlined />
        </Card>;
      default:
        return <Card  className="card-room-show" bodyStyle={{ padding: 8 }} >
            ไม่พบสถานะเลี้ยงสัตว์
        </Card>;
    }
}

return (
    <div>
            {contextHolder}
            <Card style={{ marginBottom:16}} className="card-room">
                <Row gutter={[16, 0]} >
                    <Col xl={12}>
                        <Form.Item
                            label={<span style={{fontSize: "20px" , fontWeight: "bold"}}>ค้นหาห้องพัก</span>}
                            labelCol={{ span: 24 }}
                        >
                            <Input
                                placeholder="กรอกชื่อห้องพัก"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Form.Item>
                    </Col>
                    <Col xl={12} style={{display: "flex", gap: "16px",}}>
                        <Form.Item
                            label={<span style={{fontSize: "20px" , fontWeight: "bold"}}>สถานะห้องพัก</span>}
                            labelCol={{ span: 24 }}
                        >
                            <Select
                                placeholder="เลือกสถานะ"
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value)} // อัปเดต statusFilter เมื่อเลือกสถานะ
                                style={{ width: 180 }}
                                allowClear // ให้สามารถลบตัวเลือกได้ (แสดงทั้งหมด)
                            >
                                {roomtypes.map((roomtype) => (
                                    <Option key={roomtype.ID} value={roomtype.Name}>
                                        {roomtype.Name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label={<span style={{fontSize: "20px" , fontWeight: "bold"}}>การเลี้ยงสัตว์</span>}
                            labelCol={{ span: 24 }}
                        >
                            <Select
                                placeholder="เลือกสถานะ"
                                value={petAllowFilter}
                                onChange={(value) => setPetAllowFilter(value)} // อัปเดต statusFilter เมื่อเลือกสถานะ
                                style={{ width: 180 }}
                                allowClear // ให้สามารถลบตัวเลือกได้ (แสดงทั้งหมด)
                            >
                                {petallows.map((petallows) => (
                                    <Option key={petallows.ID} value={petallows.Name}>
                                        {petallows.Name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label={<span style={{fontSize: "20px" , fontWeight: "bold"}}>ราคาขั้นต่ำ</span>}
                            labelCol={{ span: 24 }}
                        >
                            <InputNumber
                                min={0}
                                max={500000}
                                value={minPrice}
                                onChange={(value) => setMinPrice(value || 0)}
                                style={{ width: 135 }}
                            />
                        </Form.Item>
                        <Form.Item
                            label={<span style={{fontSize: "20px" , fontWeight: "bold"}}>ราคาสูงสุด</span>}
                            labelCol={{ span: 24 }}
                        >
                            <InputNumber
                                min={0}
                                max={1000000}
                                value={maxPrice}
                                onChange={(value) => setMaxPrice(value || 0)}
                                style={{ width: 135}}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>
            <Card style={{ height: 600 }} className="card-room" >
                <Row align="middle" gutter={[16,0]}>
                    <Col xl={12} style={{ textAlign: "left" }} >
                        <span style={{fontSize: "24px" , fontWeight: "bold"}}>ข้อมูลห้องพัก</span>
                    </Col>
                    <Col xl={12} style={{ textAlign: "end", alignSelf: "center" }}>
                        <Space>
                            <Button 
                            type="primary" 
                            className="green-button"
                            onClick={showModalCreateRoom}
                            icon={<PlusSquareOutlined />}
                            >
                                เพิ่มห้องพัก
                            </Button>
                        </Space>
                    </Col>
                    <Divider/>
                    {/* <Table
                        rowKey="ID"
                        columns={columns}
                        dataSource={rooms} // Data from the API
                        pagination={{ pageSize: 5 }}
                        style={{ width: "100%", overflowX: "auto" }}
                    /> */}
                </Row>
                <Row gutter={[16, 16]}>
                    {paginatedRooms.length > 0 ? (
                        paginatedRooms.map((room) => (
                            <Col key={room.ID} xl={8}>
                                <Card className="card-room">
                                    <Row gutter={[10,10]} justify="center" align="middle" >
                                        <Col xl={21}>
                                            <Card className="card-room-title" bodyStyle={{ padding: 8 }}>
                                                {"ห้องพัก "}{room.RoomName}
                                            </Card>
                                        </Col>
                                        <Col xl={3}>
                                            <Dropdown
                                                menu={{
                                                    items: [
                                                        {
                                                            label: "แก้ไขข้อมูล",
                                                            key: "1",
                                                            icon: <EditOutlined />,
                                                            onClick: () => showModalUpdateRoom(room.ID?.toString() || "")
                                                        },
                                                        {
                                                            label: "ลบข้อมูล",
                                                            key: "2",
                                                            icon: <DeleteOutlined />,
                                                            onClick: () => showDeleteConfirmModal(room.ID?.toString() || ""),
                                                            danger: true,
                                                        },
                                                    ],
                                                }}
                                            >
                                                <Button type="primary" icon={<SettingOutlined />} size={"large"} className="config-btn" />
                                            </Dropdown>
                                        </Col>
                                        <Col xl={12}>
                                            <Card className="card-room-show" bodyStyle={{ padding: 8 }} >
                                                {"ค่าเช่า "}{room.RoomRent}{" ฿"}
                                            </Card>
                                        </Col>
                                        <Col xl={12}>
                                            <Card className="card-room-show" bodyStyle={{ padding: 8 }} >
                                                {"พักอาศัยได้ "}{room.RoomLimit}{" คน"}
                                            </Card>
                                        </Col>
                                        <Col xl={12}>
                                            {getIconTypeRoom(room.RoomTypeID ?? 0)}
                                        </Col>
                                        <Col xl={12}>
                                            {getIconPetRoom(room.PetAllowID ?? 0)}
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <Col span={24}>
                            <div 
                                style={{ 
                                    display: "flex", 
                                    flexDirection: "column", 
                                    justifyContent: "flex-end", 
                                    alignItems: "center", 
                                    minHeight: "40vh", // กำหนดความสูงขั้นต่ำ 
                                    padding: "20px", 
                                    color: "#999" 
                                }}
                            >
                                <InboxOutlined  style={{ fontSize: "48px", marginBottom: "16px" }} />
                                <p style={{ fontSize: "16px", color: "#999" }}>ไม่มีข้อมูลห้องพัก</p>
                            </div>
                        </Col>
                    )}
                </Row>
            </Card>

            <Col xl={24} style={{display: "flex", justifyContent: "flex-end", }}>
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredRooms.length}
                    onChange={(page) => setCurrentPage(page)}
                    style={{ marginTop: 16 }}
                />
            </Col>

            <Modal
                title="เพิ่มห้องพัก"
                open={isModalOpenCreate}
                onCancel={handleCancelCreateRoom}
                footer={null} // ลบ default footer ถ้าต้องการ
            >
                <Divider/>
                <Form
                    name="register"
                    form={formCreate}
                    onFinish={onFinish}
                    layout="vertical"
                    initialValues={{
                        RoomRent: 1000,
                        RoomLimit: 1,
                    }}
                >
                <Row gutter={[16, 0]}>
                    <Col xl={24}>
                        <Form.Item
                            name="RoomName"
                            label="ชื่อห้องพัก"
                            rules={[
                                {
                                    required: true,
                                    message: 'กรุณากรอกชื่อห้องพัก'
                                },
                                {
                                    pattern: /^[\u0E00-\u0E7Fa-zA-Z0-9]+$/,
                                    message: 'กรุณากรอกเฉพาะตัวอักษรภาษาไทย หรือ ภาษาอังกฤษ และตัวเลขเท่านั้น',
                                },
                            ]}
                        >
                            <Input
                                id="randomRoomname"
                                type="text"
                                autoComplete="new-password"
                                onKeyDown={(e) => {
                                    if (!/^[\u0E00-\u0E7Fa-zA-Z0-9]+$/.test(e.key) && e.key !== "Backspace") {
                                        e.preventDefault();
                                    }
                                }}
                                onChange={handleRoomNameChange}
                                onCopy={(e) => e.preventDefault()} // Prevent copy
                                onCut={(e) => e.preventDefault()} // Prevent cut
                                onPaste={(e) => e.preventDefault()} // Prevent paste
                            />
                        </Form.Item>
                    </Col>
                    <Col xl={12}>
                        <Form.Item
                            name="RoomRent"
                            label="ค่าเช่า [ต่อเดือน]"
                            rules={[
                                { 
                                    required: true,
                                    message: 'กรุณากรอกค่าเช่าห้องพัก' 
                                },
                                {
                                    pattern: /^[1-9][0-9]*$/,
                                    message: "กรุณากรอกค่าเช่าห้องพักที่มากกว่า 0",
                                },
                                {
                                    validator: (_, value) => {
                                        if (!value || Number(value) >= 100) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("ค่าเช่าห้องพักต้องมากกว่า 99 บาท"));
                                    },
                                },
                            ]}
                        >
                            <InputNumber
                                id="roomRentInput"
                                maxLength={6}
                                min={100} // กำหนดค่าเริ่มต้นขั้นต่ำ
                                autoComplete="off" // ปิดการกรอกอัตโนมัติ
                                onKeyPress={(event) => {
                                    const key = event.key;
                                    if (!/[0-9]/.test(key)) {
                                        event.preventDefault();
                                    }
                                    if ((event.target as HTMLInputElement).value.length === 0 && key === "0") {
                                        event.preventDefault();
                                    }
                                }}
                                onCopy={(e) => e.preventDefault()} // ป้องกันการคัดลอก
                                onCut={(e) => e.preventDefault()}  // ป้องกันการตัด
                                onPaste={(e) => e.preventDefault()} // ป้องกันการวาง
                                addonAfter="บาท"
                            />
                        </Form.Item>
                    </Col>
                    <Col xl={12}>
                        <Form.Item
                            name="RoomLimit"
                            label="จำนวนคนในการเข้าพักอาศัย"
                            rules={[
                                { required: true, message: 'กรุณากรอกจำนวนคนในการพักอาศัย' },
                                {
                                    type: "number",
                                    min: 1,
                                    max: 9,
                                    message: "กรุณากรอกจำนวนคนระหว่าง 1 ถึง 9!",
                                },
                                {
                                    pattern: /^\d{1}$/,
                                    message: "กรุณาจำนวนคนในการพักอาศัย!",
                                },
                            ]}
                        >
                            <InputNumber
                                id="randomRoomlimit" // Use a less predictable id attribute
                                min={1} // ค่าต่ำสุด
                                max={9} // ค่าสูงสุด
                                onChange={handleRoomLimitChange}
                                autoComplete="new-password" // Prevent browser autofill
                                controls={true} // เปิดใช้งานปุ่มเพิ่ม/ลด
                                style={{ width: "228px", height: "30px", fontSize: "14px" }}
                                addonAfter="คน"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                        <Form.Item
                            label="สถานะห้องพัก"
                            name="RoomTypeID"
                            rules={[
                                {
                                    required: true,
                                    message: "กรุณาเลือกสถานะห้องพัก!",
                                },
                            ]}
                            >
                            <Select
                            placeholder="กรุณาเลือกสถานะห้องพัก"
                            style={{ width: "100%" }}
                            options={roomtypes.map((roomtype) => ({
                                value: roomtype.ID,
                                label: roomtype.Name,
                            }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                        <Form.Item
                            label="การอนุญาติเลี้ยงสัตว์"
                            name="PetAllowID"
                            rules={[
                                {
                                    required: true,
                                    message: "กรุณาเลือกการอนุญาติเลี้ยงสัตว์!",
                                },
                            ]}
                        >
                            <Radio.Group 
                                style={{    
                                    width: '100%' ,          
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '16px', 
                                }}
                            >
                                    {petallows.map((pet) => (
                                        <Radio key={pet.ID} value={pet.ID}>
                                            {pet.Name}
                                        </Radio>
                                    ))}
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item >
                    <Row>
                        <Col span={24} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Button 
                                type="primary"
                                htmlType="submit"
                                className="green-button"
                                loading={isSubmitting}
                                disabled={isSubmitting || roomNameInvalid }
                                >
                                ยืนยัน
                            </Button>
                        </Col>
                    </Row>
                </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="ยืนยันการลบ"
                open={isModalOpenDelete}
                onOk={handleDeleteRoom}
                onCancel={() => setIsModalOpenDelete(false)}
                okType="danger"
                okText="ลบ"
                cancelText="ยกเลิก"
            >
                <p>คุณแน่ใจเหรอว่าต้องการลบข้อมูลห้องพัก ?</p>
            </Modal>
            <Modal
                title="แก้ไขข้อมูลห้องพัก"
                open={isModalOpenUpdate}
                onCancel={handleCancelUpdateRoom}
                footer={null} // ลบ default footer ถ้าต้องการ
            >
                <Divider/>
                <Form
                    name="register"
                    form={formUpdate}
                    onFinish={onFinishUpdate}
                    layout="vertical"
                >
                    <Row gutter={[16, 0]}>
                        <Col xl={24}>
                        <Form.Item
                            name="RoomName"
                            label="ชื่อห้องพัก"
                            rules={[
                                {
                                    required: true,
                                    message: 'กรุณากรอกชื่อห้องพัก'
                                },
                                {
                                    pattern: /^[\u0E00-\u0E7Fa-zA-Z0-9]+$/,
                                    message: 'กรุณากรอกเฉพาะตัวอักษรภาษาไทย หรือ ภาษาอังกฤษ และตัวเลขเท่านั้น',
                                },
                            ]}
                        >
                            <Input
                                id="randomRoomname"
                                type="text"
                                autoComplete="new-password"
                                onKeyDown={(e) => {
                                    if (!/^[\u0E00-\u0E7Fa-zA-Z0-9]+$/.test(e.key) && e.key !== "Backspace") {
                                        e.preventDefault();
                                    }
                                }}
                                onChange={handleRoomNameChangeUpdate}
                                onCopy={(e) => e.preventDefault()} // Prevent copy
                                onCut={(e) => e.preventDefault()} // Prevent cut
                                onPaste={(e) => e.preventDefault()} // Prevent paste
                            />
                        </Form.Item>
                        </Col>
                        <Col xl={12}>
                            <Form.Item
                                name="RoomRent"
                                label="ค่าเช่า [ต่อเดือน]"
                                rules={[
                                    { 
                                        required: true,
                                        message: 'กรุณากรอกค่าเช่าห้องพัก' 
                                    },
                                    {
                                        pattern: /^[1-9][0-9]*$/,
                                        message: "กรุณากรอกค่าเช่าห้องพักที่มากกว่า 0",
                                    },
                                    {
                                        validator: (_, value) => {
                                            if (!value || Number(value) >= 100) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error("ค่าเช่าห้องพักต้องมากกว่า 99 บาท"));
                                        },
                                    },
                                ]}
                            >
                                <InputNumber
                                    id="roomRentInput"
                                    maxLength={7}
                                    min={100} // กำหนดค่าเริ่มต้นขั้นต่ำ
                                    autoComplete="off" // ปิดการกรอกอัตโนมัติ
                                    onKeyPress={(event) => {
                                        const key = event.key;
                                        if (!/[0-9]/.test(key)) {
                                            event.preventDefault();
                                        }
                                        if ((event.target as HTMLInputElement).value.length === 0 && key === "0") {
                                            event.preventDefault();
                                        }
                                    }}
                                    onCopy={(e) => e.preventDefault()} // ป้องกันการคัดลอก
                                    onCut={(e) => e.preventDefault()}  // ป้องกันการตัด
                                    onPaste={(e) => e.preventDefault()} // ป้องกันการวาง
                                    addonAfter="บาท"
                                />
                            </Form.Item>
                        </Col>
                        <Col xl={12}>
                            <Form.Item
                                name="RoomLimit"
                                label="จำนวนคนในการเข้าพักอาศัย"
                                rules={[
                                    { required: true, message: 'กรุณากรอกจำนวนคนในการพักอาศัย' },
                                    {
                                        type: "number",
                                        min: 1,
                                        max: 9,
                                        message: "กรุณากรอกจำนวนคนระหว่าง 1 ถึง 9!",
                                    },
                                    {
                                        pattern: /^\d{1}$/,
                                        message: "กรุณาจำนวนคนในการพักอาศัย!",
                                    },
                                ]}
                            >
                                <InputNumber
                                    id="randomRoomlimit" // Use a less predictable id attribute
                                    min={1} // ค่าต่ำสุด
                                    max={9} // ค่าสูงสุด
                                    onChange={handleRoomLimitChange}
                                    autoComplete="new-password" // Prevent browser autofill
                                    controls={true} // เปิดใช้งานปุ่มเพิ่ม/ลด
                                    style={{ width: "228px", height: "30px", fontSize: "14px" }}
                                    addonAfter="คน"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={12}>
                            <Form.Item
                                label="สถานะห้องพัก"
                                name="RoomTypeID"
                                rules={[
                                    {
                                        required: true,
                                        message: "กรุณาเลือกสถานะห้องพัก!",
                                    },
                                ]}
                                >
                                <Select
                                placeholder="กรุณาเลือกสถานะห้องพัก"
                                style={{ width: "100%" }}
                                options={roomtypes.map((roomtype) => ({
                                    value: roomtype.ID,
                                    label: roomtype.Name,
                                }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={12} >
                            <Form.Item
                                label="การอนุญาติเลี้ยงสัตว์"
                                name="PetAllowID"
                                rules={[
                                    {
                                        required: true,
                                        message: "กรุณาเลือกการอนุญาติเลี้ยงสัตว์!",
                                    },
                                ]}
                            >
                                <Radio.Group 
                                    style={{    
                                        width: '100%' ,          
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '16px', 
                                    }}
                                >
                                        {petallows.map((pet) => (
                                            <Radio key={pet.ID} value={pet.ID}>
                                                {pet.Name}
                                            </Radio>
                                        ))}
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item >
                        <Row>
                            <Col span={24} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Button 
                                    type="primary"
                                    htmlType="submit"
                                    className="green-button"
                                    loading={isSubmittingUpdate}
                                    disabled={isSubmittingUpdate || roomLimitInvalid || roomNameInvalid }
                                    >
                                    ยืนยัน
                                </Button>
                            </Col>
                        </Row>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
