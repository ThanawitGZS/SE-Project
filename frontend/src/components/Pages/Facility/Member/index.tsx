import { useEffect, useState } from "react";
import { Col, Row, Card, Select , Form , Modal, Space , Button , message , Divider , Table , Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined , FormOutlined , QuestionCircleOutlined , InboxOutlined} from "@ant-design/icons";

import { CreateBooking , DeleteBookingByID , GetBookingFacilityByID , GetBookingMemberByID , GetFacilityOpen , GetFacilityType , GetMemberByID , CheckBooking , UpdateFacility , GetBookingByID , DeleteBookingByFacilityID , GetMemberBookingByID} from "../../../../services/https";

import { MemberInterface } from "../../../../interfaces/Member";
import { BookingInterface } from "../../../../interfaces/Booking";
import { FacilityInterface } from "../../../../interfaces/Facility";
import { FacilityTypeInterface } from "../../../../interfaces/FacilityType";

const daysThai = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const monthsThai = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export default function FacilityBooking() {

    const [messageApi, contextHolder] = message.useMessage();
    const memberID = localStorage.getItem("memberID");
    const [facilityID , setFacilityID] = useState("");
    const [text , setText] = useState("");

    const [facilityOpen, setFacilityOpen] = useState<FacilityInterface[]>([]);
    const [facilitytypes, setFacilityTypes] = useState<FacilityTypeInterface[]>([]);
    const [bookingMember, setBookingMember] = useState<BookingInterface[]>([]);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const [facility, setFacility] = useState<MemberInterface[]>([]);

    const today = new Date();
    const day = daysThai[today.getDay()];
    const date = today.getDate();
    const month = monthsThai[today.getMonth()];
    const year = today.getFullYear() + 543; // แปลงเป็น พ.ศ.

    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageB, setCurrentPageB] = useState(1);
    const [typeFilter, setTypeFilter] = useState<string | null>("ฟิตเนส");
    const { Option } = Select; // นำเข้า Option จาก Select โดยตรง
    const pageSize = 2;
    const pageSizeB = 4;

    const facilityIDsToDelete: number[] = facilityOpen
    .filter((facility) => {
        const now = new Date();
        const [closingHours, closingMinutes] = (facility.TimeClose || "00:00").split(":").map(Number);
        const closingDate = new Date(now);
        closingDate.setHours(closingHours, closingMinutes, 0, 0);

        return now > closingDate; // เช็คว่าเวลาปัจจุบันเกินเวลาปิด
    })
    .map((facility) => facility.ID) // ดึงเฉพาะ facility.ID
    .filter((id): id is number => id !== undefined);

    async function deleteAndUpdateFacilitiesSequentially() {
        console.log("Starting delete and update process...");
    
        while (facilityIDsToDelete.length > 0) {
            const currentID = facilityIDsToDelete[0]; // ดึง ID แรกใน array
            console.log(`Attempting to delete and update facility with Booking ID: ${currentID}`);
    
            try {
                // ลบ Booking ด้วย DeleteBookingByFacilityID
                await DeleteBookingByFacilityID(currentID.toString());
                console.log(`Successfully deleted Booking ID: ${currentID}`);
    
                // อัปเดตจำนวนคนใช้งานของ Facility โดยใช้ currentID โดยตรง
                await updateFacilityUsage(currentID.toString());
                console.log(`Successfully updated Facility usage for Facility ID: ${currentID}`);
    
                // ลบ ID ออกจาก facilityIDsToDelete หลังจากลบและอัปเดตสำเร็จ
                facilityIDsToDelete.shift();
            } catch (error) {
                console.error(`Failed to process Booking ID: ${currentID}`, error);
                break; // หยุดการทำงานหากมีข้อผิดพลาด
            }
        }
    
        console.log("Delete and update process complete!");
    }
    
    useEffect(()=>{
        facilityIDsToDelete
        deleteAndUpdateFacilitiesSequentially();
        const interval = setInterval(() => {
            facilityIDsToDelete
            deleteAndUpdateFacilitiesSequentially();
        }, 15 * 60 * 1000); // 15 นาที
        return () => clearInterval(interval);
    })

    const filteredFacilitys = facilityOpen.filter((facility) => {
        const facilityTypes = facilitytypes.find((type) => type.ID === facility.FacilityTypeID)?.Name || "ไม่ทราบ";        

        // กรองตามสถานะ
        const matchesType = typeFilter ? facilityTypes === typeFilter : true;

        // กรองตามเวลา (เฉพาะที่ยังไม่เกินเวลาปิด)
        const now = new Date();
        const [closingHours, closingMinutes] = (facility.TimeClose || "00:00").split(":").map(Number);
        const closingDate = new Date(now);
        closingDate.setHours(closingHours, closingMinutes, 0, 0);

        const isOpen = now < closingDate;
    
        return  matchesType && isOpen;
    });
    
    // เรียงข้อมูลก่อน Render
    const sortedFacilitys = filteredFacilitys.sort((a, b) => {
        const [aHours, aMinutes] = (a.TimeOpen || "00:00").split(":").map(Number);
        const [bHours, bMinutes] = (b.TimeOpen || "00:00").split(":").map(Number);
    
        const aTime = aHours * 60 + aMinutes; // คำนวณเวลาเป็นนาที
        const bTime = bHours * 60 + bMinutes;
    
        return aTime - bTime; // เรียงจากน้อยไปมาก
    });
    
    const paginatedFacilitys = sortedFacilitys.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const paginatedBook = bookingMember.slice(
        (currentPageB - 1) * pageSizeB,
        currentPageB * pageSizeB
    );

    useEffect(() => {
        setCurrentPage(1); // รีเซ็ตหน้าแรกเมื่อ filter เปลี่ยน
        setCurrentPageB(1);
    }, [ typeFilter ]);

    
    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenView, setIsModalOpenView] = useState(false);
    const [selectedBookingID, setSelectBookingID] = useState<string | null>(null);
    const [copyID, setCopyID] = useState<string | null>(null);

    const showModalViewBooking = (id: string) => {
        getMemberBooking(id);
        setIsModalOpenView(true);
    };

    const getMemberBooking = async (id: string) => {
        const res = await GetMemberBookingByID(id);
        try{
            if( res.status === 200) {
                setFacility(res.data);
            } else {
                setFacility([]);
                messageApi.error(res.data.error || "ไม่สามารถดึงข้อที่จองไว้แล้วได้");
            }
        }catch (error) {
            setFacility([]);
            messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
        }
    }

    const showModalCreateBooking = (id: string,text: string) => {
        setFacilityID(id);
        setText(text);
        setIsModalOpenCreate(true);
    };

    const handleCancelCreateBooking = () => {
        setIsModalOpenCreate(false);
    };

    const updateAfterDelete = async (BookingID: string) => {
        try{
            const res = await GetBookingByID(BookingID)
            if (res.status === 200){
                const id = res.data[0].FacilityID;
                await updateFacilityUsage(id)
            } else {
                messageApi.error(res.data.error || "ดึงข้อมูลไม่ได้");
            }
        }catch ( error ){
            messageApi.error("เกิดข้อผิดพลาดในการลบข้อมูล updateAfterDelete");
        }finally{
            await getFacilityOpen();
        }
    }

    const updateFacilityUsage = async (facilityID: string) => {
        try {
            const usingResponse = await GetBookingFacilityByID(facilityID); // ดึงจำนวนการใช้งาน
            const using = parseInt(usingResponse.data, 10);
    
            if (isNaN(using)) {
                throw new Error("Invalid usage value");
            }
    
            const updatedValues: FacilityInterface = {
                Using: using,
            };
    
            await UpdateFacility(facilityID, updatedValues); // อัปเดตจำนวนการใช้งาน
        } catch (error) {
            console.error("Error updating facility usage:", error);
            messageApi.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล Facility");
        }
    };

    const onFinishCreate = async (values: BookingInterface) => {
        try {
            if (!memberID || !facilityID) {
                messageApi.error("ไม่พบข้อมูลพนักงานหรือห้องพัก");
                return;
            }
    
            const data = {
                MemberID: parseInt(memberID, 10),
                FacilityID: parseInt(facilityID, 10),
            };
    
            // ตรวจสอบสิทธิ์การจอง
            const res = await CheckBooking(data);
            if (res.status !== 200) {
                messageApi.error(res.data.error || "ไม่สามารถตรวจสอบข้อมูลได้");
                return;
            }
    
            if (!res.data.canBook) {
                messageApi.error("มีการจองเข้าใช้งานอยู่แล้ว");
                return;
            }
    
            // หากสามารถจองได้ ให้สร้างการจอง
            const createRes = await CreateBooking(values);
            if (createRes.status === 201) {
                messageApi.open({
                    type: "success",
                    content: createRes.data.message,
                });
    
                // อัปเดตจำนวนการใช้งาน
                await updateFacilityUsage(facilityID);
            } else {
                messageApi.open({
                    type: "error",
                    content: createRes.data.error,
                });
            }
        } catch (error) {
            messageApi.error("เกิดข้อผิดพลาดในการดำเนินการ");
        } finally {
            setIsModalOpenCreate(false);
            if (memberID) {
                getBookingMember(memberID); // โหลดข้อมูลสมาชิกใหม่
            }
            await getFacilityOpen();
        }
    };

    const showModalDeleteBooking = (id: string) => {
        setSelectBookingID(id)
        setCopyID(id);
        setIsModalOpenDelete(true);
    };

    const handleDeleteBooking = async () => {
        if (selectedBookingID) {
          try {
            const res = await DeleteBookingByID(selectedBookingID);
            if (res.status === 200) {
                messageApi.success("ยกเลิกการจองสำเร็จ");
                await updateAfterDelete(copyID ?? "0")
            } else {
              messageApi.error(res.data.error || "ไม่สามารถลบข้อมูลได้");
            }
          } catch (error) {
            messageApi.error("เกิดข้อผิดพลาดในการลบข้อมูล");
          } finally {
            setIsModalOpenDelete(false);
            setSelectBookingID(null);
            getBookingMember(memberID ?? "0");
            setCurrentPageB(1);
          }
        }
    };

    const getBookingMember = async (id: string) => {
        const res = await GetBookingMemberByID(id);
        try{
            if( res.status === 200) {
                setBookingMember(res.data);
            } else {
                setBookingMember([]);
                messageApi.error(res.data.error || "ไม่สามารถดึงข้อที่จองไว้แล้วได้");
            }
        }catch (error) {
            setBookingMember([]);
            messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
        }
    }

    const getFacilityOpen = async () => {
        const res = await GetFacilityOpen();
        try{
            if( res.status === 200) {
                setFacilityOpen(res.data);
            } else {
                setFacilityOpen([]);
                messageApi.error(res.data.error || "ไม่สามารถดึงข้อที่จองไว้แล้วได้");
            }
        }catch (error) {
            setFacilityOpen([]);
            messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
        }
    }

    const fetchData = async () => {
        try {
          const [facilityRes, typeRes, memberRes] = await Promise.all([GetFacilityOpen(), GetFacilityType(), GetMemberByID(String(memberID))]);
      
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

          if (memberRes.status === 200) {
            setFirstName(memberRes.data.FirstName)
            setLastName(memberRes.data.LastName)
          }else {
            messageApi.error(memberRes.data.error || "ไม่สามารถดึงข้อมูลสมาชิกได้")
          }

        } catch (error) {
          setFacilityOpen([]);
          setFacilityTypes([]);
          setFirstName("");
          setLastName("");
          messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
        }
      };

    useEffect(() => {
        fetchData();
        getBookingMember(memberID ?? "0");
    }, [ ]);

    const columns: ColumnsType<MemberInterface> = [
            {
                title: "คนที่ลงชื่อเข้าใช้งาน",
                key: "member",
                render: (record) => <>{"คุณ "}{record.Member?.FirstName || "N/A"}{" "}{record.Member?.LastName || "N/A"}</>,
                align: "center", // จัดข้อมูลให้อยู่ตรงกลาง
            },
        ];

    return (
        <div>
            {contextHolder}
            <Card style={{ height: 635 }} className="card-room">
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
                            >
                                {facilitytypes.map((type) => (
                                    <Option key={type.ID} value={type.Name}>
                                        {type.Name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <div style={{ height: "445px"}}>
                            <Row gutter={[0,8]}> 
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
                                                        {"เวลา "}{facility.TimeOpen}{" - "}{facility.TimeClose}{" โมง"}
                                                    </Card>
                                                </Col>
                                                <Col xl={12} style={{
                                                    display: "flex",           // ใช้ Flexbox
                                                    justifyContent: "center", // จัดข้อมูลให้อยู่ชิดขวาในแนวนอน
                                                    alignItems: "center",      // (ตัวเลือก) จัดให้อยู่ตรงกลางในแนวตั้ง
                                                }}>
                                                        <Button 
                                                            type="primary" 
                                                            className="green-confirm-button"
                                                            onClick={() => showModalCreateBooking(facility.ID?.toString() || "",facility.Descript ?? "")} // ห่อด้วย arrow function
                                                            icon={<FormOutlined />}
                                                            disabled={facility.Using === facility.Capacity}
                                                            style={{ width: "290px" , height: "45px"}}
                                                            >
                                                                จอง
                                                        </Button>
                                                </Col>
                                                <Col xl={12}>
                                                    <Card className="card-room-show" bodyStyle={{ padding: 8 }} >
                                                        {"ขณะนี้มีการจองอยู่ "}{facility.Using}{"/"}{facility.Capacity}{" คน"}
                                                    </Card>
                                                </Col>
                                                <Col xl={12} style={{
                                                    display: "flex",           // ใช้ Flexbox
                                                    justifyContent: "center", // จัดข้อมูลให้อยู่ชิดขวาในแนวนอน
                                                    alignItems: "center",      // (ตัวเลือก) จัดให้อยู่ตรงกลางในแนวตั้ง
                                                }}>
                                                    <Button 
                                                        type="primary" 
                                                        className="blue-confirm-button"
                                                        onClick={() => showModalViewBooking(facility.ID?.toString() || "")} // ห่อด้วย arrow function
                                                        icon={<QuestionCircleOutlined />}
                                                        style={{ width: "290px" , height: "45px"}}
                                                        >
                                                            มีใครบ้าง
                                                    </Button>
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
                                        <p style={{ fontSize: "16px", color: "#999" }}>ไม่มีพื้นที่ส่วนกลางว่างให้บริการ</p>
                                    </div>
                                </Col>
                                )}
                            </Row>
                        </div>
                        <Col xl={24} style={{display: "flex", justifyContent: "flex-end", }}>
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={filteredFacilitys.length}
                                onChange={(page) => setCurrentPage(page)}
                                style={{ marginTop: 16 }}
                            />
                        </Col>
                    </Col>
                    <Col xl={12}>
                        <span style={{fontSize: "24px" , fontWeight: "bold"}}>รายการจองพื้นที่ส่วนกลาง</span>
                        <div style={{ color: 'black', fontSize: '18px', fontWeight: 'bold' }}>
                            {"คุณ "}{firstName}{" "}{lastName}
                        </div>
                        <div style={{ color: '#0c8aff', fontSize: '18px', fontWeight: 'bold' }}>
                            {"วัน "}{day}{" "}{date} {month} {year}
                        </div>
                        <Divider/>
                        <div style={{ height: "398px"}}>
                            <Row gutter={[0,8]}>
                                {paginatedBook.length > 0 ? (
                                    paginatedBook.map((bookingMember) => (
                                        <Col key={bookingMember.ID} xl={24}>
                                            <Card className="card-room-book">
                                                {"จองเข้าใช้ "}{bookingMember.Facility?.FacilityName || "ไม่มีข้อมูล"}{" ในเวลา "}{bookingMember.Facility?.TimeOpen || "xx:xx"}{" - "}{bookingMember.Facility?.TimeClose || "xx:xx"}
                                                <Button
                                                    type="primary" 
                                                    className="red-confirm-button"
                                                    onClick={() => showModalDeleteBooking(bookingMember.ID?.toString() || "")}
                                                    icon={<DeleteOutlined />}
                                                    style={{ width: "50px" , height: "10px", marginLeft:"220px"}}
                                                    >
                                                </Button>
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
                                                minHeight: "30vh", // กำหนดความสูงขั้นต่ำ 
                                                padding: "20px", 
                                                color: "#999" 
                                            }}
                                        >
                                            <InboxOutlined  style={{ fontSize: "48px", marginBottom: "16px" }} />
                                            <p style={{ fontSize: "16px", color: "#999" }}>ไม่มีข้อมูลการจองใช้งาน</p>
                                        </div>
                                    </Col>
                                )} 
                            </Row>
                        </div>
                        <Col xl={24} style={{display: "flex", justifyContent: "flex-end", }}>
                            <Pagination
                                current={currentPageB}
                                pageSize={pageSizeB}
                                total={bookingMember.length}
                                onChange={(page) => setCurrentPageB(page)}
                                style={{ marginTop: 16 }}
                            />
                        </Col>
                    </Col>
                </Row>
            </Card>
            <Modal
                title="จองใช้งานพื้นที่"
                open={isModalOpenCreate}
                onOk={() => {
                    const values: BookingInterface = {
                        MemberID: parseInt(memberID ?? "0", 10), // ใช้ "0" เป็นค่าเริ่มต้นถ้า memberID เป็น null
                        FacilityID: parseInt(facilityID ?? "0", 10),
                    };
                    onFinishCreate(values); // เรียกฟังก์ชัน onFinishCreate
                    handleCancelCreateBooking(); // ปิด Modal
                }}
                onCancel={() => setIsModalOpenCreate(false)}
                okText="ยืนยัน"
                cancelText="ยกเลิก"
            >
                {"หมายเหตุ : "}{text}
            </Modal>
            <Modal
                title="ยกเลิกการจอง"
                open={isModalOpenDelete}
                onOk={handleDeleteBooking}
                onCancel={() => setIsModalOpenDelete(false)}
                okType="danger"
                okText="ยืนยัน"
                cancelText="ยกเลิก"
            >
                <p>คุณแน่ใจเหรอว่าต้องการยกเลิกจองพื้นที่ส่วนกลาง ?</p>
            </Modal>
            <Modal
                // title="มีใครบ้าง"
                open={isModalOpenView}
                onCancel={() => setIsModalOpenView(false)}
                footer={null}
                style={{
                    minWidth: "200px", // ลดค่า minWidth
                    maxWidth: "350px", // ลดค่า maxWidth
                }}
            >
                <style>
                    {`
                        .table-row-light {
                            background-color: #f0f0f0; /* เทาอ่อน */
                        }
                        .table-row-dark {
                            background-color: #d9d9d9; /* เทาเข้ม */
                        }
                        .ant-table-tbody > tr:hover > td {
                            background: none !important; /* ปิด hover ของ td ภายใน tr */
                        }
                    `}
                </style>
                <Table
                    rowKey="ID"
                    columns={columns}
                    dataSource={facility}
                    pagination={false}
                    scroll={{ y: 300, x: "100%" }} // เลื่อนดูข้อมูลแนวตั้ง (400px สูงสุด) และเปิด scroll แนวนอน
                    rowClassName={(_record, index) => (index % 2 === 0 ? "table-row-light" : "table-row-dark")} // สลับคลาสตามแถว
                />
            </Modal>
        </div>
    );
}