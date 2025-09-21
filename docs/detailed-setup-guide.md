# WALLY! isHERE! - AI Training Game - 超详细设置指南

## 📋 目录
1. [系统要求检查](#系统要求检查)
2. [软件安装](#软件安装)
3. [项目下载与设置](#项目下载与设置)
4. [依赖安装](#依赖安装)
5. [环境配置](#环境配置)
6. [数据库设置（可选）](#数据库设置可选)
7. [启动项目](#启动项目)
8. [验证功能](#验证功能)
9. [常见问题解决](#常见问题解决)
10. [高级配置](#高级配置)

---

## 系统要求检查

### 第一步：检查操作系统
**支持的操作系统：**
- Windows 10/11
- macOS 10.15+
- Ubuntu 18.04+
- 其他现代Linux发行版

**检查方法：**
```bash
# Windows
winver

# macOS
sw_vers

# Linux
lsb_release -a
```

### 第二步：检查硬件要求
**最低要求：**
- RAM: 4GB（推荐8GB）
- 存储空间: 1GB可用空间
- 网络: 稳定的互联网连接（用于下载AI模型）

**检查方法：**
```bash
# Windows (PowerShell)
Get-ComputerInfo | Select-Object TotalPhysicalMemory

# macOS/Linux
free -h
df -h
```

---

## 软件安装

### 第一步：安装Node.js

**1.1 下载Node.js**
- 访问：https://nodejs.org/
- 选择LTS版本（推荐18.x或更高版本）
- 下载对应操作系统的安装包

**1.2 安装Node.js**

**Windows:**
```
1. 双击下载的.msi文件
2. 点击"Next"继续
3. 接受许可协议
4. 选择安装路径（默认即可）
5. 确保勾选"Add to PATH"选项
6. 点击"Install"开始安装
7. 安装完成后重启命令提示符
```

**macOS:**
```
1. 双击下载的.pkg文件
2. 按照安装向导完成安装
3. 或使用Homebrew: brew install node
```

**Linux (Ubuntu/Debian):**
```bash
# 更新包管理器
sudo apt update

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 或使用snap
sudo snap install node --classic
```

**1.3 验证安装**
```bash
# 检查Node.js版本（应该显示18.x或更高）
node --version

# 检查npm版本
npm --version

# 如果显示版本号，说明安装成功
```

### 第二步：安装Git

**2.1 下载Git**
- 访问：https://git-scm.com/downloads
- 选择对应操作系统的版本

**2.2 安装Git**

**Windows:**
```
1. 双击下载的.exe文件
2. 选择安装路径
3. 选择组件（保持默认选择）
4. 选择默认编辑器（推荐VS Code）
5. 选择PATH环境（推荐"Git from the command line and also from 3rd-party software"）
6. 选择HTTPS传输后端（推荐OpenSSL）
7. 配置行结束符转换（推荐"Checkout Windows-style, commit Unix-style"）
8. 选择终端模拟器（推荐MinTTY）
9. 完成安装
```

**macOS:**
```bash
# 使用Homebrew安装
brew install git

# 或从官网下载安装包
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install git

# CentOS/RHEL
sudo yum install git
```

**2.3 验证Git安装**
```bash
git --version
# 应该显示git版本号
```

**2.4 配置Git（首次使用）**
```bash
# 设置用户名
git config --global user.name "Your Name"

# 设置邮箱
git config --global user.email "your.email@example.com"

# 验证配置
git config --list
```

### 第三步：安装代码编辑器（推荐）

**3.1 安装Visual Studio Code**
- 访问：https://code.visualstudio.com/
- 下载并安装对应版本

**3.2 安装有用的扩展**
```
1. 打开VS Code
2. 点击左侧扩展图标（或按Ctrl+Shift+X）
3. 搜索并安装以下扩展：
   - ES7+ React/Redux/React-Native snippets
   - TypeScript Importer
   - Prettier - Code formatter
   - Auto Rename Tag
   - Bracket Pair Colorizer
```

---

## 项目下载与设置

### 第一步：创建项目文件夹

**1.1 选择项目位置**
```bash
# Windows
cd C:\Users\YourUsername\Documents
mkdir Projects
cd Projects

# macOS/Linux
cd ~/Documents
mkdir Projects
cd Projects
```

### 第二步：克隆项目

**2.1 克隆仓库**
```bash
# 替换为实际的仓库URL
git clone https://github.com/yourusername/wally-ishere-ai-game.git

# 进入项目目录
cd wally-ishere-ai-game
```

**2.2 验证项目结构**
```bash
# 查看项目文件
ls -la

# 应该看到以下文件和文件夹：
# - src/
# - public/
# - package.json
# - README.md
# - .env.example
# - 等等
```

---

## 依赖安装

### 第一步：清理npm缓存（预防措施）

```bash
# 清理npm缓存
npm cache clean --force

# 验证缓存已清理
npm cache verify
```

### 第二步：安装项目依赖

**2.1 安装所有依赖**
```bash
# 在项目根目录执行
npm install

# 这个过程可能需要5-10分钟，取决于网络速度
# 你会看到类似以下的输出：
# npm WARN deprecated ...
# added 1234 packages from 567 contributors and audited 1234 packages in 45.678s
```

**2.2 验证安装**
```bash
# 检查node_modules文件夹是否创建
ls -la node_modules

# 检查package-lock.json是否生成
ls -la package-lock.json
```

**2.3 安装可能缺失的全局包**
```bash
# 安装TypeScript（如果需要）
npm install -g typescript

# 安装Vite（如果需要）
npm install -g vite
```

### 第三步：处理依赖问题（如果出现）

**3.1 如果出现权限错误（Linux/macOS）**
```bash
# 修复npm权限
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**3.2 如果出现网络错误**
```bash
# 使用淘宝镜像（中国用户）
npm config set registry https://registry.npm.taobao.org

# 重新安装
rm -rf node_modules package-lock.json
npm install
```

**3.3 如果出现版本冲突**
```bash
# 强制安装
npm install --force

# 或者使用legacy-peer-deps
npm install --legacy-peer-deps
```

---

## 环境配置

### 第一步：创建环境变量文件

**1.1 复制示例文件**
```bash
# 复制.env.example到.env
cp .env.example .env

# Windows用户可以使用
copy .env.example .env
```

**1.2 编辑.env文件**
```bash
# 使用VS Code打开
code .env

# 或使用其他编辑器
nano .env
# 或
vim .env
```

**1.3 基本配置（本地模式）**
```env
# 基本配置 - 项目可以在没有Supabase的情况下运行
VITE_APP_NAME=WALLY! isHERE! AI Game
VITE_APP_VERSION=1.0.0

# Supabase配置（可选 - 如果不配置，系统将使用本地模式）
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 第二步：验证环境配置

**2.1 检查文件内容**
```bash
# 查看.env文件内容
cat .env

# 确保文件存在且包含必要的变量
```

---

## 数据库设置（可选）

> **注意：** 这一步是可选的。如果跳过，项目将在本地模式下运行，功能稍有限制但仍然完全可用。

### 第一步：创建Supabase账户

**1.1 注册Supabase**
```
1. 访问 https://supabase.com/
2. 点击"Start your project"
3. 使用GitHub、Google或邮箱注册
4. 验证邮箱（如果需要）
```

**1.2 创建新项目**
```
1. 登录后点击"New Project"
2. 选择组织（或创建新组织）
3. 填写项目信息：
   - Name: wally-ishere-ai-game
   - Database Password: 创建强密码（记住这个密码）
   - Region: 选择最近的区域
4. 点击"Create new project"
5. 等待项目创建（约2-3分钟）
```

### 第二步：获取项目凭据

**2.1 获取项目URL和API密钥**
```
1. 项目创建完成后，进入项目仪表板
2. 点击左侧菜单的"Settings"
3. 点击"API"
4. 复制以下信息：
   - Project URL
   - anon public key
```

**2.2 更新.env文件**
```env
# 更新.env文件中的Supabase配置
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 第三步：设置数据库架构

**3.1 运行数据库迁移**
```
1. 在Supabase仪表板中，点击"SQL Editor"
2. 点击"New query"
3. 复制项目中的SQL迁移文件内容：
   - 打开 supabase/migrations/20250912071952_black_smoke.sql
   - 复制所有内容
4. 粘贴到SQL编辑器中
5. 点击"Run"执行SQL
```

**3.2 验证数据库设置**
```
1. 点击左侧菜单的"Table Editor"
2. 应该看到以下表：
   - training_sessions
   - annotations
   - training_jobs
   - model_predictions
```

---

## 启动项目

### 第一步：启动开发服务器

**1.1 启动命令**
```bash
# 在项目根目录执行
npm run dev

# 你应该看到类似以下输出：
# VITE v4.x.x ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

**1.2 验证服务器启动**
```bash
# 检查端口是否被占用
netstat -an | grep 5173

# 或使用lsof（macOS/Linux）
lsof -i :5173
```

### 第二步：打开浏览器

**2.1 访问应用**
```
1. 打开现代浏览器（Chrome、Firefox、Safari、Edge）
2. 访问：http://localhost:5173
3. 等待应用加载（首次加载可能需要30-60秒下载AI模型）
```

**2.2 检查浏览器控制台**
```
1. 按F12打开开发者工具
2. 点击"Console"标签
3. 查看是否有错误信息
4. 正常情况下应该看到：
   - "🤖 Loading MobileNet model..."
   - "✅ TensorFlow.js backend initialized"
   - "✅ MobileNet loaded successfully!"
```

---

## 验证功能

### 第一步：基本功能测试

**1.1 界面检查**
```
验证以下元素是否正确显示：
□ Wally游戏标题和Logo
□ 当前等级显示（Level 1）
□ 训练图片区域
□ 测试图片区域
□ 信心度量表
□ 导航按钮
```

**1.2 图片加载测试**
```
□ 训练图片正确加载
□ 测试图片正确加载
□ 图片清晰可见
□ 没有破损的图片链接
```

### 第二步：交互功能测试

**2.1 标注功能测试**
```
1. 在训练图片上点击并拖拽
2. 应该看到红色虚线边框
3. 释放鼠标后边框变为实线
4. 点击"No Wally Here"按钮
5. 验证自动切换到下一张图片
```

**2.2 AI训练测试**
```
1. 标注3张或更多图片
2. 观察信心度量表的红球移动
3. 查看测试图片区域的变化
4. 验证AI开始给出预测结果
```

### 第三步：数据库功能测试（如果配置了Supabase）

**3.1 数据存储测试**
```
1. 在Supabase仪表板中查看"Table Editor"
2. 检查annotations表是否有新记录
3. 验证数据正确存储
```

**3.2 用户认证测试**
```
1. 检查浏览器控制台
2. 查看是否显示"✅ Supabase training session created successfully"
3. 或"❌ User not authenticated, falling back to simulation mode"
```

---

## 常见问题解决

### 问题1：Node.js版本不兼容

**症状：**
```
Error: Node version not supported
```

**解决方案：**
```bash
# 检查Node.js版本
node --version

# 如果版本低于18，需要升级
# 方法1：重新下载安装最新版本
# 方法2：使用nvm管理版本

# 安装nvm（Linux/macOS）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重启终端后安装最新Node.js
nvm install node
nvm use node
```

### 问题2：npm安装失败

**症状：**
```
npm ERR! code EACCES
npm ERR! permission denied
```

**解决方案：**
```bash
# Linux/macOS权限修复
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Windows以管理员身份运行命令提示符
# 右键点击"命令提示符" -> "以管理员身份运行"

# 清理并重新安装
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 问题3：端口被占用

**症状：**
```
Error: Port 5173 is already in use
```

**解决方案：**
```bash
# 查找占用端口的进程
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID号> /F

# macOS/Linux
lsof -ti:5173 | xargs kill -9

# 或使用不同端口启动
npm run dev -- --port 3000
```

### 问题4：AI模型加载失败

**症状：**
```
❌ Failed to load MobileNet
```

**解决方案：**
```bash
# 检查网络连接
ping google.com

# 清理浏览器缓存
# Chrome: Ctrl+Shift+Delete -> 清除缓存

# 检查防火墙设置
# 确保允许浏览器访问网络

# 尝试使用VPN（如果在中国）
```

### 问题5：图片无法显示

**症状：**
- 图片显示为破损图标
- 控制台显示404错误

**解决方案：**
```bash
# 检查图片文件是否存在
ls -la src/assets/

# 验证图片路径是否正确
# 检查src/utils/gameData.ts中的图片导入

# 如果图片缺失，需要添加图片文件到assets文件夹
```

### 问题6：Supabase连接失败

**症状：**
```
❌ Failed to create training session
```

**解决方案：**
```bash
# 检查.env文件配置
cat .env

# 验证Supabase URL和密钥格式
# URL应该类似：https://xxx.supabase.co
# 密钥应该是长字符串

# 在Supabase仪表板验证项目状态
# 确保项目处于活跃状态

# 检查数据库表是否正确创建
```

---

## 高级配置

### 第一步：性能优化

**1.1 浏览器优化**
```
Chrome设置：
1. 地址栏输入：chrome://flags/
2. 搜索"WebGL"
3. 启用"WebGL 2.0"
4. 重启浏览器

Firefox设置：
1. 地址栏输入：about:config
2. 搜索"webgl.force-enabled"
3. 设置为true
```

**1.2 内存优化**
```javascript
// 在浏览器控制台中监控内存使用
console.log('Memory usage:', performance.memory);

// 启用详细日志
localStorage.setItem('debug', 'true');
// 刷新页面查看详细日志
```

### 第二步：开发环境配置

**2.1 安装开发工具**
```bash
# 安装React开发者工具
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

# 安装Redux DevTools（如果使用Redux）
# Chrome扩展商店搜索"Redux DevTools"
```

**2.2 配置代码格式化**
```bash
# 安装Prettier
npm install --save-dev prettier

# 创建.prettierrc文件
echo '{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}' > .prettierrc

# 格式化代码
npx prettier --write src/
```

### 第三步：生产环境构建

**3.1 构建项目**
```bash
# 创建生产版本
npm run build

# 检查构建输出
ls -la dist/

# 预览生产版本
npm run preview
```

**3.2 部署准备**
```bash
# 检查构建大小
du -sh dist/

# 测试生产版本功能
# 访问预览URL并测试所有功能
```

---

## 🎉 完成设置

恭喜！如果您已经完成了以上所有步骤，您的WALLY! isHERE! AI Training Game现在应该已经完全设置好并正常运行了。

### 最终检查清单：

- [ ] Node.js 18+已安装并验证
- [ ] Git已安装并配置
- [ ] 项目已克隆到本地
- [ ] 所有依赖已安装（npm install成功）
- [ ] 环境变量已配置（.env文件存在）
- [ ] 开发服务器启动成功（npm run dev）
- [ ] 浏览器可以访问http://localhost:5173
- [ ] AI模型加载成功（控制台显示成功消息）
- [ ] 图片正确显示
- [ ] 标注功能正常工作
- [ ] 信心度量表正常更新
- [ ] 数据库连接正常（如果配置了Supabase）

### 开始使用：

1. 在训练图片上寻找Wally并绘制边界框
2. 如果图片中没有Wally，点击"No Wally Here"
3. 观察AI信心度的提升
4. 当信心度达到85%以上时，进入下一关

享受您的AI训练之旅！🔍👓