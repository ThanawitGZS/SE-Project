import { useEffect, useState } from "react";
import { Col, Row, Card, Select, Input , Form , Modal, Space , Button , message} from "antd";
import { Link, useNavigate } from "react-router-dom";

import { RoomInterface } from "../../../interfaces/Room";
import { RoomTypeInterface } from "../../../interfaces/RoomType";
import { PetAllowInterface } from "../../../interfaces/PetAllow";

import { GetRoomTypes , GetRooms , GetPetAllows } from "../../../services/https";

export default function Room() {
    const [roomtypes, setRoomTypes] = useState<RoomTypeInterface[]>([]);
    const [petallows, setPetAllows] = useState<PetAllowInterface[]>([]);
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roomLimitInvalid, setRoomLimitInvalid] = useState(true);
    const [roomRentInvalid, setRoomRentInvalid] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();

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
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ฟังก์ชันเปิด Modal
    const showModal = () => {
        setIsModalOpen(true);
    };

    // ฟังก์ชันปิด Modal
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    // ฟังก์ชันเมื่อกรอกข้อมูลเสร็จ
    const onFinish = () => {
        setIsSubmitting(true);
        messageApi.open({
            type: "success",
            content: "สร้างห้องพักสำเร็จ",
        });
        form.resetFields();
        setIsSubmitting(false);
        setIsModalOpen(false);
    };

    const handleRoomLimitChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        form.setFieldsValue({ roomlimit: value });
        setRoomLimitInvalid(value.length !== 1);
    };

    const handleRoomRentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        form.setFieldsValue({ roomrent: value });
        setRoomRentInvalid(value.length < 3);
    };

useEffect(() => {
    getPetAllows();
    getRoomTypes();
  }, []);

    return (
        <div>
            {contextHolder}
            <Row>
                <Col span={12}>
                    <h2>ข้อมูลห้องพัก</h2>
                </Col>
                <Col span={12} style={{ textAlign: "end", alignSelf: "center" }}>
                    <Space>
                        <Button 
                        type="primary" 
                        style={{ backgroundColor: "rgb(218, 165, 32)" }}
                        onClick={showModal}
                        >
                        ลงทะเบียน
                        </Button>
                    </Space>

                    <Modal
                        title="เพิ่มห้องพัก"
                        open={isModalOpen}
                        onCancel={handleCancel}
                        footer={null} // ลบ default footer ถ้าต้องการ
                    >
                        <Form
                        name="register"
                        form={form}
                        onFinish={onFinish}
                        layout="vertical"
                        >
                        <Row gutter={[16, 0]}>
                            <Col xl={24}>
                                <Form.Item
                                    name="roomname"
                                    label="ชื่อห้องพัก"
                                    rules={[{ required: true, message: 'กรุณากรอกชื่อห้องพัก' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xl={12}>
                                <Form.Item
                                    name="roomrent"
                                    label="ค่าเช่า [ต่อเดือน]"
                                    rules={[
                                    { 
                                        required: true,
                                        message: 'กรุณากรอกค่าเช่าห้องพัก' 
                                    },
                                    {
                                        pattern: /^[^0]/,
                                        message: "กรุณากรอกค่าเช่าห้องพัก!",
                                    },
                                    ]}
                                >
                                    <Input 
                                        id="randomRoomRent" // Use a less predictable id attribute
                                        type="roomlimit"
                                        maxLength={7}
                                        autoComplete="new-password" // Prevent browser autofill
                                        onChange={handleRoomRentChange}
                                        onKeyPress={(event) => {
                                            const inputValue = (event.target as HTMLInputElement).value;
                                            if (!/[0-9]/.test(event.key)) {
                                                event.preventDefault();
                                            }
                                            if (inputValue.length === 0 && event.key === "0") {
                                                event.preventDefault();
                                            }
                                        }}
                                        onCopy={(e) => e.preventDefault()} // Prevent copy
                                        onCut={(e) => e.preventDefault()} // Prevent cut
                                        onPaste={(e) => e.preventDefault()} // Prevent paste 
                                    />
                                </Form.Item>
                            </Col>
                            <Col xl={12}>
                                <Form.Item
                                    name="roomlimit"
                                    label="จำนวนคนในการเข้าพักอาศัย"
                                    rules={[
                                    { required: true, message: 'กรุุณากรอกจำนวนคนในการพักอาศัย' },
                                    {
                                        pattern: /^\d{1}$/,
                                        message: "กรุณาจำนวนคนในการพักอาศัย!",
                                    },
                                    ]}
                                >
                                    <Input
                                        id="randomRoomlimit" // Use a less predictable id attribute
                                        type="roomlimit"
                                        autoComplete="new-password" // Prevent browser autofill
                                        maxLength={1}
                                        onChange={handleRoomLimitChange}
                                        onKeyPress={(event) => {
                                        if (!/[1-9]/.test(event.key)) {
                                            event.preventDefault();
                                        }
                                        }}
                                        onCopy={(e) => e.preventDefault()} // Prevent copy
                                        onCut={(e) => e.preventDefault()} // Prevent cut
                                        onPaste={(e) => e.preventDefault()} // Prevent paste 
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
                                        disabled={isSubmitting || roomLimitInvalid || roomRentInvalid }
                                    >
                                        ยืนยัน
                                    </Button>
                                </Col>
                                {/* <Col span={12} style={{ textAlign: "end", alignSelf: "center" }}>
                                    <Button onClick={handleCancel} style={{ marginLeft: 8 , textAlign: "end"}}>
                                        ยกเลิก
                                    </Button>
                                </Col> */}
                            </Row>
                        </Form.Item>
                        </Form>
                    </Modal>
                </Col>
            </Row>
        </div>
    );
}
