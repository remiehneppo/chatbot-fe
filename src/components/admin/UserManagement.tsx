import React from 'react';
import { Table, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { User } from '../../types/user';


const UserManagement: React.FC = () => {
  const columns: ColumnsType<User> = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'fullName',
      key: 'name',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
        title: 'Phòng (Xưởng)',
        dataIndex: 'workspace',
        key: 'workplace',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">Edit</Button>
          <Button type="link" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  const data: User[] = [
    {
        id: '1',
      fullName: 'John Brown',
      username: 'johnbrown',
      role: 'User',
      workspace: 'KT-CN',
      workspaceRole: 'Leader',
      createdAt: 1111111111,
      password: '123456',
      updatedAt: 1111111111,
    },
    // Add more sample data as needed
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Quản lý người dùng</h1>
        <Button type="primary">Thêm người dùng</Button>
      </div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default UserManagement;