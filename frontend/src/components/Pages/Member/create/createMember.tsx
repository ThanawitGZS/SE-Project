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
  Select,
  Upload,
  Modal
} from "antd";

import { PlusOutlined } from "@ant-design/icons";

import { MemberInterface } from "../../../../interfaces/Member";
import { GenderInterface } from "../../../../interfaces/Gender";

import type { UploadFile, UploadProps } from "antd";
import { CheckPhone , CheckNationalID , CheckEmail, CreateMember , GetGenders  } from "../../../../services/https";
import { useNavigate, Link } from "react-router-dom";
import ImgCrop from "antd-img-crop";

function MemberCreate() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const employeeID = localStorage.getItem("employeeID");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [genders, setGenders] = useState<GenderInterface[]>([]);
  
  const [emailInvalid, setEmailInvalid] = useState(false); 
  const [phoneNumberInvalid, setPhoneNumberInvalid] = useState(false);
  const [nationalIDInvalid, setNationalIDInvalid] = useState(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1));
  };

  const getGenders = async () => {
    try {
      const res = await GetGenders(); // Fetch data from the API

      if (res.status === 200) {
        setGenders(res.data); // Set the data from the API response
      } else {
        setGenders([]);
        messageApi.error(res.data.error || "ไม่สามารถดึงข้อมูลได้");
      }
    } catch (error) {
      setGenders([]);
      messageApi.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
  };

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

  useEffect(() => {
    getGenders();
  }, []);

  const checkPhone = async (phoneNumber: string) => {
    try {
      const res = await CheckPhone(phoneNumber);
      if (res.status === 200) {
        if (res.data.isValid) {
          setPhoneNumberInvalid(false); // Phone number is valid
          return true;
        } else {
          messageApi.error("เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว");
          setPhoneNumberInvalid(true); // Set invalid flag if phone number is in use
          return false;
        }
      } else {
        messageApi.error(res.data.error || "ไม่สามารถตรวจสอบเบอร์โทรศัพท์ได้");
        return false;
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการตรวจสอบเบอร์โทรศัพท์");
      return false;
    }
  };

  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setFieldsValue({ PhoneNumber: value });
    setPhoneNumberInvalid(false); // Reset invalid flag when phone changes

    // ตรวจสอบเมื่อเบอร์โทรมีความยาวครบ 10 หลัก
    if (value.length === 10) {
        await checkPhone(value);
    }
  };

  const checkNationalID = async (nationalID: string) => {
    try {
      const res = await CheckNationalID(nationalID);
      if (res.status === 200) {
        if (res.data.isValid) {
          setNationalIDInvalid(false); // Phone number is valid
          return true;
        } else {
          messageApi.error("รหัสบัตรประชาชนซ้ำ");
          setNationalIDInvalid(true); // Set invalid flag if phone number is in use
          return false;
        }
      } else {
        messageApi.error(res.data.error || "ไม่สามารถตรวจสอบรหัสบัตรประชาชนได้");
        return false;
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการตรวจสอบรหัสบัตรประชาชน");
      return false;
    }
  };
  
  const handleNationalIDChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setFieldsValue({ NationalId: value });
    setNationalIDInvalid(false); // Reset invalid flag when ID changes
  
    // if (value.length === 13) {
    //   // ตรวจสอบรหัสบัตรประชาชนเมื่อมี 13 หลัก
    //   await checkNationalID(value);
    // }
    await checkNationalID(value);
  };

  const checkEmail = async (email: string) => {
    try {
      const res = await CheckEmail(email);

      if (res.status === 200) {
        if (res.data.isValid) {
          setEmailInvalid(false); // Reset invalid flag when email is valid
          return true;
        } else {
          messageApi.error("อีเมลนี้มีอยู่ในระบบแล้ว");
          setEmailInvalid(true)
          return false;
        }
      } else {
        messageApi.error(res.data.error || "ไม่สามารถตรวจสอบอีเมลได้");
        return false;
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการตรวจสอบอีเมล");
      return false;
    }
  };
  
  // Handle change in email field to reset emailInvalid flag
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setFieldsValue({ Email: e.target.value });
    setEmailInvalid(false); // Reset emailInvalid flag when email changes
    
    const emailIsValid = checkEmail(value || "");
    if (!emailIsValid) {
      setIsSubmitting(false);
      return;
    }
  };

  const onFinish = async (values: MemberInterface) => {
    setIsSubmitting(true); // Start submitting process

    if (fileList.length === 0) {
      message.error("กรุณาใส่รูปโปรไฟล์!");
      setIsSubmitting(false); // Re-enable button
      return;
    }

    // Continue submission if email is valid
    values.Profile = fileList[0]?.thumbUrl || "";

    values.EmployeeID = parseInt(employeeID || "", 10);
    const res = await CreateMember(values);

    if (res.status === 201) {
      messageApi.open({
        type: "success",
        content: res.data.message,
      });
      setTimeout(() => {
        navigate("/member");
      }, 2000);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
    setIsSubmitting(true);
  };

  return (
    <div>
      {contextHolder}
      <Card>
        <h2>เพิ่มข้อมูล สมาชิก</h2>
        <Divider />
        <Form
          name="basic"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off" // Disable form-level autocomplete
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
                    action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                    fileList={fileList}
                    onChange={onChange}
                    maxCount={1}
                    multiple={false}
                    listType="picture-card"
                    onPreview={onPreview}
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
                name="FirstName" // Use a less predictable name attribute
                rules={[{ required: true, message: "กรุณากรอกชื่อ!" }]}
              >
                <Input
                  id="randomFirstName" // Use a less predictable id attribute
                  type="text" // Generic input type
                  autoComplete="new-password" // A trick to prevent autofill
                  onCopy={(e) => e.preventDefault()} // Prevent copy
                  onCut={(e) => e.preventDefault()} // Prevent cut
                  onPaste={(e) => e.preventDefault()} // Prevent paste
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="นามสกุล"
                name="LastName" // Use a less predictable name attribute
                rules={[{ required: true, message: "กรุณากรอกนามสกุล!" }]}
              >
                <Input
                  id="randomLastName" // Use a less predictable id attribute
                  type="text" // Generic input type
                  autoComplete="new-password" // A trick to prevent autofill
                  onCopy={(e) => e.preventDefault()} // Prevent copy
                  onCut={(e) => e.preventDefault()} // Prevent cut
                  onPaste={(e) => e.preventDefault()} // Prevent paste
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="เบอร์โทร"
                name="PhoneNumber"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกเบอร์โทร!",
                  },
                  {
                    pattern: /^0\d{9}$/,
                    message: "กรุณากรอกเบอร์โทร!",
                  },
                ]}
              >
                <Input
                  id="randomPhoneNumber" // Use a less predictable id attribute
                  type="tel" // Tel type, which may help prevent cookie-based autofill
                  autoComplete="new-password" // Prevent browser autofill
                  maxLength={10} // จำกัดความยาวสูงสุดที่ 10 หลัก
                  onChange={handlePhoneChange}
                  onKeyPress={(event) => {
                    const inputValue = (event.target as HTMLInputElement).value;
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                    if (inputValue.length === 0 && event.key !== "0") {
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
                label="รหัสบัตรประชาชน"
                name="NationalId"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกรหัสบัตรประชาชน!",
                  },
                  {
                    pattern: /^\d{13}$/,
                    message: "กรุณากรอกรหัสบัตรประชาชนให้ครบ 13 หลัก",
                  },
                ]}
              >
                <Input 
                    id="randomNationalID" // Use a less predictable id attribute
                    type="tel" // Tel type, which may help prevent cookie-based autofill
                    autoComplete="new-password" // Prevent browser autofill
                    maxLength={13}
                    onChange={handleNationalIDChange}
                    onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
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
                label="อีเมล"
                name="Email"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกอีเมล!",
                  },
                ]}
              >
                <Input type="email" onChange={handleEmailChange} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="รหัสผ่าน"
                name="Password"
                rules={[
                  {
                    required: true,
                    message: "กรุณาเลือกกรอกรหัสผ่าน!",
                  },
                  { min: 6, message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" },
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="เพศ"
                name="GenderID"
                rules={[
                  {
                    required: true,
                    message: "กรุณาเลือกเพศ!",
                  },
                ]}
              >
                <Select
                  placeholder="กรุณาเลือกเพศ"
                  style={{ width: "100%" }}
                  options={genders.map((gender) => ({
                    value: gender.ID,
                    label: gender.Name,
                  }))}
                />
              </Form.Item>
            </Col>

            {/* <Col xs={24} sm={24} md={24} lg={24} xl={12}>
              <Form.Item
                label="ตำแหน่ง"
                name="PositionID"
                rules={[
                  {
                    required: true,
                    message: "กรุณาเลือกตำแหน่ง!",
                  },
                ]}
              >
                <Select
                  placeholder="เลือกตำแหน่ง"
                  style={{ width: "100%" }}
                  options={positions.map((position) => ({
                    value: position.ID,
                    label: position.Name, 
                  }))}
                />
              </Form.Item>
            </Col> */}
          </Row>

          <Row justify="center">
            <Col style={{ marginTop: "40px" }}>
              <Form.Item>
                <Space>
                  <Link to="/member">
                    <Button htmlType="button" style={{ marginRight: "10px" , backgroundColor:"#e0dede"}}>
                      ยกเลิก
                    </Button>
                  </Link>

                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ backgroundColor: "rgb(218, 165, 32)" }}
                    loading={isSubmitting}
                    disabled={isSubmitting || emailInvalid || phoneNumberInvalid || nationalIDInvalid || fileList.length === 0} // Disable if submitting or phone is invalid
                  >
                    ยืนยัน
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

export default MemberCreate;
