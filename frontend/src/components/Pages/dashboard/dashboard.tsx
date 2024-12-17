import { useEffect, useState } from "react";
import { Col, Row, Card, Statistic, Input , Form , Modal, Space , Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
export default function Dashboard() {
    
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
const onFinish = (values: any) => {
    console.log('Success:', values);
    // ทำการบันทึกหรือส่งข้อมูล
    setIsModalOpen(false);
};

    return (
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
                    title="ลงทะเบียน"
                    open={isModalOpen}
                    onCancel={handleCancel}
                    footer={null} // ลบ default footer ถ้าต้องการ
                >
                    <Form
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    >
                    <Form.Item
                        name="username"
                        label="ชื่อผู้ใช้"
                        rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="อีเมล"
                        rules={[
                        { required: true, message: 'กรุณากรอกอีเมล' },
                        { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item >
                        <Row>
                        <Col span={12}>
                            <Button type="primary" htmlType="submit">
                                ยืนยัน
                            </Button>
                        </Col>
                        <Col span={12} style={{ textAlign: "end", alignSelf: "center" }}>
                            <Button onClick={handleCancel} style={{ marginLeft: 8 , textAlign: "end"}}>
                                ยกเลิก
                            </Button>
                        </Col>
                        </Row>
                    </Form.Item>
                    </Form>
                </Modal>
            </Col>
        </Row>
    );
}
