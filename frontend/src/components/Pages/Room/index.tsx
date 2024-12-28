import { useEffect, useState } from "react";
import { Col, Row, Card, Select, Input , Form , Modal, Space , Button , message , Divider , InputNumber , Dropdown , Table } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, DashOutlined  } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";

import { RoomInterface } from "../../../interfaces/Room";
import { RoomTypeInterface } from "../../../interfaces/RoomType";
import { PetAllowInterface } from "../../../interfaces/PetAllow";

import { GetRoomTypes , GetRooms , GetRoomByID , GetPetAllows , CreateRoom, CheckRoomName , DeleteRoomByID , UpdateRoom } from "../../../services/https";

export default function Room() {
    const [roomtypes, setRoomTypes] = useState<RoomTypeInterface[]>([]);
    const [petallows, setPetAllows] = useState<PetAllowInterface[]>([]);
    const [rooms, setRooms] = useState<RoomInterface[]>([]);
    const employeeID = localStorage.getItem("employeeID");
    const [form] = Form.useForm();
    const [roomID,setRoomID] = useState<string>("");
    const [messageApi, contextHolder] = message.useMessage();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
    const [roomLimitInvalid, setRoomLimitInvalid] = useState(true);
    const [roomNameInvalid, setRoomNameInvalid] = useState(false); 

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
    const [isModalOpenDeleate, setIsModalOpenDeleate] = useState(false);
    const [isModalOpenUpdate, setIsModalOpenUpdate] = useState(false);
    const [selectedRoomID, setSelectRoomID] = useState<string | null>(null);

    const showModalCreateRoom = () => {
        setIsModalOpenCreate(true);
    };

    const handleCancelCreateRoom = () => {
        setIsModalOpenCreate(false);
    };
    
    const showModalUpdateRoom = async (id: string) => {
        let res = await GetRoomByID(id);
        if (res.status === 200) {
            const RoomID = res.data.ID;
            setRoomID(RoomID);
            form.setFieldsValue({
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
        form.resetFields();
        setIsModalOpenUpdate(false);
    };

    const onFinishUpdate = async (values: RoomInterface) => {
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
            form.resetFields();
            setIsModalOpenUpdate(false);
            getRooms();
        }
    };

    const showDeleteConfirmModal = (id: string) => {
        setSelectRoomID(id);
        setIsModalOpenDeleate(true);
    };

    const handleDeleteMember = async () => {
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
            setIsModalOpenDeleate(false);
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
            form.resetFields();
            setIsSubmitting(false);
            setIsModalOpenCreate(false);
            getRooms();
        }
    };

    const handleRoomNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        form.setFieldsValue({ RoomName: value });
        setRoomNameInvalid(false);
    
        if (value.length >= 1) {
            await checkRoomName(value);
        }
    };

    const checkRoomName = async (phoneNumber: string) => {
        try {
          const res = await CheckRoomName(phoneNumber);
          if (res.status === 200) {
            if (res.data.isValid) {
                setRoomNameInvalid(false); 
              return true;
            } else {
              messageApi.error("ชื่อห้องนีี้มีอยู่แล้ว");
              setRoomNameInvalid(true);
              return false;
            }
          } else {
            messageApi.error(res.data.error || "ไม่สามารถตรวจชื่อห้องได้ได้");
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
            form.setFieldsValue({ roomlimit: value });
    
            // ตรวจสอบว่าค่ามีเพียง 1 หลัก
            setRoomLimitInvalid(value.toString().length !== 1);
        } else {
            // กรณีที่ค่าเป็น null
            setRoomLimitInvalid(true);
        }
    };

    const columns: ColumnsType<RoomInterface> = [
        {
            title: "ลำดับ",
            dataIndex: "ID",
            key: "id",
        },
        {
            title: "ชื่อห้องพัก",
            dataIndex: "RoomName",
            key: "room_name",
        },
        {
            title: "ค่าเช่าห้องพัก [เดือน]",
            dataIndex: "RoomRent",
            key: "room_rent",
        },
        {
            title: "จำนวนคนในการพักอาศัย",
            dataIndex: "RoomLimit",
            key: "room_limit",
        },
        {
            title: "สถานะห้องพัก",
            key: "RoomType",
            render: (record) => <>{record.RoomType?.Name || "N/A"}</>,
        },
        {
            title: "อนุญาตเลี้ยงสัตว์",
            key: "PetAllow",
            render: (record) => <>{record.PetAllow?.Name || "N/A"}</>,
        },
        {
            title: "สมัครโดย",
            key: "Employee",
            render: (record) => <>{record.Employee?.FirstName || "ไม่เจอ"}</>,
        },
        {
          title: "จัดการ",
          render: (_record) => (
            <Dropdown
              menu={{
                items: [
                  {
                    label: "แก้ไขข้อมูล",
                    key: "1",
                    icon: <EditOutlined />,
                    onClick: () => showModalUpdateRoom(_record.ID),
                  },
                  {
                    label: "ลบข้อมูล",
                    key: "2",
                    icon: <DeleteOutlined />,
                    onClick: () => showDeleteConfirmModal(_record.ID),
                    danger: true,
                  },
                ],
              }}
            >
              <Button type="primary" icon={<DashOutlined />} size={"small"} className="btn" />
            </Dropdown>
          ),
        },
    
    ];
    
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

    return (
        <div>
            {contextHolder}
            <Row>
                <Col span={12}>
                    <h1>ข้อมูลห้องพัก</h1>
                </Col>
                <Col span={12} style={{ textAlign: "end", alignSelf: "center" }}>
                    <Space>
                        <Button 
                        type="primary" 
                        style={{ backgroundColor: "rgb(218, 165, 32)" }}
                        onClick={showModalCreateRoom}
                        >
                            ลงทะเบียน
                        </Button>
                    </Space>

                </Col>
                <Divider/>
                    <Table
                        rowKey="ID"
                        columns={columns}
                        dataSource={rooms} // Data from the API
                        pagination={{ pageSize: 5 }}
                        style={{ width: "100%", overflowX: "auto" }}
                    />
            </Row>

            <Modal
                title="เพิ่มห้องพัก"
                open={isModalOpenCreate}
                onCancel={handleCancelCreateRoom}
                footer={null} // ลบ default footer ถ้าต้องการ
            >
                <Divider/>
                <Form
                    name="register"
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                >
                <Row gutter={[16, 0]}>
                    <Col xl={24}>
                        <Form.Item
                            name="RoomName"
                            label="ชื่อห้องพัก"
                            rules={[{ required: true, message: 'กรุณากรอกชื่อห้องพัก' }]}
                            >
                            <Input
                                id="randomRoomname" // Use a less predictable id attribute
                                type="text" // Tel type, which may help prevent cookie-based autofill
                                autoComplete="new-password" // Prevent browser autofill
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
                            <Select
                            placeholder="กรุณาเลือกการอนุญาติเลี้ยงสัตว์"
                            style={{ width: "100%" }}
                            options={petallows.map((pet) => ({
                                value: pet.ID,
                                label: pet.Name,
                            }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item >
                    <Row>
                        <Col span={24} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Button 
                                type="primary"
                                htmlType="submit"
                                loading={isSubmitting}
                                disabled={isSubmitting || roomLimitInvalid || roomNameInvalid }
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
                open={isModalOpenDeleate}
                onOk={handleDeleteMember}
                onCancel={() => setIsModalOpenDeleate(false)}
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
                <Form
                    name="register"
                    form={form}
                    onFinish={onFinishUpdate}
                    layout="vertical"
                >
                    <Row gutter={[16, 0]}>
                        <Col xl={24}>
                            <Form.Item
                                name="RoomName"
                                label="ชื่อห้องพัก"
                                rules={[{ required: true, message: 'กรุณากรอกชื่อห้องพัก' }]}
                                >
                                <Input
                                    id="randomRoomname" // Use a less predictable id attribute
                                    type="text" // Tel type, which may help prevent cookie-based autofill
                                    autoComplete="new-password" // Prevent browser autofill
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
                                <Select
                                placeholder="กรุณาเลือกการอนุญาติเลี้ยงสัตว์"
                                style={{ width: "100%" }}
                                options={petallows.map((pet) => ({
                                    value: pet.ID,
                                    label: pet.Name,
                                }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item >
                        <Row>
                            <Col span={24} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Button 
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmittingUpdate}
                                    disabled={isSubmittingUpdate}
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
