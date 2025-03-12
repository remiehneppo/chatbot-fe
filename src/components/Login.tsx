import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./Login.css";

interface LoginResponse {
  status: string;
  message: string;
  data: {
    access_token: string;
  }
}

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const response = await api.post<LoginResponse>('/api/v1/login', {
        username: values.username,
        password: values.password,
      });

      if (response.data.data.access_token) {
        // Store the user token
        localStorage.setItem('user_token', response.data.data.access_token);
        message.success('Đăng nhập thành công');
        navigate('/'); // Navigate to home page after login
      }
    } catch (error) {
      console.error('Login failed:', error);
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');

      // test
      localStorage.setItem('user_token', "fake")
    }
  };

  return (
    <div className="login-container">
      <Card title="Đăng Nhập" className="login-card">
        <Form
          form={form}
          name="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
