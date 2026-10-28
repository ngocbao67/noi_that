"""
================================================================================
ĐỒ ÁN ĐIỆN TOÁN ĐÁM MÂY: HOMEDECOR SHOP E-COMMERCE
BACKEND PYTHON WORKERS FOR CLOUDFLARE
FILE: worker/entry.py
================================================================================
Entrypoint xử lý toàn bộ các yêu cầu REST API /api/*
Kết nối với cơ sở dữ liệu Cloudflare D1 (SQLite) thông qua env.DB
Phục vụ file tĩnh frontend đã build thông qua env.ASSETS
"""

import json
import hashlib
import hmac
import time
from urllib.parse import urlparse, parse_qs

# Hỗ trợ Response & Headers chuẩn Web API trong môi trường Cloudflare Python Workers
from js import Response, Headers, Request


def to_py_obj(obj):
    """Chuyển đổi JsProxy từ Pyodide sang Python dict/list tiêu chuẩn."""
    if obj is None:
        return None
    if hasattr(obj, "to_py"):
        try:
            return obj.to_py()
        except Exception:
            return obj
    return obj


async def db_all(stmt):
    """Truy vấn danh sách bản ghi từ Cloudflare D1 và chuẩn hóa thành Python list[dict]."""
    res = await stmt.all()
    py_data = to_py_obj(res)
    if isinstance(py_data, dict):
        return py_data.get("results", [])
    if isinstance(py_data, list):
        return py_data
    return []


async def db_first(stmt):
    """Truy vấn một bản ghi đầu tiên từ Cloudflare D1 và chuẩn hóa thành Python dict."""
    res = await stmt.first()
    return to_py_obj(res)


def json_response(data, status=200):
    """Tạo đối tượng Response trả về JSON kèm CORS headers an toàn."""
    headers = Headers.new()
    headers.set("Content-Type", "application/json; charset=utf-8")
    headers.set("Access-Control-Allow-Origin", "*")
    headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    
    clean_data = to_py_obj(data)
    json_str = json.dumps(clean_data, ensure_ascii=False)
    return Response.new(json_str, status=status, headers=headers)


def error_response(message, status=400):
    """Trả về phản hồi lỗi thống nhất."""
    return json_response({"success": False, "error": message}, status=status)


def hash_password(password: str) -> str:
    """Băm mật khẩu an toàn sử dụng HMAC-SHA256 kèm salt cố định cho đồ án."""
    salt = b"homedecor_cloudflare_d1_salt_2026"
    return hmac.new(salt, password.encode("utf-8"), hashlib.sha256).hexdigest()


async def parse_body(request):
    """Đọc JSON body từ request Web API một cách an toàn."""
    try:
        text = await request.text()
        if not text:
            return {}
        return json.loads(text)
    except Exception:
        return {}


async def get_current_user(request, env):
    """Trích xuất và xác thực người dùng từ session token trong header Authorization hoặc Cookie."""
    auth_header = request.headers.get("Authorization")
    token = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
    
    if not token:
        cookie_header = request.headers.get("Cookie")
        if cookie_header:
            cookies = dict(c.strip().split("=", 1) for c in cookie_header.split(";") if "=" in c)
            token = cookies.get("homedecor_session")

    if not token:
        return None

    # Truy vấn phiên đăng nhập từ D1
    res = await db_first(env.DB.prepare(
        "SELECT u.id, u.name, u.email, u.role, u.phone, u.address, u.city "
        "FROM user_sessions s "
        "JOIN users u ON s.user_id = u.id "
        "WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')"
    ).bind(token))

    return res


async def on_fetch(request, env):
    """
    Handler chính của Cloudflare Python Workers.
    Tiếp nhận HTTP request từ Edge Anycast, định tuyến theo Path và Method.
    """
    try:
        url = urlparse(request.url)
        path = url.path.rstrip("/")
        method = request.method.upper()

        # Xử lý CORS preflight OPTIONS
        if method == "OPTIONS":
            headers = Headers.new()
            headers.set("Access-Control-Allow-Origin", "*")
            headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
            headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
            return Response.new("", status=204, headers=headers)

        # 1. KIỂM TRA SỨC KHỎE HỆ THỐNG (HEALTH CHECK)
        if path == "/api/health" and method == "GET":
            return json_response({
                "status": "healthy",
                "runtime": "Cloudflare Python Workers",
                "database": "Cloudflare D1 (SQLite)",
                "timestamp": int(time.time()),
                "project": "HomeDecor Shop - Đồ án môn Điện toán đám mây"
            })

        # =========================================================================
        # PUBLIC CATALOG APIS (SẢN PHẨM & DANH MỤC)
        # =========================================================================

        # GET /api/categories
        if path == "/api/categories" and method == "GET":
            cats = await db_all(env.DB.prepare(
                "SELECT id, name, slug, description, image_url as imageUrl, is_active as isActive "
                "FROM categories WHERE is_active = 1 ORDER BY name ASC"
            ))
            return json_response(cats)

        # GET /api/products
        if path == "/api/products" and method == "GET":
            query_params = parse_qs(url.query)
            cat_slug = query_params.get("category", [None])[0]
            search_q = query_params.get("q", [None])[0]
            min_price = query_params.get("minPrice", [None])[0]
            max_price = query_params.get("maxPrice", [None])[0]
            sort_by = query_params.get("sort", ["newest"])[0]
            page = int(query_params.get("page", ["1"])[0])
            limit = int(query_params.get("limit", ["12"])[0])
            offset = (page - 1) * limit

            sql = (
                "SELECT p.id, p.name, p.slug, p.category_id as categoryId, c.name as categoryName, "
                "p.price, p.original_price as originalPrice, p.stock, p.thumbnail, p.description, "
                "p.material, p.dimensions, p.is_featured as isFeatured, p.is_new_arrival as isNewArrival, "
                "p.is_active as isActive, p.rating, p.review_count as reviewCount, p.created_at as createdAt "
                "FROM products p "
                "JOIN categories c ON p.category_id = c.id "
                "WHERE p.is_active = 1"
            )
            params = []

            if cat_slug:
                sql += " AND c.slug = ?"
                params.append(cat_slug)
            if search_q:
                sql += " AND (p.name LIKE ? OR p.description LIKE ?)"
                params.extend([f"%{search_q}%", f"%{search_q}%"])
            if min_price:
                sql += " AND p.price >= ?"
                params.append(int(min_price))
            if max_price:
                sql += " AND p.price <= ?"
                params.append(int(max_price))

            if sort_by == "price_asc":
                sql += " ORDER BY p.price ASC"
            elif sort_by == "price_desc":
                sql += " ORDER BY p.price DESC"
            elif sort_by == "name_asc":
                sql += " ORDER BY p.name ASC"
            else:
                sql += " ORDER BY p.created_at DESC"

            sql += " LIMIT ? OFFSET ?"
            params.extend([limit, offset])

            stmt = env.DB.prepare(sql).bind(*params)
            results = await db_all(stmt)

            # Đếm tổng sản phẩm cho phân trang
            total_stmt = await db_first(env.DB.prepare("SELECT COUNT(*) as count FROM products WHERE is_active = 1"))
            total_count = total_stmt.get("count", 0) if total_stmt else 0

            return json_response({
                "products": results,
                "total": total_count,
                "page": page,
                "limit": limit
            })

        # GET /api/products/{idOrSlug}
        if path.startswith("/api/products/") and method == "GET":
            prod_id = path.replace("/api/products/", "").strip()
            item = await db_first(env.DB.prepare(
                "SELECT p.id, p.name, p.slug, p.category_id as categoryId, c.name as categoryName, "
                "p.price, p.original_price as originalPrice, p.stock, p.thumbnail, p.description, "
                "p.material, p.dimensions, p.is_featured as isFeatured, p.is_new_arrival as isNewArrival, "
                "p.is_active as isActive, p.rating, p.review_count as reviewCount, p.created_at as createdAt "
                "FROM products p "
                "JOIN categories c ON p.category_id = c.id "
                "WHERE (p.id = ? OR p.slug = ?) AND p.is_active = 1"
            ).bind(prod_id, prod_id))

            if not item:
                return error_response("Không tìm thấy sản phẩm", 404)
            
            # Lấy thêm các ảnh phụ trong bảng product_images
            imgs = await db_all(env.DB.prepare(
                "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC"
            ).bind(item.get("id")))
            img_list = [i.get("image_url") for i in imgs if i.get("image_url")]
            if not img_list and item.get("thumbnail"):
                img_list = [item.get("thumbnail")]
            item["images"] = img_list

            return json_response(item)

        # =========================================================================
        # AUTHENTICATION APIS (ĐĂNG KÝ, ĐĂNG NHẬP, PHIÊN)
        # =========================================================================

        # POST /api/auth/register
        if path == "/api/auth/register" and method == "POST":
            body = await parse_body(request)
            name = body.get("name", "").strip()
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            phone = body.get("phone", "").strip()
            address = body.get("address", "").strip()
            city = body.get("city", "Hà Nội").strip()

            if not name or not email or not password:
                return error_response("Vui lòng điền đầy đủ họ tên, email và mật khẩu", 400)
            if len(password) < 6:
                return error_response("Mật khẩu phải từ 6 ký tự trở lên", 400)

            # Kiểm tra trùng email
            existing = await db_first(env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email))
            if existing:
                return error_response("Email này đã được đăng ký", 409)

            user_id = f"user-{int(time.time() * 1000)}"
            pwd_hash = hash_password(password)

            await env.DB.prepare(
                "INSERT INTO users (id, name, email, password_hash, role, phone, address, city) "
                "VALUES (?, ?, ?, ?, 'customer', ?, ?, ?)"
            ).bind(user_id, name, email, pwd_hash, phone, address, city).run()

            # Tạo phiên đăng nhập tự động
            token = f"tok-{hashlib.sha256(f'{user_id}{time.time()}'.encode()).hexdigest()[:32]}"
            await env.DB.prepare(
                "INSERT INTO user_sessions (token, user_id, expires_at) "
                "VALUES (?, ?, datetime('now', '+30 days'))"
            ).bind(token, user_id).run()

            user_data = {
                "id": user_id,
                "name": name,
                "email": email,
                "role": "customer",
                "phone": phone,
                "address": address,
                "city": city,
                "token": token
            }
            return json_response(user_data, 201)

        # POST /api/auth/login
        if path == "/api/auth/login" and method == "POST":
            body = await parse_body(request)
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")

            if not email or not password:
                return error_response("Vui lòng nhập email và mật khẩu", 400)

            user = await db_first(env.DB.prepare(
                "SELECT id, name, email, password_hash, role, phone, address, city "
                "FROM users WHERE email = ?"
            ).bind(email))

            if not user or user.get("password_hash") != hash_password(password):
                return error_response("Email hoặc mật khẩu không chính xác", 401)

            uid = str(user.get("id"))
            token = f"tok-{hashlib.sha256(f'{uid}{time.time()}'.encode()).hexdigest()[:32]}"
            await env.DB.prepare(
                "INSERT INTO user_sessions (token, user_id, expires_at) "
                "VALUES (?, ?, datetime('now', '+30 days'))"
            ).bind(token, uid).run()

            user_data = {
                "id": user.get("id"),
                "name": user.get("name"),
                "email": user.get("email"),
                "role": user.get("role"),
                "phone": user.get("phone"),
                "address": user.get("address"),
                "city": user.get("city"),
                "token": token
            }
            return json_response(user_data)

        # GET /api/auth/me
        if path == "/api/auth/me" and method == "GET":
            current_user = await get_current_user(request, env)
            if not current_user:
                return error_response("Chưa đăng nhập hoặc phiên đã hết hạn", 401)
            return json_response(current_user)

        # POST /api/auth/logout
        if path == "/api/auth/logout" and method == "POST":
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header[7:].strip()
                await env.DB.prepare("DELETE FROM user_sessions WHERE token = ?").bind(token).run()
            return json_response({"success": True})

        # =========================================================================
        # ORDERS APIS (ĐẶT HÀNG & LỊCH SỬ ĐƠN HÀNG)
        # =========================================================================

        # POST /api/orders (Tạo đơn hàng kèm xác thực tồn kho & tính tiền từ Database)
        if path == "/api/orders" and method == "POST":
            body = await parse_body(request)
            customer_name = body.get("customerName", "").strip()
            customer_phone = body.get("customerPhone", "").strip()
            customer_email = body.get("customerEmail", "").strip()
            shipping_address = body.get("shippingAddress", "").strip()
            shipping_city = body.get("shippingCity", "").strip()
            notes = body.get("notes", "").strip()
            payment_method = body.get("paymentMethod", "cod")
            items = body.get("items", [])

            if not items:
                return error_response("Giỏ hàng của bạn đang trống", 400)
            if not customer_name or not customer_phone or not shipping_address or not shipping_city:
                return error_response("Vui lòng điền đầy đủ họ tên, điện thoại và địa chỉ giao hàng", 400)

            current_user = await get_current_user(request, env)
            user_id = current_user.get("id") if current_user else "guest-user"

            # Kiểm tra tồn kho & tính tiền lại từ cơ sở dữ liệu D1
            subtotal = 0
            verified_items = []

            for item in items:
                prod_id = item.get("productId")
                qty = int(item.get("quantity", 1))

                prod = await db_first(env.DB.prepare(
                    "SELECT id, name, price, stock, thumbnail FROM products WHERE id = ? AND is_active = 1"
                ).bind(prod_id))

                if not prod:
                    return error_response(f"Sản phẩm {prod_id} không tồn tại hoặc đã ngừng kinh doanh", 400)
                if int(prod.get("stock", 0)) < qty:
                    return error_response(f"Sản phẩm '{prod.get('name')}' chỉ còn {prod.get('stock')} chiếc trong kho", 400)

                line_total = int(prod.get("price", 0)) * qty
                subtotal += line_total
                verified_items.append({
                    "product_id": prod.get("id"),
                    "product_name": prod.get("name"),
                    "product_image": prod.get("thumbnail"),
                    "price": prod.get("price"),
                    "quantity": qty,
                    "total": line_total
                })

            # Phí giao hàng: Đơn >= 3.000.000 ₫ miễn phí, ngược lại 150.000 ₫
            shipping_fee = 0 if subtotal >= 3000000 else 150000
            discount = 0
            total_order = subtotal + shipping_fee - discount

            order_id = f"ord-{int(time.time() * 1000)}"
            order_code = f"HD{time.strftime('%y%m%d')}-{hashlib.md5(order_id.encode()).hexdigest()[:4].upper()}"

            # 1. Trừ tồn kho sản phẩm trong D1
            for v_item in verified_items:
                await env.DB.prepare(
                    "UPDATE products SET stock = stock - ? WHERE id = ?"
                ).bind(v_item["quantity"], v_item["product_id"]).run()

            # 2. Lưu đơn hàng chính
            await env.DB.prepare(
                "INSERT INTO orders (id, code, user_id, customer_name, customer_phone, customer_email, "
                "shipping_address, shipping_city, notes, payment_method, payment_status, subtotal, "
                "shipping_fee, discount, total, status) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')"
            ).bind(
                order_id, order_code, user_id, customer_name, customer_phone, customer_email,
                shipping_address, shipping_city, notes, payment_method,
                "paid" if payment_method == "banking" else "unpaid",
                subtotal, shipping_fee, discount, total_order
            ).run()

            # 3. Lưu các dòng chi tiết đơn hàng (order_items)
            for v_item in verified_items:
                line_id = f"item-{int(time.time() * 1000)}-{v_item['product_id']}"
                await env.DB.prepare(
                    "INSERT INTO order_items (id, order_id, product_id, product_name, product_image, price, quantity, total) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                ).bind(
                    line_id, order_id, v_item["product_id"], v_item["product_name"],
                    v_item["product_image"], v_item["price"], v_item["quantity"], v_item["total"]
                ).run()

            return json_response({
                "id": order_id,
                "code": order_code,
                "total": total_order,
                "status": "pending",
                "message": "Đặt hàng thành công!"
            }, 201)

        # GET /api/orders (Lấy danh sách đơn của tài khoản đang đăng nhập)
        if path == "/api/orders" and method == "GET":
            current_user = await get_current_user(request, env)
            if not current_user:
                return error_response("Vui lòng đăng nhập để xem đơn hàng", 401)

            orders = await db_all(env.DB.prepare(
                "SELECT id, code, customer_name as customerName, customer_phone as customerPhone, "
                "shipping_address as shippingAddress, shipping_city as shippingCity, total, status, created_at as createdAt "
                "FROM orders WHERE user_id = ? ORDER BY created_at DESC"
            ).bind(current_user.get("id")))

            return json_response(orders)

        # =========================================================================
        # ADMIN APIS (QUẢN TRỊ VIÊN HỆ THỐNG)
        # =========================================================================
        if path.startswith("/api/admin"):
            current_user = await get_current_user(request, env)
            if not current_user or current_user.get("role") != "admin":
                return error_response("Từ chối truy cập: Yêu cầu quyền Quản trị viên (Admin)", 403)

            if path == "/api/admin/stats" and method == "GET":
                revenue_stmt = await db_first(env.DB.prepare(
                    "SELECT SUM(total) as revenue FROM orders WHERE status != 'cancelled'"
                ))
                total_orders = await db_first(env.DB.prepare("SELECT COUNT(*) as count FROM orders"))
                total_products = await db_first(env.DB.prepare("SELECT COUNT(*) as count FROM products"))
                total_users = await db_first(env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'"))
                pending_orders = await db_first(env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"))

                recent = await db_all(env.DB.prepare(
                    "SELECT id, code, customer_name as customerName, customer_phone as customerPhone, "
                    "total, payment_method as paymentMethod, status, created_at as createdAt "
                    "FROM orders ORDER BY created_at DESC LIMIT 5"
                ))

                return json_response({
                    "totalRevenue": revenue_stmt.get("revenue", 0) if revenue_stmt else 0,
                    "totalOrders": total_orders.get("count", 0) if total_orders else 0,
                    "totalProducts": total_products.get("count", 0) if total_products else 0,
                    "totalUsers": total_users.get("count", 0) if total_users else 0,
                    "pendingOrdersCount": pending_orders.get("count", 0) if pending_orders else 0,
                    "recentOrders": recent
                })

        # NẾU KHÔNG PHÙ HỢP ROUTE API NÀO, PHỤC VỤ STATIC ASSETS CỦA FRONTEND
        if hasattr(env, "ASSETS"):
            return await env.ASSETS.fetch(request)

        return error_response("Endpoint không tồn tại", 404)

    except Exception as exc:
        return error_response(f"Internal Worker Exception: {str(exc)}", 500)
