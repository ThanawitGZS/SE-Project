import { useEffect, useState } from "react";
import { Col, Row, Card, Select, Input , Form , Modal, Space , Button , message , Divider , InputNumber , Dropdown , Table , Pagination , TimePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusSquareOutlined , EditOutlined , DeleteOutlined , DashOutlined , SettingOutlined , CheckCircleOutlined , ToolOutlined , CloseCircleOutlined , HeartOutlined , FundProjectionScreenOutlined , InboxOutlined} from "@ant-design/icons";

import { CreateFacility , UpdateFacility , DeleteFacilityByID , GetFacilitys , GetFacilityByID , GetFacilityStatus , GetFacilityType , CheckFacilityName} from "../../../../services/https";
// import {} from "../../../services/https";

import { FacilityInterface } from "../../../../interfaces/Facility";
import { FacilityStatusInterface } from "../../../../interfaces/FacilityStatus";
import { FacilityTypeInterface } from "../../../../interfaces/FacilityType";

import dayjs , { Dayjs } from "dayjs";


export default function FacilityManager() {
    const employeeID = localStorage.getItem("employeeID");
    const [facilitys, setFacility] = useState<FacilityInterface[]>([])
    const [facilityID,setFacilityID] = useState<string>("");
    const [fname,setFName] =useState("");
    const [facilitytypes, setFacilityTypes] = useState<FacilityTypeInterface[]>([]);
    const [facilitystatus, setFacilityStatus] = useState<FacilityStatusInterface[]>([]);

    const [formCreate] = Form.useForm();
    const [formUpdate] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const { RangePicker } = TimePicker;
    const [timeRange, setTimeRange] = useState<string[]>([]);

    const handleTimeChange = (
        dates: [Dayjs | null, Dayjs | null] | null,
        dateStrings: [string, string]
      ) => {
        if (dates) {
          setTimeRange(dateStrings); // ใช้ dateStrings (string[]: ["HH:mm", "HH:mm"]) โดยตรง
        } else {
          setTimeRange([]);
        }
      };

      const fetchDataFacility = async () => {
        try {
          const [facilityRes, typeRes , statusRes] = await Promise.all([GetFacilitys(), GetFacilityType(), GetFacilityStatus()]);
      
          if (facilityRes.status === 200) {
            setFacility(facilityRes.data);
          } else {
            setFacility([]);
            messageApi.error(facilityRes.data.error || "ไม่สามารถดึงข้อมูลพื้นที่ส่วนกลางได้");
          }
      
          if (typeRes.status === 200) {
            setFacilityTypes(typeRes.data);
          } else {
            setFacilityTypes([]);
            messageApi.error(typeRes.data.error || "ไม่สามารถดึงข้อมูลประเภทพื้นที่ได้");
          }

          if (statusRes.status === 200) {
            setFacilityStatus(statusRes.data);
          } else {
            setFacilityStatus([]);
            messageApi.error(statusRes.data.error || "ไม่สามารถดึงข้อมูลสถานะพื้นที่ได้");
          }


        } catch (error) {
            setFacility([]);
            setFacilityTypes([]);
            setFacilityStatus([]);
            messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
        }
    };

    const getFacility = async () => {
        try {
            const res = await GetFacilitys(); 
    
          if (res.status === 200) {
            setFacility(res.data); 
          } else {
            setFacility([]);
            messageApi.error(res.data.error || "ไม่สามารถดึงข้อมูลได้");
          }
        } catch (error) {
            setFacility([]);
            messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
    const [facilityNameInvalid, setFacilityNameInvalid] = useState(false); 

    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenUpdate, setIsModalOpenUpdate] = useState(false);
    const [selectedFacilityID, setSelectFacilityID] = useState<string | null>(null);

    const showModalCreateFacility = () => {
        setIsModalOpenCreate(true);
    };

    const handleCancelCreateFacility = () => {
        formCreate.resetFields();
        setIsModalOpenCreate(false);
        setFacilityNameInvalid(false);
        setIsSubmitting(false);
    };

    const handleFacilityNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        formUpdate.setFieldsValue({ FacilityName: value });
        setFacilityNameInvalid(false);
    
        if (value.length >= 1) {
            await checkFacilityName(value);
        }
    };

    const handleFacilityNameChangeUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        formUpdate.setFieldsValue({ FacilityName: value });
        setFacilityNameInvalid(false);
    
        if (value.length >= 1 && fname != value) {
            await checkFacilityName(value);
        }
    };

    const checkFacilityName = async (name: string) => {
        try {
          const res = await CheckFacilityName(name);
          if (res.status === 200) {
            if (res.data.isValid) {
                setFacilityNameInvalid(false); 
              return true;
            } else {
              messageApi.error("ชื่อพื้นที่ส่วนกลางนี้มีอยู่แล้ว");
              setFacilityNameInvalid(true);
              return false;
            }
          } else {
            messageApi.error(res.data.error || "ไม่สามารถตรวจชื่อพื้นที่ส่วนกลางได้");
            return false;
          }
        } catch (error) {
          messageApi.error("เกิดข้อผิดพลาดในการตรวจชื่อพื้นที่ส่วนกลาง");
          return false;
        }
    };

    const onFinishCreate = async (values: FacilityInterface) => {
        setIsSubmitting(true);
        // ตรวจสอบค่า employeeID
        if (!employeeID) {
            messageApi.error("ไม่พบข้อมูลพนักงาน");
            setIsSubmitting(false);
            return;
        }
        
        values.EmployeeID = parseInt(employeeID, 10);
        values.Using = 0 ;
        
        if (timeRange && timeRange.length === 2) {
            const [startTime, endTime] = timeRange;
            values.TimeOpen = startTime; // ใช้ค่า startTime ตรงๆ
            values.TimeClose = endTime; // ใช้ค่า endTime ตรงๆ
        } else {
            messageApi.error("กรุณาเลือกช่วงเวลาเปิด-ปิด");
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await CreateFacility(values);
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
            messageApi.error("เกิดข้อผิดพลาดในการสร้างพื้นที่ส่วนกลาง");
        } finally {
            formCreate.resetFields();
            setIsSubmitting(false);
            setIsModalOpenCreate(false);
            getFacility();
        }
    };

    const showModalUpdateFacility = async (id: string) => {
        let res = await GetFacilityByID(id);
        if (res.status === 200) {
            const FacilityID = res.data.ID;
            setFacilityID(FacilityID);
            setFName(res.data.FacilityName);
            const TimeOpen = res.data.TimeOpen;
            const TimeClose = res.data.TimeClose;
            const timeRange = [dayjs(TimeOpen, "HH:mm"), dayjs(TimeClose, "HH:mm")];
            formUpdate.setFieldsValue({
                FacilityName: res.data.FacilityName,
                Capacity: res.data.Capacity,
                TimeRange: timeRange,
                Descript: res.data.Descript,
                FacilityTypeID: res.data.FacilityTypeID,
                FacilityType: res.data.FacilityType,
                FacilityStatusID: res.data.FacilityStatusID,
                FacilityStatus: res.data.FacilityStatus,
            });
        } else {
            messageApi.open({
                type: "error",
                content: "ไม่พบข้อมูลพื้นที่ส่วนกลาง",
            });
        }
        setIsModalOpenUpdate(true);
    };

    const handleCanceUpdateFacility = () => {
        formUpdate.resetFields();
        setIsModalOpenUpdate(false);
        setIsSubmittingUpdate(false);
        setFacilityNameInvalid(false);
    };

    const onFinishUpdate = async (values: FacilityInterface) => {
        setIsSubmittingUpdate(true);
        // ตรวจสอบค่า employeeID
        if (!employeeID) {
            messageApi.error("ไม่พบข้อมูลพนักงาน");
            setIsModalOpenUpdate(false);
            return;
        }

        values.EmployeeID = parseInt(employeeID, 10);

        if (timeRange && timeRange.length === 2) {
            const [startTime, endTime] = timeRange;
            values.TimeOpen = startTime; // ใช้ค่า startTime ตรงๆ
            values.TimeClose = endTime; // ใช้ค่า endTime ตรงๆ
        } else {
            messageApi.error("กรุณาเลือกช่วงเวลาเปิด-ปิด");
            setIsSubmitting(false);
            return;
        }
        
        try {
            const res = await UpdateFacility(facilityID, values);
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
            getFacility();
        }
    };

    const showModalDeleteFacility = (id: string) => {
        setSelectFacilityID(id)
        setIsModalOpenDelete(true);
    };

    const handleDeleteFacility = async () => {
        if (selectedFacilityID) {
          try {
            const res = await DeleteFacilityByID(selectedFacilityID);
            if (res.status === 200) {
              messageApi.success("ลบข้อมูลสำเร็จ");
              await getFacility();
            } else {
              messageApi.error(res.data.error || "ไม่สามารถลบข้อมูลได้");
            }
          } catch (error) {
            messageApi.error("เกิดข้อผิดพลาดในการลบข้อมูล");
          } finally {
            setIsModalOpenDelete(false);
            setSelectFacilityID(null);
          }
        }
    };

    useEffect(() => {
        fetchDataFacility();
    }, [ ]);

    const columns: ColumnsType<FacilityInterface> = [
        {
            title: "ชื่อพื้นที่ส่วนกลาง",
            dataIndex: "FacilityName",
            key: "facility_name",
            sorter: (a, b) => {
                const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
                return collator.compare(a.FacilityName || "", b.FacilityName || "");
            },
            defaultSortOrder: "ascend", // เรียงจากน้อยไปมากโดยอัตโนมัติ
        },
        {
            title: "จำนวนคนในการเข้าใช้งาน",
            dataIndex: "Capacity",
            key: "capacity",
        },
        {
            title: "เวลาเปิด",
            dataIndex: "TimeOpen",
            key: "time_open",
        },
        {
            title: "เวลาปิด",
            dataIndex: "TimeClose",
            key: "time_close",
        },
        {
            title: "ประเภท",
            key: "FacilityType",
            render: (record) => <>{record.FacilityType?.Name || "N/A"}</>,
        },
        {
            title: "สถานะ",
            key: "FacilityStatus",
            render: (record) => <>{record.FacilityStatus?.Name || "N/A"}</>,
        },
        {
            title: "แก้ไข",
            key: "Employee",
            render: (record) => <>{record.Employee?.FirstName || "ไม่เจอ"}</>,
        },
        {
             title: "คำอธิบาย",
             dataIndex: "Descript",
            key: "descript",
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
                    onClick: () => showModalUpdateFacility(_record.ID),
                  },
                  {
                    label: "ลบข้อมูล",
                    key: "2",
                    icon: <DeleteOutlined />,
                    onClick: () => showModalDeleteFacility(_record.ID),
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

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const { Option } = Select; // นำเข้า Option จาก Select โดยตรง
    const pageSize = 4;

    const filteredFacilitys = facilitys.filter((facility) => {
    
        const facilityStatus = facilitystatus.find((status) => status.ID === facility.FacilityStatusID)?.Name || "ไม่ทราบ";
        const facilityTypes = facilitytypes.find((type) => type.ID === facility.FacilityTypeID)?.Name || "ไม่ทราบ";        
        // กรองตามชื่อห้อง
        const matchesSearch = (facility.FacilityName || "").toLowerCase().includes(searchTerm.toLowerCase());

        // กรองตามสถานะ
        const matchesStatus = statusFilter ? facilityStatus === statusFilter : true;
        const matchesType = typeFilter ? facilityTypes === typeFilter : true;
    
        return matchesSearch && matchesStatus && matchesType ;
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
    }, [ searchTerm, statusFilter, typeFilter]);

    const getNameFacilityStatus = (StatusID: number) =>
        facilitystatus.find((status) => status.ID === StatusID)?.Name || "Unknown";

    const getNameFacilityType = (TypeID: number) =>
        facilitytypes.find((type) => type.ID === TypeID)?.Name || "Unknown";

    const getIconStatus = (StatusID: number) => {
        switch (StatusID) {
          case 1:
            return <Card  className="card-room-green" bodyStyle={{ padding: 8 }} >
                {getNameFacilityStatus(StatusID ?? 0)}{" "}<CheckCircleOutlined />
            </Card>;
          case 2:
            return <Card  className="card-room-red" bodyStyle={{ padding: 8 }} >  
                    {getNameFacilityStatus(StatusID ?? 0)}{" "}<CloseCircleOutlined />
            </Card>;
          case 3:
            return <Card  className="card-room-yellow" bodyStyle={{ padding: 8 }} >
                    {getNameFacilityStatus(StatusID ?? 0)}{" "}<ToolOutlined />
            </Card>;
          default:
            return <Card  className="card-room-show" bodyStyle={{ padding: 8 }} >
                ไม่พบสถานะพื้นที่ส่วนกลาง
            </Card>;
        }
    }
    
    const getIconType= (TypeID: number) => {
        switch (TypeID) {
          case 1:
            return <Card  className="card-room-blue" bodyStyle={{ padding: 8 }} >
                {getNameFacilityType(TypeID ?? 0)}{" "}<HeartOutlined />
            </Card>;
          case 2:
            return <Card  className="card-room-purple" bodyStyle={{ padding: 8 }} >  
                {getNameFacilityType(TypeID ?? 0)}{" "}<FundProjectionScreenOutlined />
            </Card>;
          default:
            return <Card  className="card-room-show" bodyStyle={{ padding: 8 }} >
                ไม่พบประเภทพื้นที่ส่วนกลาง
            </Card>;
        }
    }

    const getInfoType= (TypeID: number , Capacity: number , Using: number) => {
        switch (TypeID) {
            case 1:
            return <Card  className="card-room-show" bodyStyle={{ padding: 8 }} >
                {"เข้าใช้งานอยู่ "}{Using}{"/"}{Capacity}{" คน"}
            </Card>;
            case 2:
            const capacityMessage = Using === 1 
            ? "มีการจองใช้งาน" 
            : "ไม่มีการจองใช้งาน";
            return <Card  className="card-room-show" bodyStyle={{ padding: 8 }} >  
                {capacityMessage}
            </Card>;
            case 3:
                return <Card  className="card-room-show" bodyStyle={{ padding: 8 }} >  
                    อยู่ในช่วงซ่อมบำรุง
                </Card>;
          default:
            return <Card  className="card-room-show" bodyStyle={{ padding: 8 }} >
                ไม่พบข้อมูลการใช้งาน
            </Card>;
        }
    }

    return(
        <div>
            {contextHolder}
            <Card style={{ marginBottom:16}} className="card-room">
                <Row gutter={[16, 0]} >
                    <Col xl={16}>
                        <Form.Item
                            label={<span style={{fontSize: "20px" , fontWeight: "bold"}}>ค้นหาพื้นที่ส่วนกลาง</span>}
                            labelCol={{ span: 24 }}
                        >
                            <Input
                                placeholder="กรอกชื่อพื้นที่ส่วนกลาง"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Form.Item>
                    </Col>
                    <Col xl={4} style={{display: "flex", gap: "16px",}}>
                        <Form.Item
                            label={<span style={{fontSize: "20px" , fontWeight: "bold"}}>ประเภทพื้นที่</span>}
                            labelCol={{ span: 24 }}
                        >
                            <Select
                                placeholder="เลือกประเภท"
                                value={typeFilter}
                                onChange={(value) => setTypeFilter(value)} // อัปเดต statusFilter เมื่อเลือกสถานะ
                                style={{ width: 220 }}
                                allowClear // ให้สามารถลบตัวเลือกได้ (แสดงทั้งหมด)
                            >
                                {facilitytypes.map((type) => (
                                    <Option key={type.ID} value={type.Name}>
                                        {type.Name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xl={4} style={{display: "flex", gap: "16px",}}>
                        <Form.Item
                            label={<span style={{fontSize: "20px" , fontWeight: "bold"}}>สถานะพื้นที่</span>}
                            labelCol={{ span: 24 }}
                        >
                            <Select
                                placeholder="เลือกสถานะ"
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value)} // อัปเดต statusFilter เมื่อเลือกสถานะ
                                style={{ width: 220 }}
                                allowClear // ให้สามารถลบตัวเลือกได้ (แสดงทั้งหมด)
                            >
                                {facilitystatus.map((status) => (
                                    <Option key={status.ID} value={status.Name}>
                                        {status.Name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Card>
            <Card style={{ height: 720 }} className="card-room" >
                <Row align="middle" gutter={[16,0]}>
                    <Col xl={12} style={{ textAlign: "left" }} >
                        <span style={{fontSize: "24px" , fontWeight: "bold"}}>ข้อมูลพื้นที่ส่วนกลาง</span>
                    </Col>
                    <Col xl={12} style={{ textAlign: "end", alignSelf: "center" }}>
                        <Space>
                            <Button 
                            type="primary" 
                            className="green-button"
                            onClick={showModalCreateFacility}
                            icon={<PlusSquareOutlined />}
                            >
                                เพิ่มพื้นที่ส่วนกลาง
                            </Button>
                        </Space>
                    </Col>
                    <Divider/>
                    {/* <Table
                        rowKey="ID"
                        columns={columns}
                        dataSource={facilitys} // Data from the API
                        pagination={{ pageSize: 5 }}
                        style={{ width: "100%", overflowX: "auto" }}
                    /> */}
                </Row>
                <Row gutter={[16, 16]}>
                    {paginatedFacilitys.length > 0 ? (
                        paginatedFacilitys.map((facility) => (
                            <Col key={facility.ID} xl={12}>
                                <Card className="card-room">
                                    <Row gutter={[10,10]} justify="center" align="middle" >
                                        <Col xl={22}>
                                            <Card className="card-room-title" bodyStyle={{ padding: 8 }}>
                                                {"พื้นที่ส่วนกลาง "}{facility.FacilityName}
                                            </Card>
                                        </Col>
                                        <Col xl={2}>
                                            <Dropdown
                                                menu={{
                                                    items: [
                                                        {
                                                            label: "แก้ไขข้อมูล",
                                                            key: "1",
                                                            icon: <EditOutlined />,
                                                            onClick: () => showModalUpdateFacility(facility.ID?.toString() || "")
                                                        },
                                                        {
                                                            label: "ลบข้อมูล",
                                                            key: "2",
                                                            icon: <DeleteOutlined />,
                                                            onClick: () => showModalDeleteFacility(facility.ID?.toString() || ""),
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
                                        <Col xl={12}>
                                            {getInfoType(facility.FacilityTypeID ?? 0,facility.Capacity ?? 0,facility.Using ?? 0)}
                                        </Col>
                                        <Col xl={12}>
                                            {getIconStatus(facility.FacilityStatusID ?? 0)}
                                        </Col>
                                        <Col xl={12}>
                                            {getIconType(facility.FacilityTypeID ?? 0)}
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
                                <p style={{ fontSize: "16px", color: "#999" }}>ไม่มีข้อมูลพื้นที่ส่วนกลาง</p>
                            </div>
                        </Col>
                    )}
                </Row>
            </Card>
            <Col xl={24} style={{display: "flex", justifyContent: "flex-end", }}>
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredFacilitys.length}
                    onChange={(page) => setCurrentPage(page)}
                    style={{ marginTop: 16 }}
                />
            </Col>

            <Modal
            title="เพิ่มพื้นที่ส่วนกลาง"
            open={isModalOpenCreate}
            onCancel={handleCancelCreateFacility}
            footer={null}
            >
                <Divider/>
                <Form
                    name="register"
                    form={formCreate}
                    onFinish={onFinishCreate}
                    layout="vertical"
                    initialValues={{
                        Capacity: 1
                    }}
                >
                    <Row gutter={[16,0]}>
                        <Col xl={24}>
                            <Form.Item
                                name="FacilityName"
                                label="ชื่อพื้นที่ส่วนกลาง"
                                rules={[
                                    {
                                        required: true,
                                        message: 'กรุณากรอกชื่อพื้นที่ส่วนกลาง'
                                    },
                                    {
                                        pattern: /^[\u0E00-\u0E7Fa-zA-Z0-9]+$/,
                                        message: 'กรุณากรอกเฉพาะตัวอักษรภาษาไทย หรือ ภาษาอังกฤษ และตัวเลขเท่านั้น',
                                    },
                                ]}
                            >
                                <Input
                                    id="randomFacilityName"
                                    type="text"
                                    autoComplete="new-password"
                                    onKeyDown={(e) => {
                                        if (!/^[\u0E00-\u0E7Fa-zA-Z0-9]+$/.test(e.key) && e.key !== "Backspace") {
                                            e.preventDefault();
                                        }
                                    }}
                                    onChange={handleFacilityNameChange}
                                    onCopy={(e) => e.preventDefault()} // Prevent copy
                                    onCut={(e) => e.preventDefault()} // Prevent cut
                                    onPaste={(e) => e.preventDefault()} // Prevent paste
                                />
                            </Form.Item>
                        </Col>
                        <Col xl={10}>
                        <Form.Item
                                name="Capacity"
                                label="จำนวนคนเข้าใช้งาน"
                                rules={[
                                    { 
                                        required: true,
                                        message: 'กรุณากรอกจำนวนคนเข้าใช้งาน' 
                                    },
                                    {
                                        pattern: /^[1-9][0-9]*$/,
                                        message: "กรุณากรอกค่าจำนวนคนเข้าใช้งานมากกว่า 0 คน",
                                    },
                                ]}
                            >
                                <InputNumber
                                    id="Capacity"
                                    maxLength={2}
                                    min={1} 
                                    autoComplete="off" 
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
                                    addonAfter="คน"
                                />
                            </Form.Item>
                        </Col>
                        <Col xl={14}>
                            <Form.Item
                                label="ช่วงเวลาเปิด-ปิด"
                                name="TimeRange"
                                rules={[{ required: true, message: "กรุณาเลือกช่วงเวลา" }]}
                            >
                                <RangePicker
                                format="HH:mm" // กำหนดรูปแบบเวลา
                                minuteStep={15} // กำหนดขั้นของนาที (เลือกได้ทุกๆ 15 นาที)
                                onChange={handleTimeChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col xl={12}>
                            <Form.Item
                                label="ประเภทส่วนกลาง"
                                name="FacilityTypeID"
                                rules={[
                                    {
                                        required: true,
                                        message: "กรุณาเลือกประเภทพื้นที่ส่วนกลาง!",
                                    },
                                ]}
                                >
                                <Select
                                placeholder="กรุณาเลือกเภทพื้นที่ส่วนกลาง"
                                style={{ width: "100%" }}
                                options={facilitytypes.map((facilitytype) => ({
                                    value: facilitytype.ID,
                                    label: facilitytype.Name,
                                }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xl={12}>
                            <Form.Item
                                label="สถานะส่วนกลาง"
                                name="FacilityStatusID"
                                rules={[
                                    {
                                        required: true,
                                        message: "กรุณาเลือกสถานะพื้นที่ส่วนกลาง!",
                                    },
                                ]}
                                >
                                <Select
                                placeholder="กรุณาเลือกสถานะพื้นที่ส่วนกลาง"
                                style={{ width: "100%" }}
                                options={facilitystatus.map((facilitystatus) => ({
                                    value: facilitystatus.ID,
                                    label: facilitystatus.Name,
                                }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xl={24}>
                            <Form.Item
                                label="คำอธิบาย"
                                name="Descript"
                                rules={[
                                { required: true, message: 'กรุณาเขียนคำอธิบาย' },
                                { max: 500, message: 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร' },
                                ]}
                            >
                                <Input.TextArea
                                rows={4} // จำนวนแถวที่จะแสดงในช่อง
                                placeholder="กรุณาเขียนคำอธิบายที่นี่..."
                                maxLength={500} // จำกัดความยาวสูงสุดของข้อความ
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
                                    className="green-button"
                                    loading={isSubmitting}
                                    disabled={isSubmitting || facilityNameInvalid }
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
                onOk={handleDeleteFacility}
                onCancel={() => setIsModalOpenDelete(false)}
                okType="danger"
                okText="ลบ"
                cancelText="ยกเลิก"
            >
                <p>คุณแน่ใจเหรอว่าต้องการลบข้อมูลพื้นที่ส่วนกลาง ?</p>
            </Modal>
            <Modal
                title="แก้ไขข้อมูลพื้นที่ส่วนกลาง"
                open={isModalOpenUpdate}
                onCancel={handleCanceUpdateFacility}
                footer={null}
            >
                <Form
                    name="update"
                    form={formUpdate}
                    onFinish={onFinishUpdate}
                    layout="vertical"
                >
                    <Row gutter={[16,0]}>
                        <Col xl={24}>
                            <Form.Item
                                name="FacilityName"
                                label="ชื่อพื้นที่ส่วนกลาง"
                                rules={[
                                    {
                                        required: true,
                                        message: 'กรุณากรอกชื่อพื้นที่ส่วนกลาง'
                                    },
                                    {
                                        pattern: /^[\u0E00-\u0E7Fa-zA-Z0-9]+$/,
                                        message: 'กรุณากรอกเฉพาะตัวอักษรภาษาไทย หรือ ภาษาอังกฤษ และตัวเลขเท่านั้น',
                                    },
                                ]}
                            >
                                <Input
                                    id="randomFacilityName"
                                    type="text"
                                    autoComplete="new-password"
                                    onKeyDown={(e) => {
                                        if (!/^[\u0E00-\u0E7Fa-zA-Z0-9]+$/.test(e.key) && e.key !== "Backspace") {
                                            e.preventDefault();
                                        }
                                    }}
                                    onChange={handleFacilityNameChangeUpdate}
                                    onCopy={(e) => e.preventDefault()} // Prevent copy
                                    onCut={(e) => e.preventDefault()} // Prevent cut
                                    onPaste={(e) => e.preventDefault()} // Prevent paste
                                />
                            </Form.Item>
                        </Col>
                        <Col xl={10}>
                        <Form.Item
                                name="Capacity"
                                label="จำนวนคนเข้าใช้งาน"
                                rules={[
                                    { 
                                        required: true,
                                        message: 'กรุณากรอกจำนวนคนเข้าใช้งาน' 
                                    },
                                    {
                                        pattern: /^[1-9][0-9]*$/,
                                        message: "กรุณากรอกค่าจำนวนคนเข้าใช้งานมากกว่า 0 คน",
                                    },
                                ]}
                            >
                                <InputNumber
                                    id="Capacity"
                                    maxLength={2}
                                    min={1} 
                                    autoComplete="off" 
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
                                    addonAfter="คน"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={14}>
                            <Form.Item
                                label="ช่วงเวลาเปิด-ปิด"
                                name="TimeRange"
                                rules={[{ required: true, message: "กรุณาเลือกช่วงเวลา" }]}
                            >
                                <RangePicker
                                format="HH:mm" // กำหนดรูปแบบเวลา
                                minuteStep={15} // กำหนดขั้นของนาที (เลือกได้ทุกๆ 15 นาที)
                                onChange={handleTimeChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col xl={12}>
                            <Form.Item
                                label="ประเภทส่วนกลาง"
                                name="FacilityTypeID"
                                rules={[
                                    {
                                        required: true,
                                        message: "กรุณาเลือกประเภทพื้นที่ส่วนกลาง!",
                                    },
                                ]}
                                >
                                <Select
                                placeholder="กรุณาเลือกเภทพื้นที่ส่วนกลาง"
                                style={{ width: "100%" }}
                                options={facilitytypes.map((facilitytype) => ({
                                    value: facilitytype.ID,
                                    label: facilitytype.Name,
                                }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xl={12}>
                            <Form.Item
                                label="สถานะส่วนกลาง"
                                name="FacilityStatusID"
                                rules={[
                                    {
                                        required: true,
                                        message: "กรุณาเลือกสถานะพื้นที่ส่วนกลาง!",
                                    },
                                ]}
                                >
                                <Select
                                placeholder="กรุณาเลือกสถานะพื้นที่ส่วนกลาง"
                                style={{ width: "100%" }}
                                options={facilitystatus.map((facilitystatus) => ({
                                    value: facilitystatus.ID,
                                    label: facilitystatus.Name,
                                }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xl={24}>
                            <Form.Item
                                label="คำอธิบาย"
                                name="Descript"
                                rules={[
                                { required: true, message: 'กรุณาเขียนคำอธิบาย' },
                                { max: 500, message: 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร' },
                                ]}
                            >
                                <Input.TextArea
                                rows={4} // จำนวนแถวที่จะแสดงในช่อง
                                placeholder="กรุณาเขียนคำอธิบายที่นี่..."
                                maxLength={500} // จำกัดความยาวสูงสุดของข้อความ
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
                                    className="green-button"
                                    loading={isSubmittingUpdate}
                                    disabled={isSubmittingUpdate || facilityNameInvalid }
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