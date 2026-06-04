import { useEffect, useState } from 'react';
import { Button, Col, Form, Input, InputNumber, Row, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { flattenCategoryOptions, getCategoryTree } from '../api/category';

function ProductFilterBar({ onSearch, initialValues = {}, loading }) {
  const [form] = Form.useForm();
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    getCategoryTree()
      .then((tree) => setCategoryOptions(flattenCategoryOptions(tree)))
      .catch(() => setCategoryOptions([]));
  }, []);

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const handleFinish = (values) => {
    const params = {};
    if (values.keyword?.trim()) params.keyword = values.keyword.trim();
    if (values.categoryId) params.categoryId = values.categoryId;
    if (values.minPrice != null) params.minPrice = values.minPrice;
    if (values.maxPrice != null) params.maxPrice = values.maxPrice;
    onSearch(params);
  };

  const handleReset = () => {
    form.resetFields();
    onSearch({});
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Row gutter={16} align="bottom">
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="商品名称" allowClear prefix={<SearchOutlined />} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="categoryId" label="分类">
            <Select
              allowClear
              placeholder="全部分类"
              options={categoryOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Form.Item name="minPrice" label="最低价">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Form.Item name="maxPrice" label="最高价">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="不限" />
          </Form.Item>
        </Col>
        <Col xs={24} md={2}>
          <Form.Item label=" ">
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

export default ProductFilterBar;
