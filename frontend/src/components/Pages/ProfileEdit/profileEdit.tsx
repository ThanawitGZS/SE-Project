import { useEffect, useState } from "react";
import {
  Space,
  Button,
  Col,
  Row,
  Divider,
  Form,
  Input,
  Card,
  message,
  Upload,
  Modal,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { EmployeeInterface } from "../../../interfaces/Employee";
import { MemberInterface } from "../../../interfaces/Member";
import { GetEmployeeByID, UpdateEmployee , GetMemberByID , UpdateMember} from "../../../services/https";
import { useNavigate, Link } from "react-router-dom";

import type { UploadFile, UploadProps } from "antd";
import ImgCrop from "antd-img-crop";

function ProfileEdit() {
  const navigate = useNavigate();
  const Type = localStorage.getItem("Type")
  const [user,setUserID] = useState("");
  
  const [messageApi, contextHolder] = message.useMessage();

  const [form] = Form.useForm();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const setUserData = async () => {
    if (Type == "Member"){
      const memberID = localStorage.getItem("memberID") ?? "";
      setUserID(memberID)
      let res = await GetMemberByID(memberID);
      if (res.status === 200) {
        form.setFieldsValue({
          FirstName: res.data.FirstName,
          LastName: res.data.LastName,
          Email: res.data.Email,
          GenderID: res.data.GenderID,
        });
  
        if (res.data.Profile) {
          setFileList([
            {
              uid: '-1',
              name: 'profile-image.png',
              status: 'done',
              url: res.data.Profile, // Set the profile image URL
            },
          ]);
        }
      } else {
        messageApi.open({
          type: "error",
          content: "ไม่พบข้อมูลผู้ใช้",
        });
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    }else if (Type == "Employee"){
      const employeeID = localStorage.getItem("employeeID") ?? "";
      setUserID(employeeID)
      let res = await GetEmployeeByID(employeeID);
      if (res.status === 200) {
        form.setFieldsValue({
          FirstName: res.data.FirstName,
          LastName: res.data.LastName,
          Email: res.data.Email,
          GenderID: res.data.GenderID,
        });
  
        if (res.data.Profile) {
          setFileList([
            {
              uid: '-1',
              name: 'profile-image.png',
              status: 'done',
              url: res.data.Profile, // Set the profile image URL
            },
          ]);
        }
      } else {
        messageApi.open({
          type: "error",
          content: "ไม่พบข้อมูลผู้ใช้ (Employee)",
        });
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    }
  }

  const onPreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as Blob);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    setPreviewImage(file.url || file.preview as string);
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1));
  };

  const onFinish = async (values: EmployeeInterface | MemberInterface) => {
    if (Type === "Member") {
      values.Profile = fileList[0].thumbUrl; // ตั้งค่า Profile
      const res = await UpdateMember(user, values); // เรียก UpdateMember
      if (res.status === 200) {
        messageApi.open({
          type: "success",
          content: res.data.message,
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        messageApi.open({
          type: "error",
          content: res.data.error,
        });
      }
  } else if (Type === "Employee") {
      values.Profile = fileList[0].thumbUrl; // ตั้งค่า Profile
      const res = await UpdateEmployee(user, values); // เรียก UpdateEmployee
      if (res.status === 200) {
        messageApi.open({
          type: "success",
          content: res.data.message,
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        messageApi.open({
          type: "error",
          content: res.data.error,
        });
      }
  } else {
    messageApi.open({
      type: "error",
      content: "Type ไม่ถูกต้อง",
    });
  }
  };

  useEffect(() => {
    setUserData();
  }, [user]);

  return (
    <div>
      {contextHolder}
      <Card>
        <h2>แก้ไขข้อมูลของฉัน</h2>
        <Divider />
        <Form
          name="basic"
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16, 0]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item
                label="รูปประจำตัว"
                name="Profile"
                valuePropName="fileList"
              >
                <ImgCrop rotationSlider>
                  <Upload
                    fileList={fileList}
                    onChange={onChange}
                    onPreview={onPreview}
                    maxCount={1}
                    multiple={false}
                    listType="picture-card"
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>อัพโหลด</div>
                    </div>
                  </Upload>
                </ImgCrop>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="ชื่อจริง"
                name="FirstName"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกชื่อ !",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="นามกสุล"
                name="LastName"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกนามสกุล !",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Link to ="/changePassword">
                <Button>เปลี่ยนรหัสผ่าน</Button>
              </Link>
            </Col>
          </Row>

          <Row justify="center">
            <Col style={{ marginTop: "40px" }}>
              <Form.Item>
                <Space>
                  <Link to="/">
                    <Button htmlType="button" style={{ marginRight: "10px" }}>
                      ยกเลิก
                    </Button>
                  </Link>

                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{backgroundColor:"#FF7D29"}}
                  >
                    บันทึก
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="profile" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
}

export default ProfileEdit;