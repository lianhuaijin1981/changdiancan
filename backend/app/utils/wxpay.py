"""
畅点餐 - 微信支付模拟模块
模拟完整的微信支付流程：统一下单 -> 支付回调 -> 退款
"""
import time
import random
import hashlib
import string
from datetime import datetime
from typing import Dict, Any, Optional


class WxPaySimulator:
    """微信支付模拟器"""

    @staticmethod
    def generate_order_no() -> str:
        """生成商户订单号"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_str = "".join(random.choices(string.digits, k=6))
        return f"CD{timestamp}{random_str}"

    @staticmethod
    def generate_transaction_id() -> str:
        """生成微信交易流水号"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_str = "".join(random.choices(string.digits, k=10))
        return f"4200{timestamp}{random_str}"

    @staticmethod
    def generate_nonce_str(length: int = 32) -> str:
        """生成随机字符串"""
        return "".join(random.choices(string.ascii_letters + string.digits, k=length))

    @staticmethod
    def create_pay_params(order_no: str, amount: float, description: str = "畅点餐订单") -> Dict[str, Any]:
        """
        创建支付参数（模拟统一下单返回）
        实际项目中这里会调用微信API
        """
        nonce_str = WxPaySimulator.generate_nonce_str()
        prepay_id = f"wx{WxPaySimulator.generate_nonce_str(24)}"
        timestamp = str(int(time.time()))

        # 模拟微信支付参数
        pay_params = {
            "appId": "wxappid123456",
            "timeStamp": timestamp,
            "nonceStr": nonce_str,
            "package": f"prepay_id={prepay_id}",
            "signType": "RSA",
            "paySign": hashlib.sha256(
                f"{order_no}{amount}{timestamp}{nonce_str}".encode()
            ).hexdigest(),
        }

        return {
            "prepay_id": prepay_id,
            "order_no": order_no,
            "amount": amount,
            "description": description,
            "nonce_str": nonce_str,
            "timestamp": timestamp,
            "pay_params": pay_params,
            "status": "pending",
            "created_at": datetime.now().isoformat(),
        }

    @staticmethod
    def process_notify(notify_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        处理支付回调通知（模拟）
        实际项目中这里会验证微信签名
        """
        # 模拟验证签名
        order_no = notify_data.get("out_trade_no", "")
        transaction_id = notify_data.get("transaction_id", "")
        total_fee = notify_data.get("total_fee", 0)
        result_code = notify_data.get("result_code", "SUCCESS")

        if result_code == "SUCCESS":
            return {
                "order_no": order_no,
                "transaction_id": transaction_id,
                "amount": float(total_fee) / 100,  # 分转元
                "status": "success",
                "paid_at": datetime.now().isoformat(),
                "message": "支付成功",
            }
        else:
            return {
                "order_no": order_no,
                "status": "failed",
                "message": "支付失败",
            }

    @staticmethod
    def process_refund(order_no: str, refund_amount: float, reason: str = "") -> Dict[str, Any]:
        """处理退款申请（模拟）"""
        refund_no = f"RF{datetime.now().strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"

        return {
            "order_no": order_no,
            "refund_no": refund_no,
            "refund_amount": refund_amount,
            "reason": reason,
            "status": "success",
            "refunded_at": datetime.now().isoformat(),
            "message": "退款成功",
        }

    @staticmethod
    def query_order(order_no: str) -> Dict[str, Any]:
        """查询订单支付状态（模拟）"""
        # 模拟返回成功状态
        return {
            "order_no": order_no,
            "status": "success",
            "trade_state": "SUCCESS",
            "total_fee": 0,
            "paid_at": datetime.now().isoformat(),
        }


# 全局模拟器实例
wxpay_simulator = WxPaySimulator()
