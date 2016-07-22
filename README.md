# 百度开放云-对象存储BOS-客户端

[![Build Status][travis-image]][travis-url]
[![Build Status][appveyor-image]][appveyor-url]
[![Coverage Status][coverage_img]][coverage_url]
[![Dependency Status][david_img]][david_site]
[![devDependency Status][david_dev_img]][david_dev_site]

![](./bce-logo.png)

## 安装

```bash
git clone https://github.com/mudio/bos.git bos-client
$ cd bos-client && npm install
```

## 运行

你必须在两个`Shell`窗口运行如下命令

```bash
$ npm run hot-server
$ npm run start-hot
```

或者运行单一命令

```bash
$ npm run dev
```

*Note: requires a node version >= 4 and an npm version >= 2.*

## 打包

```bash
$ npm run package
```

打包所有平台，目前支持：`MaxOS`、`Linux`、`Windows`

```bash
$ npm run package-all
```

*Note: OSX 系统需要`Wine`, `XQuartz`支持*

#### 配置参数

- --name, -n: Application name (default: BOS)
- --version, -v: Electron version (default: latest version)
- --asar, -a: [asar](https://github.com/atom/asar) support (default: false)
- --icon, -i: Application icon
- --all: pack for all platforms

我们使用 `electron-packager` 去打包应用程序，如果指定`--all`参数我们会打包所有平台，运行命令后你会找到你的二进制程序在`release`文件夹,具体打包参数参考`package.js`

## 开发者工具

#### Toggle Chrome DevTools

- OS X: <kbd>Cmd</kbd> <kbd>Alt</kbd> <kbd>I</kbd> or <kbd>F12</kbd>
- Linux: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>
- Windows: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>

*See [electron-debug](https://github.com/sindresorhus/electron-debug) for more information.*

#### Redux DevTools

We used [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension), you can find the `Redux` tab on Chrome DevTools.

## CSS 模块处理

我们处理所有`.css`文件，使用[css-modules](https://github.com/css-modules/css-modules)，详见`Webpack Config`,如果扩展名为`.global.css`我们不会进行转化，自行注意命名冲突问题。

## Image 模块处理

我们会把所有`.png`文件,使用[url-loader](https://github.com/webpack/url-loader)转换成`Base64`编码的`Url`

## 一起意外的情况

如果不想使用`Webpack`打包的模块，参考如下配置：`webpack.config.base.js`：

```javascript
externals: [
  // put your node 3rd party libraries which can't be built with webpack here (mysql, mongodb, and so on..)
]
```

## Maintainers

- [木休大人](https://github.com/mudio)

## Thanks
- [Electron](http://electron.atom.io/)
- [React](https://facebook.github.io/react/)
- [Redux](https://github.com/reactjs/redux)
- [React Router](https://github.com/reactjs/react-router)
- [Webpack](http://webpack.github.io/docs/)
- [React Transform HMR](https://github.com/gaearon/react-transform-hmr)
- [boilerplate](https://github.com/chentsulin/electron-react-boilerplate)

## License
MIT © [木休大人](https://github.com/mudio)

[travis-url]: https://travis-ci.org/mudio/bos
[travis-image]: https://img.shields.io/travis/mudio/bos/master.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSItMTQyLjUgLTE0Mi41IDI4NSAyODUiPjxjaXJjbGUgcj0iMTQxLjciIGZpbGw9IiNERDQ4MTQiLz48ZyBpZD0iYSIgZmlsbD0iI0ZGRiI%2BPGNpcmNsZSBjeD0iLTk2LjQiIHI9IjE4LjkiLz48cGF0aCBkPSJNLTQ1LjYgNjguNGMtMTYuNi0xMS0yOS0yOC0zNC00Ny44IDYtNSA5LjgtMTIuMyA5LjgtMjAuNnMtMy44LTE1LjctOS44LTIwLjZjNS0xOS44IDE3LjQtMzYuNyAzNC00Ny44bDEzLjggMjMuMkMtNDYtMzUuMi01NS4zLTE4LjctNTUuMyAwYzAgMTguNyA5LjMgMzUuMiAyMy41IDQ1LjJ6Ii8%2BPC9nPjx1c2UgeGxpbms6aHJlZj0iI2EiIHRyYW5zZm9ybT0icm90YXRlKDEyMCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiB0cmFuc2Zvcm09InJvdGF0ZSgyNDApIi8%2BPC9zdmc%2B

[appveyor-url]: https://ci.appveyor.com/project/mudio/bos
[appveyor-image]: https://img.shields.io/appveyor/ci/mudio/bos/master.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48ZyBmaWxsPSIjMUJBMUUyIiB0cmFuc2Zvcm09InNjYWxlKDgpIj48cGF0aCBkPSJNMCAyLjI2NWw2LjUzOS0uODg4LjAwMyA2LjI4OC02LjUzNi4wMzd6Ii8%2BPHBhdGggZD0iTTYuNTM2IDguMzlsLjAwNSA2LjI5My02LjUzNi0uODk2di01LjQ0eiIvPjxwYXRoIGQ9Ik03LjMyOCAxLjI2MWw4LjY3LTEuMjYxdjcuNTg1bC04LjY3LjA2OXoiLz48cGF0aCBkPSJNMTYgOC40NDlsLS4wMDIgNy41NTEtOC42Ny0xLjIyLS4wMTItNi4zNDV6Ii8%2BPC9nPjwvc3ZnPg==

[david_img]: https://david-dm.org/mudio/bos.svg
[david_site]: https://david-dm.org/mudio/bos

[david_dev_img]: https://david-dm.org/mudio/bos/dev-status.svg
[david_dev_site]: https://david-dm.org/mudio/bos#info=devDependencies

[coverage_url]: https://coveralls.io/github/mudio/bos
[coverage_img]: https://coveralls.io/repos/github/mudio/bos/badge.svg
