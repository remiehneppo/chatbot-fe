import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface DataType {
  key: string;
  title: string;
  category: string;
  status: string;
  dateCreated: string;
}

const DocumentManagement: React.FC = () => {
  const columns: ColumnsType<DataType> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Date Created',
      dataIndex: 'dateCreated',
      key: 'dateCreated',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">View</Button>
          <Button type="link">Edit</Button>
          <Button type="link" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  const data: DataType[] = [
    {
      key: '1',
      title: 'Document 1',
      category: 'General',
      status: 'Active',
      dateCreated: '2024-03-11',
    },
    // Add more sample data as needed
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Quản lý tài liệu</h1>
        <Button type="primary">Thêm tài liệu</Button>
      </div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default DocumentManagement;