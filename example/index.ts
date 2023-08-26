import { createCommand, CommandSchema, Command } from '../lib'

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