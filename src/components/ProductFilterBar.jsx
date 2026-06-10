import { useEffect, useState } from 'react';
import { Button, Cascader, Col, Form, Input, InputNumber, Row, Space, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {
  findCategoryPath,
  getCategoryTree,
  toCascaderOptions,
} from '../api/category';

function ProductFilterBar({
  onSearch,
  initialValues = {},
  loading,
  mode = 'products',
  keywordPlaceholder = '商品名称',
}) {
  const [form] = Form.useForm();
  const [categoryTree, setCategoryTree] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    getCategoryTree()
      .then((tree) => {
        const data = Array.isArray(tree) ? tree : [];
        setCategoryTree(data);
        setCategoryOptions(toCascaderOptions(data));
      })
      .catch(() => {
        setCategoryTree([]);
        setCategoryOptions([]);
      });
  }, []);

  useEffect(() => {
    const { categoryId, ...rest } = initialValues;
    const nextValues = { ...rest };
    if (categoryId && categoryTree.length) {
      nextValues.categoryPath = findCategoryPath(categoryTree, categoryId) || undefined;
    }
    form.setFieldsValue(nextValues);
  }, [form, initialValues, categoryTree]);

  const handleFinish = (values) => {
    if (
      values.minPrice != null &&
      values.maxPrice != null &&
      values.minPrice > values.maxPrice
    ) {
      message.warning('最低价不能高于最高价');
      return;
    }
    const params = {};
    if (values.keyword?.trim()) params.keyword = values.keyword.trim();
    if (values.categoryPath?.length) {
      params.categoryId = values.categoryPath[values.categoryPath.length - 1];
    }
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
        <Col xs={24} sm={12} md={mode === 'stores' ? 16 : 8}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder={keywordPlaceholder} allowClear prefix={<SearchOutlined />} />
          </Form.Item>
        </Col>
        {mode === 'products' && (
          <>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="categoryPath" label="分类">
                <Cascader
                  options={categoryOptions}
                  placeholder="全部分类"
                  allowClear
                  changeOnSelect
                  expandTrigger="hover"
                  showSearch={{
                    filter: (input, path) =>
                      path.some((option) =>
                        option.label.toLowerCase().includes(input.toLowerCase()),
                      ),
                  }}
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
          </>
        )}
        <Col xs={24} md={mode === 'stores' ? 8 : 2}>
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
