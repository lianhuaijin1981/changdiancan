"""
畅点餐 - 云打印服务框架
支持: 易联云(YilianYun) / 飞鹅(Feie)
文档格式: 使用 ESC/POS 指令集的 HTML-like 标签
"""
import hashlib
import time
import json
import httpx
from typing import Optional, Dict, Any
from dataclasses import dataclass, field


@dataclass
class PrinterConfig:
    """打印机配置"""
    provider: str = "yilianyun"  # yilianyun / feie
    api_key: str = ""           # 应用ID / 用户ID
    api_secret: str = ""        # 应用密钥 / API密钥
    machine_code: str = ""      # 打印机编号
    # 可选: 易联云需要 access_token，支持自动获取
    access_token: Optional[str] = None
    token_expires_at: int = 0


@dataclass
class PrintTask:
    """打印任务"""
    content: str
    task_type: str = "order"    # order: 订单小票, kitchen: 后厨联, label: 标签
    copies: int = 1
    voice: bool = False          # 是否语音播报
    voice_msg: str = ""          # 语音内容
    qr_code: Optional[str] = None  # 二维码内容


class CloudPrinter:
    """
    云打印服务框架
    支持易联云(YilianYun)和飞鹅(Feie)两大主流云打印服务商
    """

    # 状态映射
    ORDER_TYPE_MAP = {
        "dine_in": "堂食",
        "takeaway": "自提",
        "delivery": "外卖",
    }

    ORDER_STATUS_MAP = {
        "pending": "待支付",
        "paid": "已支付",
        "preparing": "制作中",
        "ready": "待上菜",
        "served": "已上菜",
        "completed": "已完成",
        "cancelled": "已取消",
        "refunding": "退款中",
        "refunded": "已退款",
    }

    PAY_STATUS_MAP = {
        "unpaid": "未支付",
        "paid": "已支付",
        "refunded": "已退款",
    }

    PAY_TYPE_MAP = {
        "wechat": "微信支付",
        "balance": "余额支付",
        "": "未选择",
    }

    def __init__(self, api_key: str, api_secret: str, provider: str = "yilianyun"):
        self.config = PrinterConfig(
            provider=provider.lower().strip(),
            api_key=api_key,
            api_secret=api_secret,
        )
        self._http = httpx.AsyncClient(timeout=30.0)

    # ── 公共 API ────────────────────────────────────────────────

    async def print_order(self, order_data: dict, machine_code: str = "") -> dict:
        """打印订单小票（前台联）"""
        self.config.machine_code = machine_code or self.config.machine_code
        content = self._format_order_content(order_data)
        task = PrintTask(content=content, task_type="order", copies=1)
        return await self._submit_print(task)

    async def print_kitchen_ticket(self, order_data: dict, machine_code: str = "") -> dict:
        """打印后厨联（按分类分组）"""
        self.config.machine_code = machine_code or self.config.machine_code
        content = self._format_kitchen_content(order_data)
        task = PrintTask(content=content, task_type="kitchen", copies=1)
        return await self._submit_print(task)

    async def print_label(self, order_data: dict, machine_code: str = "") -> dict:
        """打印标签联（杯贴/包装贴）"""
        self.config.machine_code = machine_code or self.config.machine_code
        content = self._format_label_content(order_data)
        task = PrintTask(content=content, task_type="label", copies=1)
        return await self._submit_print(task)

    async def test_print(self, machine_code: str = "") -> dict:
        """测试打印连接"""
        self.config.machine_code = machine_code or self.config.machine_code
        content = (
            "<CB>畅点餐测试打印</CB>\n"
            "<C>================</C>\n"
            "<C>打印机连接正常</C>\n"
            "<C>打印服务运行中</C>\n"
            "<C>================</C>\n"
            f"<C>{time.strftime('%Y-%m-%d %H:%M:%S')}</C>\n"
            "<C>powered by 畅点餐</C>\n"
        )
        task = PrintTask(content=content, task_type="order", copies=1)
        return await self._submit_print(task)

    # ── 格式化模板 ──────────────────────────────────────────────

    def _format_order_content(self, order: dict) -> str:
        """格式化订单小票内容（前台联）"""
        lines = [
            "<CB>畅点餐</CB>",
            "<C>订单小票</C>",
            "----------------------------",
            f"订单号: {order.get('order_no', 'N/A')}",
            f"下单时间: {order.get('created_at', '')}",
            f"订单类型: {self.ORDER_TYPE_MAP.get(order.get('order_type'), order.get('order_type', ''))}",
            f"订单状态: {self.ORDER_STATUS_MAP.get(order.get('status'), order.get('status', ''))}",
            f"支付状态: {self.PAY_STATUS_MAP.get(order.get('pay_status'), order.get('pay_status', ''))}",
        ]

        # 桌号/配送信息
        table_no = order.get('table_no')
        if table_no:
            lines.append(f"桌号: {table_no}")

        delivery_address = order.get('delivery_address')
        if delivery_address:
            lines.append(f"配送地址: {delivery_address}")
            if order.get('delivery_name'):
                lines.append(f"收货人: {order['delivery_name']} {order.get('delivery_phone', '')}")

        lines.append("----------------------------")
        lines.append("<B>商品明细</B>")

        for item in order.get('items', []):
            specs = item.get('specs', {})
            spec_str = ""
            if specs:
                spec_str = "(" + ", ".join(f"{k}:{v}" for k, v in specs.items()) + ")"
            dish_line = f"{item['dish_name']}{spec_str}"
            # 对齐处理：名称在前，数量和金额在后
            qty_info = f"x{item['quantity']}"
            price_info = f"¥{item.get('subtotal', item.get('price', 0) * item.get('quantity', 1)):.2f}"
            lines.append(f"{dish_line}")
            lines.append(f"  {qty_info}  {price_info}")

        lines.extend([
            "----------------------------",
            f"<B>商品小计: ¥{order.get('total_amount', 0):.2f}</B>",
        ])

        discount = order.get('discount_amount', 0)
        if discount and discount > 0:
            lines.append(f"<B>优惠金额: -¥{discount:.2f}</B>")

        delivery_fee = order.get('delivery_fee', 0)
        if delivery_fee and delivery_fee > 0:
            lines.append(f"<B>配送费: +¥{delivery_fee:.2f}</B>")

        lines.extend([
            f"<B>实付金额: ¥{order.get('pay_amount', 0):.2f}</B>",
            f"支付方式: {self.PAY_TYPE_MAP.get(order.get('pay_type'), order.get('pay_type', ''))}",
        ])

        remark = order.get('remark', '')
        if remark:
            lines.append(f"备注: {remark}")

        lines.extend([
            "----------------------------",
            f"<QR>https://yourdomain.com/order/{order.get('order_no', '')}</QR>",
            "<C>感谢惠顾，欢迎再次光临</C>",
            f"<C>订单时间: {order.get('created_at', '')}</C>",
        ])

        return "\n".join(lines)

    def _format_kitchen_content(self, order: dict) -> str:
        """格式化后厨联内容（后厨制作单）"""
        lines = [
            "<CB>【后厨联】</CB>",
            "<B>----------------------------</B>",
        ]

        # 订单类型标识
        order_type = order.get('order_type', '')
        if order_type == "dine_in":
            table_no = order.get('table_no', '')
            lines.append(f"<CB>桌号: {table_no}</CB>")
        elif order_type == "delivery":
            lines.append(f"<CB>【外卖】</CB>")
        elif order_type == "takeaway":
            lines.append(f"<CB>【自提】</CB>")

        lines.extend([
            f"订单号: {order.get('order_no', 'N/A')}",
            f"下单时间: {order.get('created_at', '')}",
            "<B>----------------------------</B>",
            "<B>制作清单:</B>",
        ])

        for item in order.get('items', []):
            specs = item.get('specs', {})
            spec_str = ""
            if specs:
                spec_str = "(" + ", ".join(f"{k}:{v}" for k, v in specs.items()) + ")"
            lines.append(f"<B>{item['dish_name']}{spec_str} x{item['quantity']}</B>")

        lines.append("<B>----------------------------</B>")

        remark = order.get('remark', '')
        if remark:
            lines.append(f"<B>备注: {remark}</B>")
            lines.append("<B>----------------------------</B>")

        # 外卖需要显示配送信息
        if order_type == "delivery":
            lines.append(f"配送地址: {order.get('delivery_address', '')}")
            lines.append(f"联系人: {order.get('delivery_name', '')} {order.get('delivery_phone', '')}")
            lines.append("<B>----------------------------</B>")

        lines.append(f"订单号: {order.get('order_no', '')}")
        return "\n".join(lines)

    def _format_label_content(self, order: dict) -> str:
        """格式化标签联内容（杯贴/包装贴，用于饮品店等）"""
        lines = [
            "<CB>畅点餐</CB>",
        ]

        # 订单类型标识
        order_type = order.get('order_type', '')
        if order_type == "dine_in":
            table_no = order.get('table_no', '')
            lines.append(f"<CB>桌号 {table_no}</CB>")
        elif order_type == "takeaway":
            lines.append("<CB>【自提】</CB>")
        elif order_type == "delivery":
            lines.append("<CB>【外卖】</CB>")

        lines.extend([
            "----------------------------",
            f"订单号: {order.get('order_no', '')[-6:]}",  # 只显示后6位
        ])

        for item in order.get('items', []):
            specs = item.get('specs', {})
            spec_str = ""
            if specs:
                spec_str = " / ".join(f"{v}" for v in specs.values())
            lines.append(f"{item['dish_name']} x{item['quantity']}")
            if spec_str:
                lines.append(f"  ({spec_str})")

        remark = order.get('remark', '')
        if remark:
            lines.extend([
                "----------------------------",
                f"备注: {remark}",
            ])

        lines.append(f"----------------------------")
        lines.append(f"{order.get('created_at', '')}")
        return "\n".join(lines)

    # ── 内部方法: 提交打印 ───────────────────────────────────────

    async def _submit_print(self, task: PrintTask) -> dict:
        """提交打印任务到云打印服务商"""
        if not self.config.machine_code:
            return {
                "status": "error",
                "message": "未设置打印机编号(machine_code)",
                "provider": self.config.provider,
            }

        try:
            if self.config.provider == "yilianyun":
                return await self._submit_yilianyun(task)
            elif self.config.provider == "feie":
                return await self._submit_feie(task)
            else:
                return {
                    "status": "error",
                    "message": f"不支持的打印服务商: {self.config.provider}",
                }
        except httpx.HTTPError as e:
            return {
                "status": "error",
                "message": f"网络请求失败: {str(e)}",
                "provider": self.config.provider,
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"打印任务提交失败: {str(e)}",
                "provider": self.config.provider,
            }

    # ── 易联云(YilianYun) ───────────────────────────────────────

    async def _submit_yilianyun(self, task: PrintTask) -> dict:
        """提交打印任务到易联云"""
        access_token = await self._get_yilianyun_token()

        # 构建打印内容（URL encode 前处理）
        content = task.content
        if task.voice:
            content += f"\n<VB>{task.voice_msg or '您有新的订单，请查收'}</VB>"

        params = {
            "client_id": self.config.api_key,
            "access_token": access_token,
            "machine_code": self.config.machine_code,
            "content": content,
            "origin_id": f"CDC_{int(time.time() * 1000)}_{self.config.machine_code}",
        }

        response = await self._http.post(
            "https://open-api.10ss.net/print/index",
            data=params,
        )
        result = response.json()

        if result.get("error") == "0" or result.get("error") == 0:
            return {
                "status": "success",
                "message": "打印任务已提交",
                "provider": "yilianyun",
                "task_id": result.get("body", {}),
            }
        else:
            return {
                "status": "error",
                "message": f"易联云返回错误: {result.get('error_description', result.get('error', '未知错误'))}",
                "provider": "yilianyun",
                "raw_response": result,
            }

    async def _get_yilianyun_token(self) -> str:
        """获取易联云 access_token（带缓存）"""
        # 检查缓存的 token 是否有效
        if self.config.access_token and time.time() < self.config.token_expires_at:
            return self.config.access_token

        timestamp = str(int(time.time()))
        sign = hashlib.md5(
            f"{self.config.api_key}{timestamp}{self.config.api_secret}".encode()
        ).hexdigest()

        params = {
            "client_id": self.config.api_key,
            "grant_type": "client_credentials",
            "sign": sign,
            "scope": "all",
            "timestamp": timestamp,
            "id": f"uuid_{timestamp}",
        }

        response = await self._http.post(
            "https://open-api.10ss.net/oauth/oauth",
            data=params,
        )
        result = response.json()

        if result.get("error") == "0" or result.get("error") == 0:
            self.config.access_token = result["body"]["access_token"]
            # token 有效期7200秒，提前300秒刷新
            self.config.token_expires_at = int(time.time()) + 6900
            return self.config.access_token
        else:
            raise RuntimeError(f"获取易联云 access_token 失败: {result}")

    # ── 飞鹅(Feie) ──────────────────────────────────────────────

    async def _submit_feie(self, task: PrintTask) -> dict:
        """提交打印任务到飞鹅云"""
        stime = str(int(time.time()))
        sig = hashlib.sha1(
            f"{self.config.api_key}{self.config.api_secret}{stime}".encode()
        ).hexdigest()

        params = {
            "user": self.config.api_key,
            "stime": stime,
            "sig": sig,
            "apiname": "Open_printMsg",
            "sn": self.config.machine_code,
            "content": task.content,
            "times": str(task.copies),
        }

        response = await self._http.post(
            "https://api.feieyun.cn/Api/Open/",
            data=params,
        )
        result = response.json()

        if result.get("ret") == 0:
            return {
                "status": "success",
                "message": "打印任务已提交",
                "provider": "feie",
                "task_id": result.get("data"),
            }
        else:
            return {
                "status": "error",
                "message": f"飞鹅返回错误: {result.get('msg', '未知错误')}",
                "provider": "feie",
                "raw_response": result,
            }

    # ── 打印机管理 ────────────────────────────────────────────────

    async def query_printer_status(self, machine_code: str = "") -> dict:
        """查询打印机状态"""
        code = machine_code or self.config.machine_code
        if not code:
            return {"status": "error", "message": "未设置打印机编号"}

        try:
            if self.config.provider == "yilianyun":
                return await self._query_yilianyun_status(code)
            elif self.config.provider == "feie":
                return await self._query_feie_status(code)
            else:
                return {"status": "error", "message": f"不支持的打印服务商: {self.config.provider}"}
        except Exception as e:
            return {"status": "error", "message": f"查询失败: {str(e)}"}

    async def _query_yilianyun_status(self, machine_code: str) -> dict:
        """查询易联云打印机状态"""
        access_token = await self._get_yilianyun_token()
        params = {
            "client_id": self.config.api_key,
            "access_token": access_token,
            "machine_code": machine_code,
        }
        response = await self._http.post(
            "https://open-api.10ss.net/printer/getprintstatus",
            data=params,
        )
        result = response.json()
        return {"status": "success", "data": result, "provider": "yilianyun"}

    async def _query_feie_status(self, sn: str) -> dict:
        """查询飞鹅打印机状态"""
        stime = str(int(time.time()))
        sig = hashlib.sha1(
            f"{self.config.api_key}{self.config.api_secret}{stime}".encode()
        ).hexdigest()

        params = {
            "user": self.config.api_key,
            "stime": stime,
            "sig": sig,
            "apiname": "Open_queryPrinterStatus",
            "sn": sn,
        }
        response = await self._http.post(
            "https://api.feieyun.cn/Api/Open/",
            data=params,
        )
        result = response.json()

        if result.get("ret") == 0:
            return {"status": "success", "data": result.get("data"), "provider": "feie"}
        return {"status": "error", "message": result.get("msg", "查询失败"), "provider": "feie"}

    async def close(self):
        """关闭 HTTP 连接"""
        await self._http.aclose()

    # ── 同步包装（方便在非 async 环境使用）────────────────────────

    def print_order_sync(self, order_data: dict, machine_code: str = "") -> dict:
        """同步版本: 打印订单小票"""
        import asyncio
        return asyncio.run(self.print_order(order_data, machine_code))

    def print_kitchen_ticket_sync(self, order_data: dict, machine_code: str = "") -> dict:
        """同步版本: 打印后厨联"""
        import asyncio
        return asyncio.run(self.print_kitchen_ticket(order_data, machine_code))

    def test_print_sync(self, machine_code: str = "") -> dict:
        """同步版本: 测试打印"""
        import asyncio
        return asyncio.run(self.test_print(machine_code))


# ── 工厂函数 ────────────────────────────────────────────────────

def get_cloud_printer(
    api_key: str = "",
    api_secret: str = "",
    provider: str = "yilianyun",
) -> CloudPrinter:
    """创建云打印服务实例
    支持从环境变量读取配置
    """
    import os
    _key = api_key or os.getenv("CLOUD_PRINT_API_KEY", "")
    _secret = api_secret or os.getenv("CLOUD_PRINT_API_SECRET", "")
    _provider = provider or os.getenv("CLOUD_PRINT_PROVIDER", "yilianyun")
    return CloudPrinter(api_key=_key, api_secret=_secret, provider=_provider)
