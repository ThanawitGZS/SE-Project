import { useEffect, useState } from "react";
import { Col, Row, Card, Select, Input , Form , Modal, Space , Button , message , Divider , InputNumber , Dropdown , Table , Pagination , TimePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusSquareOutlined , EditOutlined , DeleteOutlined , DashOutlined , SettingOutlined , CheckCircleOutlined , ToolOutlined , CloseCircleOutlined , HeartOutlined , FundProjectionScreenOutlined , InboxOutlined} from "@ant-design/icons";

import { CreateBooking , DeleteBookingByID , GetBookings , GetFacilityOpen , GetFacilityType } from "../../../../services/https";

import { FacilityInterface } from "../../../../interfaces/Facility";
import { FacilityTypeInterface } from "../../../../interfaces/FacilityType";

export default function FacilityBooking() {

    const [messageApi, contextHolder] = message.useMessage();

    const [facilityOpen, setFacilityOpen] = useState<FacilityInterface[]>([])
    const [facilitytypes, setFacilityTypes] = useState<FacilityTypeInterface[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState<string | null>("ฟิตเนส");
    const { Option } = Select; // นำเข้า Option จาก Select โดยตรง
    const pageSize = 4;

    const filteredFacilitys = facilityOpen.filter((facility) => {
        
            const facilityTypes = facilitytypes.find((type) => type.ID === facility.FacilityTypeID)?.Name || "ไม่ทราบ";        
    
            // กรองตามสถานะ
            const matchesType = typeFilter ? facilityTypes === typeFilter : true;
        
            return  matchesType ;
        });
    
        // เรียงข้อมูลก่อน Render
        const sortedFacilitys = filteredFacilitys.sort((a, b) => {
            const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
            return collator.compare(a.FacilityName || "", b.FacilityName || "");
        });
    
        const paginatedFacilitys = sortedFacilitys.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        );
    
        useEffect(() => {
            setCurrentPage(1); // รีเซ็ตหน้าแรกเมื่อ filter เปลี่ยน
        }, [ typeFilter]);

    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);

    const fetchData = async () => {
        try {
          const [facilityRes, typeRes] = await Promise.all([GetFacilityOpen(), GetFacilityType()]);
      
          if (facilityRes.status === 200) {
            setFacilityOpen(facilityRes.data);
          } else {
            setFacilityOpen([]);
            messageApi.error(facilityRes.data.error || "ไม่สามารถดึงข้อมูลพื้นที่ส่วนกลางได้");
          }
      
          if (typeRes.status === 200) {
            setFacilityTypes(typeRes.data);
          } else {
            setFacilityTypes([]);
            messageApi.error(typeRes.data.error || "ไม่สามารถดึงข้อมูลประเภทพื้นที่ได้");
          }
        } catch (error) {
          setFacilityOpen([]);
          setFacilityTypes([]);
          messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
        }
      };

    useEffect(() => {
        fetchData();
    }, [ ]);

    return (
        <div>
            {contextHolder}
            <Card>
                <Row gutter={[16,0]}>
                    <Col xl={12}>
                        <Form.Item
                            label={<span style={{fontSize: "20px" , fontWeight: "bold"}}>ประเภทพื้นที่</span>}
                            labelCol={{ span: 24 }}
                        >
                            <Select
                                placeholder="เลือกประเภท"
                                value={typeFilter}
                                onChange={(value) => setTypeFilter(value)} // อัปเดต statusFilter เมื่อเลือกสถานะ
                                // style={{ width: 180 }}
                                allowClear // ให้สามารถลบตัวเลือกได้ (แสดงทั้งหมด)
                            >
                                {facilitytypes.map((type) => (
                                    <Option key={type.ID} value={type.Name}>
                                        {type.Name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        {paginatedFacilitys.length > 0 ? (
                        paginatedFacilitys.map((facility) => (
                            <Col key={facility.ID} xl={24}>
                                <Card className="card-room">
                                    <Row gutter={[10,10]} justify="center" align="middle" >
                                        <Col xl={24}>
                                            <Card className="card-room-title" bodyStyle={{ padding: 8 }}>
                                                {"พื้นที่ส่วนกลาง "}{facility.FacilityName}
                                            </Card>
                                        </Col>
                                        <Col xl={12}>
                                            <Card className="card-room-show" bodyStyle={{ padding: 8 }} >
                                                {"เวลาเปิด "}{facility.TimeOpen}{" โมง"}
                                            </Card>
                                        </Col>
                                        <Col xl={12}>
                                            <Card className="card-room-show" bodyStyle={{ padding: 8 }} >
                                                {"เวลาปิด "}{facility.TimeClose}{" โมง"}
                                            </Card>
                                        </Col>
                                        <Col xl={12}>
                                            <Card className="card-room-show" bodyStyle={{ padding: 8 }} >
                                                {"เข้าใช้งานได้สูงสุด "}{facility.Capacity}{" คน"}
                                            </Card>
                                        </Col>
                                        {/* <Col xl={12}>
                                            {getInfoType(facility.FacilityStatusID ?? 0,facility.Capacity ?? 0)}
                                        </Col>
                                        <Col xl={12}>
                                            {getIconStatus(facility.FacilityStatusID ?? 0)}
                                        </Col>
                                        <Col xl={12}>
                                            {getIconType(facility.FacilityTypeID ?? 0)}
                                        </Col> */}
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
                                <p style={{ fontSize: "16px", color: "#999" }}>ไม่มีข้อมูลพื้นที่ส่วนกลาง</p>
                            </div>
                        </Col>
                    )}
                    </Col>
                    <Col xl={12}>
                        <span style={{fontSize: "24px" , fontWeight: "bold"}}>รายการจองเข้าใช้งาน</span>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}