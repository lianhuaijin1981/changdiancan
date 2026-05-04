"""
畅点餐 - 微信支付模块（完整版）
支持: 统一下单(JSAPI/H5)、支付回调、订单查询、退款、签名生成

配置步骤:
1. 前往 https://pay.weixin.qq.com/ 注册商户号
2. 获取 APPID、商户号(mch_id)、API密钥(APIv2 key)、证书(apiclient_cert.pem/apiclient_key.pem)
3. 在商户后台设置支付授权目录和回调URL
4. 将配置填入 backend/.env 文件

.env 示例:
WXPAY_APPID=wxd678efh567hg6787
WXPAY_MCHID=1234567890
WXPAY_KEY=your_api_v2_key_here
WXPAY_NOTIFY_URL=https://yourdomain.com/api/payment/notify
WXPAY_CERT_PATH=./certs/apiclient_cert.pem
WXPAY_KEY_PATH=./certs/apiclient_key.pem
"""
import hashlib
import hmac
import time
import random
import string
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
import httpx
from app.config import get_settings

settings = get_settings()


class WxPay:
    """微信支付核心类"""

    def __init__(self):
        self.appid = settings.WXPAY_APPID
        self.mch_id = settings.WXPAY_MCHID
        self.key = settings.WXPAY_KEY
        self.notify_url = settings.WXPAY_NOTIFY_URL
        self.cert_path = getattr(settings, 'WXPAY_CERT_PATH', None)
        self.key_path = getattr(settings, 'WXPAY_KEY_PATH', None)
        self.api_base = "https://api.mch.weixin.qq.com"

    # ==================== 签名工具 ====================

    @staticmethod
    def generate_nonce_str(length: int = 32) -> str:
        """生成随机字符串"""
        chars = string.ascii_letters + string.digits
        return ''.join(random.choice(chars) for _ in range(length))

    def generate_sign(self, params: Dict[str, Any], sign_type: str = "MD5") -> str:
        """生成微信支付签名
        
        Args:
            params: 参数字典（不含sign）
            sign_type: MD5 或 HMAC-SHA256
        """
        # 1. 过滤空值，按ASCII排序
        filtered = {k: str(v) for k, v in params.items() if v is not None and v != '' and k != 'sign'}
        sorted_params = sorted(filtered.items())
        
        # 2. 拼接成 URL 参数格式
        string_a = '&'.join([f"{k}={v}" for k, v in sorted_params])
        
        # 3. 拼接 API 密钥
        string_sign_temp = f"{string_a}&key={self.key}"
        
        # 4. 加密
        if sign_type == "HMAC-SHA256":
            sign = hmac.new(self.key.encode(), string_sign_temp.encode(), hashlib.sha256).hexdigest().upper()
        else:
            sign = hashlib.md5(string_sign_temp.encode()).hexdigest().upper()
        
        return sign

    def verify_sign(self, params: Dict[str, Any]) -> bool:
        """验证微信支付回调签名"""
        received_sign = params.get('sign', '')
        if not received_sign:
            return False
        calculated_sign = self.generate_sign(params)
        return received_sign == calculated_sign

    # ==================== XML 工具 ====================

    @staticmethod
    def dict_to_xml(data: Dict[str, Any]) -> str:
        """字典转 XML"""
        xml_parts = ['<xml>']
        for key, val in data.items():
            if val is not None:
                xml_parts.append(f"<{key}>{val}</{key}>")
        xml_parts.append('</xml>')
        return ''.join(xml_parts)

    @staticmethod
    def xml_to_dict(xml_str: str) -> Dict[str, Any]:
        """XML 转字典"""
        root = ET.fromstring(xml_str)
        result = {}
        for child in root:
            result[child.tag] = child.text
        return result

    # ==================== 统一下单 ====================

    async def unified_order(
        self,
        body: str,
        out_trade_no: str,
        total_fee: int,
        spbill_create_ip: str,
        openid: str,
        trade_type: str = "JSAPI",
        attach: str = "",
        time_expire: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        微信统一下单
        
        Args:
            body: 商品描述（如"畅点餐-红烧肉"）
            out_trade_no: 商户订单号（32字符内）
            total_fee: 订单总金额，单位分
            spbill_create_ip: 用户端IP
            openid: 用户openid（JSAPI支付必填）
            trade_type: JSAPI / NATIVE / APP / H5
            attach: 附加数据（原样返回）
            time_expire: 订单过期时间，格式：yyyyMMddHHmmss
            
        Returns:
            包含 prepay_id 和支付参数的字典
        """
        params = {
            "appid": self.appid,
            "mch_id": self.mch_id,
            "nonce_str": self.generate_nonce_str(),
            "body": body,
            "out_trade_no": out_trade_no,
            "total_fee": total_fee,
            "spbill_create_ip": spbill_create_ip,
            "notify_url": self.notify_url,
            "trade_type": trade_type,
            "openid": openid,
        }
        if attach:
            params["attach"] = attach
        if time_expire:
            params["time_expire"] = time_expire

        # 生成签名
        params["sign"] = self.generate_sign(params)
        
        # 发送请求
        xml_data = self.dict_to_xml(params)
        url = f"{self.api_base}/pay/unifiedorder"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, content=xml_data, headers={"Content-Type": "application/xml"})
        
        result = self.xml_to_dict(response.text)
        
        # 验证返回签名
        if result.get("return_code") == "SUCCESS":
            if not self.verify_sign(result):
                raise Exception("微信支付返回签名验证失败")
        
        # 生成前端支付参数（JSAPI）
        if result.get("return_code") == "SUCCESS" and result.get("result_code") == "SUCCESS":
            prepay_id = result.get("prepay_id", "")
            pay_params = self._generate_jsapi_params(prepay_id)
            result["pay_params"] = pay_params
        
        return result

    def _generate_jsapi_params(self, prepay_id: str) -> Dict[str, str]:
        """生成前端 JSAPI 调起支付所需的参数"""
        timestamp = str(int(time.time()))
        nonce_str = self.generate_nonce_str()
        package = f"prepay_id={prepay_id}"
        
        params = {
            "appId": self.appid,
            "timeStamp": timestamp,
            "nonceStr": nonce_str,
            "package": package,
            "signType": "MD5",
        }
        
        # 生成 paySign
        pay_sign = self.generate_sign(params)
        params["paySign"] = pay_sign
        
        return params

    # ==================== 支付回调处理 ====================

    def process_notify(self, xml_body: str) -> Tuple[bool, Dict[str, Any]]:
        """
        处理微信支付回调通知
        
        Args:
            xml_body: 微信发送的 XML 数据
            
        Returns:
            (success: bool, data: dict)
        """
        data = self.xml_to_dict(xml_body)
        
        # 1. 验证返回状态
        if data.get("return_code") != "SUCCESS":
            return False, {"message": data.get("return_msg", "通信失败")}
        
        # 2. 验证签名
        if not self.verify_sign(data):
            return False, {"message": "签名验证失败"}
        
        # 3. 验证业务结果
        if data.get("result_code") != "SUCCESS":
            return False, {"message": data.get("err_code_des", "业务失败")}
        
        # 4. 提取关键信息
        result = {
            "out_trade_no": data.get("out_trade_no"),  # 商户订单号
            "transaction_id": data.get("transaction_id"),   # 微信支付订单号
            "total_fee": int(data.get("total_fee", 0)),    # 订单金额（分）
            "time_end": data.get("time_end"),               # 支付完成时间
            "openid": data.get("openid"),                  # 用户openid
            "attach": data.get("attach", ""),                # 附加数据
        }
        
        return True, result

    @staticmethod
    def generate_notify_response(success: bool, message: str = "") -> str:
        """生成回调响应 XML"""
        if success:
            return "<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>"
        else:
            return f"<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[{message}]]></return_msg></xml>"

    # ==================== 订单查询 ====================

    async def query_order(self, out_trade_no: Optional[str] = None, transaction_id: Optional[str] = None) -> Dict[str, Any]:
        """
        查询订单支付状态
        
        Args:
            out_trade_no: 商户订单号
            transaction_id: 微信订单号（二选一）
        """
        if not out_trade_no and not transaction_id:
            raise ValueError("out_trade_no 和 transaction_id 至少提供一个")
        
        params = {
            "appid": self.appid,
            "mch_id": self.mch_id,
            "nonce_str": self.generate_nonce_str(),
        }
        if out_trade_no:
            params["out_trade_no"] = out_trade_no
        if transaction_id:
            params["transaction_id"] = transaction_id
        
        params["sign"] = self.generate_sign(params)
        
        xml_data = self.dict_to_xml(params)
        url = f"{self.api_base}/pay/orderquery"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, content=xml_data, headers={"Content-Type": "application/xml"})
        
        return self.xml_to_dict(response.text)

    # ==================== 退款 ====================

    async def refund(
        self,
        out_trade_no: Optional[str] = None,
        transaction_id: Optional[str] = None,
        out_refund_no: str = "",
        total_fee: int = 0,
        refund_fee: int = 0,
        refund_desc: str = "",
    ) -> Dict[str, Any]:
        """
        申请退款
        
        Args:
            out_trade_no: 商户订单号
            transaction_id: 微信订单号
            out_refund_no: 商户退款单号
            total_fee: 订单总金额（分）
            refund_fee: 退款金额（分）
            refund_desc: 退款原因
        """
        if not self.cert_path or not self.key_path:
            raise Exception("退款需要商户证书，请先配置证书路径")
        
        params = {
            "appid": self.appid,
            "mch_id": self.mch_id,
            "nonce_str": self.generate_nonce_str(),
            "out_refund_no": out_refund_no,
            "total_fee": total_fee,
            "refund_fee": refund_fee,
            "refund_desc": refund_desc,
        }
        if out_trade_no:
            params["out_trade_no"] = out_trade_no
        if transaction_id:
            params["transaction_id"] = transaction_id
        
        params["sign"] = self.generate_sign(params)
        
        xml_data = self.dict_to_xml(params)
        url = f"{self.api_base}/secapi/pay/refund"
        
        # 退款需要双向证书认证
        import ssl
        context = ssl.create_default_context()
        
        async with httpx.AsyncClient(cert=(self.cert_path, self.key_path), verify=context) as client:
            response = await client.post(url, content=xml_data, headers={"Content-Type": "application/xml"})
        
        return self.xml_to_dict(response.text)

    # ==================== 关单 ====================

    async def close_order(self, out_trade_no: str) -> Dict[str, Any]:
        """关闭订单（未支付订单）"""
        params = {
            "appid": self.appid,
            "mch_id": self.mch_id,
            "out_trade_no": out_trade_no,
            "nonce_str": self.generate_nonce_str(),
        }
        params["sign"] = self.generate_sign(params)
        
        xml_data = self.dict_to_xml(params)
        url = f"{self.api_base}/pay/closeorder"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, content=xml_data, headers={"Content-Type": "application/xml"})
        
        return self.xml_to_dict(response.text)


# 全局实例
wxpay = WxPay()
