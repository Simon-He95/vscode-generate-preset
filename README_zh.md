<p align="center">
<img height="200" src="./assets/kv.png" alt="generate preset">
</p>
<p align="center"> <a href="./README.md">English</a> | 简体中文</p>

配置预设的模板，然后加入到右键当中，作为一个快捷创建文件的方式，可以自己配置 user snippet 下的 template.code-snippets 去配置新的模板创建，[key]: 对应文件名和展示的下拉选项，[value]: 对应字符串的模板（建议通过插件提供的 Add Preset 来添加预设，因为通过 json 读取，没办法使用模板字符串，直接改配置文件不方便）

## Usages
选择文件目录右键，可以看到 `Preset`, 移动到 `Preset` 上会有添加模板 `Add Preset`, 删除模板 `Delete Preset`, 和选择模板 `Select Preset`, 默认模板中会含有 tailwind.config 和 unocss.config 的配置，你可以随意添加一些你开发中的模板作为快捷方式创建文件

![demo](/assets/demo.gif)

## :coffee:

[请我喝一杯咖啡](https://github.com/Simon-He95/sponsor)

## License

[MIT](./license)
