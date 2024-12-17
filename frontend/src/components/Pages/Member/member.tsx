import { useState, useEffect } from "react";
import { Space, Table, Button, Col, Row, Divider, message, Dropdown, Modal, Card, Statistic } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, DashOutlined  } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { GetMembers, DeleteMemberByID} from "../../../services/https/index";
import { MemberInterface } from "../../../interfaces/Member";
import { Link, useNavigate } from "react-router-dom";

export default function Member() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<MemberInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const columns: ColumnsType<MemberInterface> = [
    {
      title: "ลำดับ",
      dataIndex: "ID",
      key: "id",
    },
    {
      title: "รูปประจำตัว",
      dataIndex: "Profile",
      key: "profile",
      width: "15%",
      render: (text, record, index) => {
        void text;
        void index;
        // void เป็นการอ่านค่าตัวแปร แต่ไม่ต้องการใช้งานช่วยแก้ปัญหา declared but never read
      return (
        <img src={record.Profile} className="profile" />
      )}
    },
    {
      title: "ชื่อ",
      dataIndex: "FirstName",
      key: "first_name",
    },
    {
      title: "นามสกุล",
      dataIndex: "LastName",
      key: "last_name",
    },
    {
      title: "อีเมล",
      dataIndex: "Email",
      key: "email",
    },
    {
      title: "เพศ",
      key: "gender",
      render: (record) => <>{record.Gender?.Name || "N/A"}</>,
    },
    {
      title: "สมัครโดย",
      key: "Employee",
      render: (record) => <>{record.Employee?.FirstName || "ไม่มี"}</>,
    },
    {
      title: "จัดการ",
      render: (record) => (
        <Dropdown
          menu={{
            items: [
              {
                label: "แก้ไขข้อมูล",
                key: "1",
                icon: <EditOutlined />,
                onClick: () => navigate(`/member/edit/${record.ID}`),
              },
              {
                label: "ลบข้อมูล",
                key: "2",
                icon: <DeleteOutlined />,
                onClick: () => showDeleteConfirmModal(record.ID),
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

  const showDeleteConfirmModal = (id: string) => {
    setSelectedMemberId(id);
    setIsModalVisible(true);
  };

  const handleDeleteMember = async () => {
    if (selectedMemberId) {
      try {
        const res = await DeleteMemberByID(selectedMemberId);
        if (res.status === 200) {
          messageApi.success("ลบข้อมูลสำเร็จ");
          await getMembers(); // Refresh the list after deleting a member
        } else {
          messageApi.error(res.data.error || "ไม่สามารถลบข้อมูลได้");
        }
      } catch (error) {
        messageApi.error("เกิดข้อผิดพลาดในการลบข้อมูล");
      } finally {
        setIsModalVisible(false);
        setSelectedMemberId(null);
      }
    }
  };

  const getMembers = async () => {
    try {
      const res = await GetMembers(); // Fetch data from the API

      if (res.status === 200) {
        setMembers(res.data); // Set the data from the API response
      } else {
        messageApi.error(res.data.error || "ไม่สามารถดึงข้อมูลได้");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
  };

  useEffect(() => {
    getMembers();
  }, []);

  return (
    <>
      {contextHolder}
      <Row>
        <Col span={12}>
          <h1>ข้อมูลสมาชิก</h1>
        </Col>

        <Col span={12} style={{ textAlign: "end", alignSelf: "center" }}>
          <Space>
            <Link to="/member/create">
              <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: "rgb(218, 165, 32)" }}>
                สมัครสมาชิก
              </Button>
            </Link>
          </Space>
        </Col>

      </Row>

      <Divider />

      <div style={{ marginTop: 20 }}>
        <Table
          rowKey="ID"
          columns={columns}
          dataSource={members} // Data from the API
          pagination={{ pageSize: 5 }}
          style={{ width: "100%", overflowX: "auto" }}
        />
      </div>

      <Modal
        title="ยืนยันการลบ"
        visible={isModalVisible}
        onOk={handleDeleteMember}
        onCancel={() => setIsModalVisible(false)}
        okType="danger"
        okText="ลบ"
        cancelText="ยกเลิก"
      >
        <p>คุณแน่ใจหรือว่าต้องการลบข้อมูลนี้?</p>
      </Modal>
    </>
  );
}

