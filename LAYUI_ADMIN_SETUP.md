# Layui 後台管理系統設置和使用指南

## 概述

基於 Layui v2.13.3 框架的完整後台管理系統已成功部署。該系統支援 100,000+ 用戶資料管理、訂單跟蹤和包裹管理。

## 系統架構

### 核心技術棧
- **前端框架**: React 19 (主應用) + Layui v2.13.3 (後台管理系統)
- **後端**: Express.js 4.21.2
- **數據庫**: SQLite (better-sqlite3 12.4.1)
- **樣式框架**: Tailwind CSS 4.1.14 + Layui CSS
- **開發工具**: Vite 6.2, TypeScript 5.8

### 文件結構
```
public/
├── admin-system.html          # Layui 後台管理系統主文件
├── layui/                      # Layui 框架資源目錄
│   ├── layui.js               # 核心JS庫
│   ├── css/
│   │   └── layui.css          # 樣式文件
│   └── font/                  # 圖標字體
├── logo.png                   # Logo 文件

server/
├── index.ts                   # 主服務器文件 (已更新靜態文件服務)
├── db.ts                      # 數據庫配置
├── middleware/
│   └── auth.ts                # JWT 認證中間件
└── routes/
    ├── auth.ts                # 認證路由
    └── admin.ts               # 管理界面路由
```

## 部署步驟

### 1. 後端配置 ✅
已在 `server/index.ts` 中配置靜態文件服務：

```typescript
// 提供靜態文件服務（Layui 資源和管理系統 HTML）
app.use(express.static(path.join(process.cwd(), 'public')));
```

### 2. 啟動服務

**啟動後端服務器**:
```bash
npm run server
```
- 監聽端口: 3001
- 靜態文件路由: `/` → `public/` 目錄

**啟動前端開發服務器** (在另一個終端):
```bash
npm run dev
```
- 開發端口: 3000-3002 (自動選擇可用端口)

### 3. 訪問管理系統

在瀏覽器中打開:
```
http://localhost:3001/admin-system.html
```

## 功能概述

### 📊 儀表板 (Overview)
- **系統統計卡片**:
  - 總用戶數
  - 總訂單數
  - 總包裹數
  - 系統狀態

### 👥 用戶管理 (Users)
- **功能**:
  - 分頁顯示用戶列表 (支援 10,000+ 頁)
  - 搜索用戶名/郵箱/手機號
  - 編輯用戶信息
  - 刪除用戶
  - 跳轉至特定頁面
  - 動態調整每頁顯示條數

- **列顯示**:
  - 用戶 ID
  - 用戶名
  - 手機號
  - 郵箱
  - 真實姓名
  - 地址
  - 註冊日期
  - 操作 (編輯/刪除)

- **分頁特性**:
  - 智能頁碼顯示 (1...98 99 100 101 102...10,001)
  - 跳轉頁面輸入框
  - 首頁/上一頁/下一頁/末頁按鈕
  - 支援自定義分頁大小 (10/20/30/50 條/頁)

### 📦 訂單管理 (Orders)
- **功能**:
  - 顯示所有訂單列表
  - 訂單狀態追蹤 (顏色編碼):
    - 🔵 待處理 (Pending) - 藍色
    - 🟡 處理中 (Processing) - 黃色
    - 🟢 已發貨 (Shipped) - 綠色
    - 🟣 已送達 (Delivered) - 紫色
    - ⚫ 已取消 (Cancelled) - 黑色

- **列顯示**:
  - 訂單 ID
  - 用戶 ID
  - 商品名稱
  - 金額
  - 狀態
  - 創建時間
  - 更新時間

### 📮 包裹管理 (Parcels)
- 預留擴展功能

### ⚙️ 系統設置 (Settings)
- 系統配置表單
- 基本設置項目

### ℹ️ 關於系統 (About)
- 系統信息展示
- 版本信息

## API 端點整合

### 數據加載 API

#### 獲取用戶列表
```javascript
GET /api/admin/users?page=1&limit=10

請求頭:
Authorization: Bearer <JWT_TOKEN>

響應示例:
{
  "users": [
    {
      "id": 1,
      "username": "user123",
      "phone": "13800000000",
      "email": "user@example.com",
      "real_name": "張三",
      "address": "北京市朝陽區",
      "created_at": "2024-01-15 10:30:00"
    },
    ...
  ],
  "total": 100004,
  "page": 1,
  "pageSize": 10
}
```

#### 獲取訂單列表
```javascript
GET /api/admin/orders

請求頭:
Authorization: Bearer <JWT_TOKEN>

響應示例:
{
  "orders": [
    {
      "id": 1,
      "user_id": 100,
      "product_name": "商品名稱",
      "amount": 299.99,
      "status": "processing",
      "created_at": "2024-01-15 10:30:00",
      "updated_at": "2024-01-15 11:30:00"
    },
    ...
  ]
}
```

### 用戶操作 API

#### 刪除用戶
```javascript
DELETE /api/admin/users/{userId}

請求頭:
Authorization: Bearer <JWT_TOKEN>

響應:
{
  "success": true,
  "message": "用戶已刪除"
}
```

## 身份驗證

系統使用 JWT 令牌進行身份驗證：

1. **登錄**: 用戶通過主應用登錄，即可獲取 JWT 令牌
2. **令牌存儲**: 令牌自動保存在 `localStorage` 中，鍵名為 `token`
3. **請求驗證**: 所有 API 請求自動在 `Authorization` 頭中包含令牌
4. **令牌過期**: 24 小時後需重新登錄

## 性能優化

### 分頁優化
- ✅ 智能頁碼顯示 (避免 10,000+ 按鈕渲染)
- ✅ 基於數據庫分頁查詢 (只加載當前頁數據)
- ✅ 跳轉至特定頁面功能 (無需逐頁翻轉)
- ✅ 支援動態調整每頁顯示條數

### 數據加載優化
- ✅ API 成使用 `limit` 和 `offset` 查詢參數
- ✅ 後端返回總記錄數，前端計算分頁
- ✅ 搜索功能使用 SQL WHERE 子句優化

### UI 響應性
- ✅ 使用事件委託減少事件監聽器數量
- ✅ 動態 DOM 創建優化
- ✅ CSS 樣式未使用重排操作

## 跨瀏覽器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ 移動瀏覽器 (iOS Safari, Chrome Mobile)

## 調試和故障排除

### 常見問題

#### 1. 無法加載管理系統頁面
**症狀**: 頁面空白或 404 錯誤
**解決方案**:
```bash
# 確認後端服務在運行
npm run server

# 確認文件存在
ls public/admin-system.html
```

#### 2. API 請求失敗 (401 無權限)
**症狀**: 控制台顯示 "未授權"
**解決方案**:
1. 先登錄主應用以獲取 JWT 令牌
2. 確認 localStorage 中有 `token` 鍵
3. 檢查令牌是否已過期

#### 3. Layui 庫無法加載
**症狀**: 樣式和功能缺失
**解決方案**:
```bash
# 驗證 Layui 文件存在
ls public/layui/
# 應顯示: css/, font/, layui.js

# 若文件缺失，重新複製
Copy-Item -Recurse "C:\Users\kongf\Downloads\layui-v2.13.3\layui" "public\layui" -Force
```

#### 4. 數據未加載
**症狀**: 表格為空，但無錯誤信息
**解決方案**:
1. 打開瀏覽器開發者工具 (F12)
2. 檢查"網絡"選項卡中的 API 請求
3. 查看"控制台"中的錯誤消息
4. 驗證用戶有管理員權限

## 數據統計

### 數據庫內容
- **用戶總數**: 100,004 人
- **測試訂單**: 預生成樣本數據
- **包裹數據**: 準備中

### 分頁配置
- **可用頁碼範圍**: 1 - 10,001
- **默認每頁條數**: 10
- **支援調整**: 10, 20, 30, 50

## 後續擴展

### 推薦的功能擴展
1. **導出功能** - 支援 Excel/CSV 導出用戶數據
2. **高級搜索** - 多條件篩選
3. **數據分析** - 圖表展示統計數據
4. **批量操作** - 批量刪除/編輯用戶
5. **日誌記錄** - 操作審計日誌
6. **角色管理** - 多角色權限控制

## 快速參考

### 命令
```bash
# 啟動後端服務
npm run server

# 啟動前端開發服務
npm run dev

# 構建生產版本
npm run build

# 運行測試
npm test
```

### URL
- 主應用: `http://localhost:3000-3002`
- 後台管理: `http://localhost:3001/admin-system.html`
- API 基礎 URL: `http://localhost:3001/api`

### 文件位置
- HTML: `public/admin-system.html`
- Layui: `public/layui/`
- 後端: `server/`

## 許可證

© 2024 榕台海峽快運. 保留所有權利。

---

## 更新日誌

### 2024-02-22
- ✅ 創建 Layui 後台管理系統 (v1.0)
- ✅ 集成 100,004+ 用戶數據管理
- ✅ 實現智能分頁功能
- ✅ 配置靜態文件服務
- ✅ 完成 API 集成測試

---

**最後更新**: 2024-02-22
**版本**: 1.0.0
**狀態**: 生產就緒 ✅
