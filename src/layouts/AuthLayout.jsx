import { useState } from 'react';
import { Typography } from 'antd';
import {
  GiftOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const LOGO_SRC = '/images/logo.png';

function AuthLayout({ title, subtitle, children }) {
  const [logoError, setLogoError] = useState(false);
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-bg" aria-hidden="true">
          <span className="auth-blob auth-blob-1" />
          <span className="auth-blob auth-blob-2" />
          <span className="auth-blob auth-blob-3" />
        </div>
        <div className="auth-brand-content">
          <div className="auth-logo">
            <span className="auth-logo-mark">
              {logoError ? (
                <span className="auth-logo-icon">鲸</span>
              ) : (
                <img
                  src={LOGO_SRC}
                  alt="南鲸商城"
                  className="auth-logo-img"
                  onError={() => setLogoError(true)}
                />
              )}
            </span>
            <div>
              <Title level={2} className="auth-brand-title">
                南鲸商城
              </Title>
              <Text className="auth-brand-tagline">国货优选 · 品质生活</Text>
            </div>
          </div>
          <Paragraph className="auth-brand-desc">
            汇聚优质国货品牌，从浏览、下单到门店履约，为顾客、门店员工与管理员提供一站式购物与运营体验。
          </Paragraph>
          <ul className="auth-features">
            <li>
              <ShopOutlined />
              <span>精选国货品牌门店</span>
            </li>
            <li>
              <GiftOutlined />
              <span>优惠券与专属福利</span>
            </li>
            <li>
              <SafetyCertificateOutlined />
              <span>安全便捷的账号体系</span>
            </li>
            <li>
              <TeamOutlined />
              <span>门店员工工作台</span>
            </li>
            <li>
              <SettingOutlined />
              <span>管理员总览与配置</span>
            </li>
          </ul>
          <Text className="auth-brand-copyright">© 南鲸商城 · 紫金品牌设计</Text>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-form-logo">
            <span className="auth-form-logo-mark">鲸</span>
          </div>
          <div className="auth-form-header">
            <Title level={3} className="auth-form-title">
              {title}
            </Title>
            {subtitle && (
              <Text type="secondary" className="auth-form-subtitle">
                {subtitle}
              </Text>
            )}
          </div>
          {children}
        </div>
        <Text type="secondary" className="auth-footer-note">
          © 南鲸商城 · 支持顾客 / 门店 / 管理员多角色登录
        </Text>
      </div>
    </div>
  );
}

export default AuthLayout;
