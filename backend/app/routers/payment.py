"""
畅点餐 - 支付路由（完整版）
对接微信支付: 统一下单、回调通知、订单查询、退款
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app import models, schemas
from app.utils.wxpay import wxpay
from app.auth import get_optional_user

router = APIRouter()


@router.post("/unified-order", response_model=schemas.ResponseModel)
async def unified_order(
    data: schemas.UnifiedOrderRequest,
    db: Session = Depends(get_db),
    user=Depends(get_optional_user),
):
    """
    统一下单接口
    
    流程:
    1. 创建支付订单
    2. 调用微信支付统一下单API
    3. 返回 prepay_id 和前端调起支付参数
    """
    # 获取订单
    order = db.query(models.Order).filter(models.Order.order_no == data.order_no).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    if order.pay_status == "paid":
        raise HTTPException(status_code=400, detail="订单已支付")
    
    # 构建商品描述
    item_names = [item.dish_name for item in order.items[:3]]
    body = f"畅点餐-{','.join(item_names)}"[:127]  # 微信限制128字符
    
    # 金额转换为分
    total_fee = int(order.pay_amount * 100)
    
    # 用户 openid（需要前端传入或通过登录获取）
    openid = data.openid if hasattr(data, 'openid') and data.openid else (user.openid if user and user.openid else "")
    if not openid:
        # 如果没有 openid，使用模拟支付模式（开发测试用）
        return await _mock_payment(order, db)
    
    try:
        # 调用微信支付统一下单
        result = await wxpay.unified_order(
            body=body,
            out_trade_no=order.order_no,
            total_fee=total_fee,
            spbill_create_ip="127.0.0.1",  # 实际应从请求中获取
            openid=openid,
            trade_type="JSAPI",
            attach=str(order.id),
        )
        
        if result.get("return_code") == "SUCCESS" and result.get("result_code") == "SUCCESS":
            # 保存支付记录
            payment = models.Payment(
                order_no=order.order_no,
                user_id=order.user_id,
                amount=order.pay_amount,
                pay_type="wechat",
                status="pending",
            )
            db.add(payment)
            db.commit()
            
            return {
                "code": 200,
                "message": "统一下单成功",
                "data": {
                    "order_no": order.order_no,
                    "pay_params": result.get("pay_params"),  # 前端调起支付所需参数
                    "prepay_id": result.get("prepay_id"),
                }
            }
        else:
            error_msg = result.get("err_code_des", result.get("return_msg", "下单失败"))
            raise HTTPException(status_code=400, detail=error_msg)
            
    except Exception as e:
        # 如果微信支付接口调用失败（比如未配置真实密钥），回退到模拟支付
        import os
        if os.environ.get("WXPAY_MCHID") == "1234567890":
            return await _mock_payment(order, db)
        raise HTTPException(status_code=500, detail=str(e))


async def _mock_payment(order: models.Order, db: Session):
    """模拟支付（开发测试用）"""
    import random, string
    
    payment = models.Payment(
        order_no=order.order_no,
        transaction_id=f"MOCK{''.join(random.choices(string.digits, k=12))}",
        user_id=order.user_id,
        amount=order.pay_amount,
        pay_type="wechat",
        status="pending",
    )
    db.add(payment)
    db.commit()
    
    # 生成模拟支付参数
    timestamp = str(int(datetime.now().timestamp()))
    nonce_str = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
    
    return {
        "code": 200,
        "message": "模拟支付模式（开发测试）",
        "data": {
            "order_no": order.order_no,
            "mock_mode": True,
            "pay_params": {
                "appId": wxpay.appid,
                "timeStamp": timestamp,
                "nonceStr": nonce_str,
                "package": f"prepay_id=mock{order.id}",
                "signType": "MD5",
                "paySign": "MOCK_SIGNATURE",
            },
            "prepay_id": f"mock{order.id}",
        }
    }


@router.post("/notify", response_model=schemas.ResponseModel)
async def payment_notify(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    微信支付回调通知
    
    微信会在用户支付成功后，向 notify_url 发送 POST 请求（XML格式）
    必须返回 XML 格式的响应
    """
    xml_body = await request.body()
    xml_str = xml_body.decode('utf-8')
    
    # 处理回调
    success, result = wxpay.process_notify(xml_str)
    
    if not success:
        return {
            "code": 400,
            "message": result.get("message", "处理失败"),
            "data": None,
        }
    
    # 更新订单状态
    order_no = result["out_trade_no"]
    order = db.query(models.Order).filter(models.Order.order_no == order_no).first()
    
    if order:
        # 更新订单
        order.pay_status = "paid"
        order.status = "preparing"
        order.pay_time = datetime.strptime(result["time_end"], "%Y%m%d%H%M%S") if result.get("time_end") else datetime.now()
        
        # 更新支付记录
        payment = db.query(models.Payment).filter(models.Payment.order_no == order_no).first()
        if payment:
            payment.transaction_id = result["transaction_id"]
            payment.status = "success"
            payment.paid_at = datetime.now()
        
        db.commit()
    
    # 返回成功响应（微信要求返回 XML）
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(
        content=wxpay.generate_notify_response(True),
        media_type="application/xml"
    )


@router.get("/status/{order_no}", response_model=schemas.ResponseModel)
async def query_payment_status(
    order_no: str,
    db: Session = Depends(get_db),
):
    """查询支付状态"""
    order = db.query(models.Order).filter(models.Order.order_no == order_no).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    # 如果订单已支付，直接返回
    if order.pay_status == "paid":
        return {
            "code": 200,
            "message": "success",
            "data": {
                "order_no": order_no,
                "pay_status": "paid",
                "pay_time": order.pay_time.isoformat() if order.pay_time else None,
            }
        }
    
    # 如果未支付，尝试查询微信支付状态
    try:
        result = await wxpay.query_order(out_trade_no=order_no)
        if result.get("trade_state") == "SUCCESS":
            # 更新为已支付
            order.pay_status = "paid"
            order.status = "preparing"
            order.pay_time = datetime.now()
            
            payment = db.query(models.Payment).filter(models.Payment.order_no == order_no).first()
            if payment:
                payment.status = "success"
                payment.paid_at = datetime.now()
            
            db.commit()
            
            return {
                "code": 200,
                "message": "success",
                "data": {
                    "order_no": order_no,
                    "pay_status": "paid",
                    "pay_time": order.pay_time.isoformat() if order.pay_time else None,
                }
            }
    except Exception:
        pass
    
    return {
        "code": 200,
        "message": "success",
        "data": {
            "order_no": order_no,
            "pay_status": order.pay_status,
        }
    }


@router.post("/refund", response_model=schemas.ResponseModel)
async def refund_payment(
    order_no: str,
    refund_amount: float,
    reason: str = "",
    db: Session = Depends(get_db),
):
    """申请退款"""
    order = db.query(models.Order).filter(models.Order.order_no == order_no).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    if order.pay_status != "paid":
        raise HTTPException(status_code=400, detail="订单未支付，无法退款")
    
    payment = db.query(models.Payment).filter(models.Payment.order_no == order_no).first()
    if not payment:
        raise HTTPException(status_code=404, detail="支付记录不存在")
    
    # 生成退款单号
    refund_no = f"RF{datetime.now().strftime('%Y%m%d%H%M%S')}{order.id}"
    
    try:
        result = await wxpay.refund(
            out_trade_no=order_no,
            out_refund_no=refund_no,
            total_fee=int(order.pay_amount * 100),
            refund_fee=int(refund_amount * 100),
            refund_desc=reason or "用户申请退款",
        )
        
        if result.get("return_code") == "SUCCESS" and result.get("result_code") == "SUCCESS":
            # 更新订单状态
            order.pay_status = "refunded"
            payment.status = "refunded"
            payment.refunded_at = datetime.now()
            db.commit()
            
            return {
                "code": 200,
                "message": "退款申请成功",
                "data": {
                    "order_no": order_no,
                    "refund_no": refund_no,
                    "refund_amount": refund_amount,
                }
            }
        else:
            error_msg = result.get("err_code_des", "退款失败")
            raise HTTPException(status_code=400, detail=error_msg)
            
    except Exception as e:
        # 如果退款接口调用失败，回退到模拟退款
        import os
        if os.environ.get("WXPAY_MCHID") == "1234567890":
            order.pay_status = "refunded"
            payment.status = "refunded"
            payment.refunded_at = datetime.now()
            db.commit()
            
            return {
                "code": 200,
                "message": "模拟退款成功（开发测试模式）",
                "data": {
                    "order_no": order_no,
                    "refund_no": refund_no,
                    "refund_amount": refund_amount,
                    "mock_mode": True,
                }
            }
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/close/{order_no}", response_model=schemas.ResponseModel)
async def close_payment(
    order_no: str,
    db: Session = Depends(get_db),
):
    """关闭未支付订单"""
    order = db.query(models.Order).filter(models.Order.order_no == order_no).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    if order.pay_status == "paid":
        raise HTTPException(status_code=400, detail="订单已支付，无法关闭")
    
    try:
        result = await wxpay.close_order(order_no)
        if result.get("return_code") == "SUCCESS":
            order.status = "cancelled"
            db.commit()
            return {"code": 200, "message": "订单已关闭", "data": {"order_no": order_no}}
        else:
            raise HTTPException(status_code=400, detail=result.get("return_msg", "关闭失败"))
    except Exception as e:
        # 模拟模式
        order.status = "cancelled"
        db.commit()
        return {"code": 200, "message": "模拟关闭成功", "data": {"order_no": order_no, "mock_mode": True}}
