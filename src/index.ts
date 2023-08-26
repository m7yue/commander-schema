import { Command, CommandOptions } from "commander";

type ICommandArgument = {
  /**
   * 参数名称, 如: appName
   */
  name: string;
  /**
   * 是否是必填项, 默认为 true
   */
  required?: boolean;
  /**
   * 参数描述
   */
  description?: string;
};

type ICommandSetting = {
  /**
   * 命令名称
   */
  name: string;
  /**
   * 别名
   */
  alias?: string;
  /**
   * 命令参数配置
   */
  args?: ICommandArgument[];
  commandOptions?: CommandOptions;
};

type IOptionArgument = {
  /**
   * 参数名称, 如: path
   */
  name: string;
  /**
   * 是否必填, 默认为 true
   */
  required?: boolean;
  /**
   * 是否是变长参数
   * 必填 <path...>
   * 非必填 [path...]
   */
  variadic?: boolean;
};

type IOption = {
  /**
   * 选项名称
   */
  name: string;
  /**
   * 选项名称简短表示
   */
  shortName?: string;
  /**
   * 选项参数
   */
  param?: IOptionArgument;
  /**
   * 选项是否必填, 默认为 false
   */
  required?: boolean;
  /**
   * 选项描述
   */
  description?: string;
  /**
   * 选项默认值
   */
  defaultValue?: string;
};

export type ActionMetaData = {
  args: string[];
  options: Record<string, string>;
};

export type CommandSchema = {
  /**
   * 命令配置
   */
  command: ICommandSetting;
  /**
   * 命令描述
   */
  description?: string;
  /**
   * 选项配置
   */
  options?: IOption[];
  /**
   * 处理器
   */
  action: (res: ActionMetaData) => void | Promise<void>;
  /**
   * 子命令
   */
  subCommands?: CommandSchema[];
};

type Enhancer = (name: string, cmd: Command) => void;

const handlerCommand = (commandSetting: ICommandSetting) => {
  const { name, args = [], alias } = commandSetting;

  let cmd = new Command(name)
    /**
     * 避免主子命令选项名冲突
     * 可以在命令和子命令中使用意义不同的同名选项
     */
    .enablePositionalOptions()
    /**
     * 不允许传入过多的参数
     */
    .allowExcessArguments(false);

  if (alias) {
    cmd = cmd.alias(alias);
  }

  for (let i = 0; i < args.length; i++) {
    const { name, required = true, description } = args[i];
    const template = required ? `<${name}>` : `[${name}]`;

    cmd = cmd.argument(template, description);
  }

  return cmd;
};

const handlerOptions = (program: Command, options: IOption[]) => {
  let cmd = program;

  const getFlag = (
    name: string,
    shortName?: string,
    param?: IOptionArgument
  ) => {
    const nameFlag = shortName ? `-${shortName}, --${name}` : `--${name}`;

    if (!param) {
      return nameFlag;
    } else {
      const { name: paramName, required = true, variadic } = param;
      const flag = `${paramName}${variadic ? "..." : ""}`;
      const paramFlag = required ? `<${flag}>` : `[${flag}]`;

      return `${nameFlag}${paramFlag ? " " + paramFlag : ""}`;
    }
  };

  for (let i = 0; i < options.length; i++) {
    const { name, shortName, param, description, required, defaultValue } =
      options[i];

    const flags = getFlag(name, shortName, param);

    if (required) {
      cmd = cmd.requiredOption(flags, description, defaultValue);
    } else {
      cmd = cmd.option(flags, description, defaultValue);
    }
  }

  return cmd;
};

/**
 * 返回 新的 command, 可以使用 addCommand 方法在任意命令直接进行主子链接
 * @param program
 * @param config
 * @param enhancer
 * @returns
 */
const createCommand = (config: CommandSchema, enhancer?: Enhancer) => {
  const { command, description, options = [], action, subCommands } = config;

  let cmd = handlerCommand(command);

  if (description) {
    cmd = cmd.description(description);
  }

  cmd = handlerOptions(cmd, options);

  cmd = cmd.action(() => {
    action({
      args: cmd.processedArgs,
      options: cmd.opts(),
    });
  });

  /**
   * 提供配置不适应场景下的增强器
   */
  if (enhancer) {
    enhancer(cmd.name(), cmd);
  }

  /**
   * 命中子命令，只会触发子命令的 action
   */
  if (subCommands) {
    for (let i = 0; i < subCommands.length; i++) {
      const subCommandSchema = subCommands[i];
      const sumCmd = createCommand(subCommandSchema, enhancer);

      cmd.addCommand(sumCmd, subCommandSchema.command.commandOptions);
    }
  }

  return cmd;
};

export { createCommand, Command };
