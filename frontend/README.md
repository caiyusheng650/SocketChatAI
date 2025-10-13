# Labixiaoxin 智能对话平台前端


## 项目概述
基于React的智能对话平台前端，提供响应式用户界面、实时消息展示和对话管理功能，支持Markdown渲染和流式响应。

## 技术栈
- React 18 
- Axios HTTP客户端

## 环境要求
- Node.js 16+
- Chrome 

## 快速开始

In the project directory, you can run:


Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## 核心功能
```tsx
// 实时消息组件示例
<ChatStream>
  {(messages) => messages.map(msg => (
    <MessageBubble
      key={msg.id}
      content={msg.content}
      isAI={msg.sender === 'AI'}
    />
  ))}
</ChatStream>
```

## 状态管理
```mermaid
flowchart LR
  UI -->|事件| Zustand存储
  Zustand存储 -->|更新| API服务
  API服务 -->|响应| Websocket
  Websocket -->|推送| Zustand存储
```

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## 开发指南

### 组件开发
```powershell
npm run storybook  # 启动组件文档系统
```

### 代码规范
```powershell
npm run lint      # ESLint检查
npm run format    # Prettier格式化
```

## 贡献协议
请阅读 [贡献指南](./CONTRIBUTING.md) 并签署 [CLA协议](./CLA.md)

## 许可证
[MIT License](LICENSE)

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
