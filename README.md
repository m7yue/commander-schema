# commander-schema

> commander 配置化使用工具

## 类型
```ts
type ICommandArgument = {
  /**
   * 参数名称, 如: appName
   */
  name: string
  /**
   * 是否是必填项, 默认为 true
   */
  required?: boolean
  /**
   * 参数描述
   */
  description?: string
}

type ICommandSetting = {
  /**
   * 命令名称
   */
  name: string
  /**
   * 别名
   */
  alias?: string
  /**
   * 命令参数配置
   */
  args?: ICommandArgument[]
  commandOptions?: CommandOptions
}

type IOptionArgument = {
  /**
   * 参数名称, 如: path
   */
  name: string
  /**
  * 是否必填, 默认为 true
  */
  required?: boolean
  /**
   * 是否是变长参数
   * 必填 <path...>
   * 非必填 [path...]
   */
  variadic?: boolean
}

type IOption = {
  /**
   * 选项名称
   */
  name: string
  /**
   * 选项名称简短表示
   */
  shortName?: string
  /**
   * 选项参数
   */
  param?: IOptionArgument
  /**
   * 选项是否必填, 默认为 false
   */
  required?: boolean
  /**
   * 选项描述
   */
  description?: string
  /**
   * 选项默认值
   */
  defaultValue?: string
}

export type ActionMetaData = {
  args: string[]
  options: Record<string, string>
}

export type CommandSchema = {
  /**
   * 命令配置
   */
  command: ICommandSetting
  /**
   * 命令描述
   */
  description?: string
  /**
   * 选项配置
   */
  options?: IOption[],
  /**
   * 处理器
   */
  action: (res: ActionMetaData) => void | Promise<void>
  /**
   * 子命令
   */
  subCommands?: CommandSchema[]
}

type Enhancer = (name: string, cmd: Command) => void
```

## 使用方式
- `createCommand`: 创建命令，返回命令对象。可以使用 `addCommand` 方法在任意命令直接进行主子链接, 聚合命令系统。第一个参数为 `CommandSchema` 配置。 对于配置不使用的场景，可以通过传入第二个参数 `enhancer: Enhancer` 进行补充增强。
- `Command`: 即 commander 的 Command。
- `CommandSchema`: 配置类型。

```ts
// file: example/index.ts

import { createCommand, CommandSchema, Command } from 'commander-schema'

export const myGitCmdSchema: CommandSchema = {
  command: {
    name: 'my-git',
    args: [
      {
        name: 'commit',
        required: true,
        description: '提交更改'
      }
    ]
  },
  description: '自己的 git',
  options: [
    {
      name: 'message',
      shortName: 'm',
      description: '描述提交',
      param: {
        name: 'msg-input',
        required: true
      }
    }
  ],
  action(input) {
    const { args, options } = input
    console.log(args, options)
  }
}


const program = new Command()

const cmd = createCommand(myGitCmdSchema, (name, cmd) => {
  // 提供配置不适应场景下的增强器
})

program.addCommand(cmd)

program.parse(process.argv)
```
### 效果
```sh
# npx ts-node example/index.ts my-git -h

Usage: index my-git [options] <commit>

自己的 git

Arguments:
  commit                     提交更改

Options:
  -m, --message <msg-input>  描述提交
  -h, --help                 display help for command


# npx ts-node index.ts my-git -m 'your commit message' 
# 打印：[ 'commit' ] { message: 'your commit message' }
```